"""
End-to-end Playwright test — PDF export after reload.

Verifies:
  1. User can enter right-issue parameters and calculate
  2. After a full page reload, form + results re-hydrate from localStorage
  3. Clicking Export PDF > "Ringkas" (compact) triggers a real download
  4. The downloaded PDF is a valid PDF file
  5. The extracted PDF text contains the expected calculation values
     (stock code, lot allocation, TERP, exercise price)

How to run (from repo root, dev server must be on http://localhost:8080):
    python3 tests/e2e/pdf-export.spec.py

Exits non-zero if any assertion fails. Screenshots + the downloaded PDF
and its extracted text are saved under /tmp/browser/pdf-export/ for
post-mortem inspection.
"""
import asyncio
import subprocess
import sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:8080/"
OUT = Path("/tmp/browser/pdf-export")
OUT.mkdir(parents=True, exist_ok=True)

# Deterministic inputs (mirrors right-issue-flow.spec.py).
STOCK_CODE = "BRIS"
RATIO_OLD = "5"
RATIO_NEW = "2"
RIGHT_PRICE = "2500"
CURRENT_LOT = "10"
AVG_PRICE = "3000"
# The app defaults to "simple" view mode; cum-date-price is hidden and
# auto-derived as rightPrice * 1.3 → 2500 * 1.3 = 3250.
# TERP = (3250*5 + 2500*2) / 7 = 21250 / 7 = 3035.7... → rounded to 3036.

# Expected substrings in the extracted compact-PDF text.
# Derived from the inputs above:
#   Hak Lot Baru = 10 * 2/5 = 4 lot   → 400 shares
#   TERP         = (3000*5 + 2500*2) / 7 = 2857
#   Dana Dibutuhkan = 400 * 2500 = 1.000.000
EXPECTED_PDF_SUBSTRINGS = [
    "Right Issue Calculator",  # Report title
    STOCK_CODE,                # Stock code in header
    "Rasio RI",                # Input label
    "5:2",                     # Rendered ratio
    "4 lot",                   # Hak Lot Baru (RI allocation)
    "Rp 3.036",                # TERP, id-ID formatted
    "Rp 2.500",                # Harga Pelaksanaan
    "Rp 3.250",                # Harga Cum Date (auto-derived in simple mode)
    "Rp 3.000",                # Harga Rata-rata (currentAvgPrice)
    "Rp 1.000.000",            # Dana Dibutuhkan = 400 shares * 2500
]


def assert_true(cond, msg):
    if not cond:
        print(f"FAIL: {msg}")
        sys.exit(1)
    print(f"OK:   {msg}")


async def dismiss_onboarding(page):
    try:
        await page.get_by_role("button", name="Lewati").click(timeout=1500)
    except Exception:
        pass


async def fill_form(page):
    text_inputs = page.locator("input[type=text]")
    await text_inputs.nth(0).fill(STOCK_CODE)
    await text_inputs.nth(1).fill(RATIO_OLD)
    await text_inputs.nth(2).fill(RATIO_NEW)
    await page.locator("#right-price").fill(RIGHT_PRICE)
    await text_inputs.nth(4).fill(CURRENT_LOT)
    await page.locator("#current-avg-price").fill(AVG_PRICE)


async def click_calculate(page):
    hitung = page.get_by_role("button", name="Hitung").first
    await hitung.wait_for(state="visible")
    await page.wait_for_function(
        "() => [...document.querySelectorAll('button')]"
        ".some(b => b.innerText.trim()==='Hitung' && !b.disabled)",
        timeout=5000,
    )
    await hitung.click()
    await page.wait_for_timeout(1200)


async def trigger_pdf_download(page):
    """Open Export PDF menu and click 'Ringkas' — return the downloaded file path."""
    trigger = page.get_by_role("button", name="Export PDF").first
    await trigger.wait_for(state="visible", timeout=5000)
    await trigger.click()

    # Radix DropdownMenu renders the item as role=menuitem.
    ringkas = page.get_by_role("menuitem").filter(has_text="Ringkas").first
    await ringkas.wait_for(state="visible", timeout=3000)

    async with page.expect_download(timeout=15000) as dl_info:
        await ringkas.click()
    download = await dl_info.value

    dest = OUT / download.suggested_filename
    await download.save_as(str(dest))
    return dest


def extract_pdf_text(pdf_path):
    """Extract text from a PDF using poppler's pdftotext."""
    out_txt = pdf_path.with_suffix(".txt")
    subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), str(out_txt)],
        check=True,
        capture_output=True,
    )
    return out_txt.read_text(encoding="utf-8", errors="replace")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # accept_downloads is on by default, but be explicit.
        context = await browser.new_context(
            viewport={"width": 1280, "height": 1800},
            accept_downloads=True,
        )
        page = await context.new_page()

        # ---- Step 1: initial load + calculate ----
        await page.goto(BASE_URL, wait_until="domcontentloaded")
        # Clear localStorage so leftover state from previous test runs cannot
        # bleed into this scenario (form persistence, history, etc.).
        await page.evaluate("() => { try { window.localStorage.clear(); } catch (_) {} }")
        await page.reload(wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await dismiss_onboarding(page)
        await fill_form(page)
        await click_calculate(page)
        await page.screenshot(path=str(OUT / "01_results.png"))

        # ---- Step 2: reload — verify persistence + auto-recalc ----
        await page.reload(wait_until="domcontentloaded")
        await page.wait_for_timeout(1800)
        await dismiss_onboarding(page)
        await page.wait_for_timeout(500)
        await page.screenshot(path=str(OUT / "02_after_reload.png"))

        body_after_reload = await page.evaluate("() => document.body.innerText")
        assert_true("4 lot" in body_after_reload, "Jatah 4 lot re-rendered after reload")
        assert_true("14 lot" in body_after_reload, "Total 14 lot re-rendered after reload")
        assert_true(
            "Terjadi kesalahan" not in body_after_reload,
            "No ErrorBoundary fallback after reload",
        )

        # ---- Step 3: trigger PDF export from the reloaded state ----
        pdf_path = await trigger_pdf_download(page)
        await page.screenshot(path=str(OUT / "03_after_download.png"))

        assert_true(pdf_path.exists(), f"PDF was saved to {pdf_path}")
        assert_true(pdf_path.stat().st_size > 2000, "Downloaded PDF is not empty (>2 KB)")

        # Verify filename encodes the stock code + today's date (yyyy-mm-dd shape).
        name = pdf_path.name
        assert_true(name.startswith("RI_"), f"PDF filename starts with 'RI_' (got {name})")
        assert_true(STOCK_CODE in name, f"PDF filename contains stock code (got {name})")
        assert_true(name.endswith(".pdf"), f"PDF filename ends with .pdf (got {name})")

        # Verify PDF magic bytes.
        with pdf_path.open("rb") as fh:
            header = fh.read(5)
        assert_true(header == b"%PDF-", f"File has PDF magic bytes (got {header!r})")

        # ---- Step 4: extract text and assert calculation values are present ----
        text = extract_pdf_text(pdf_path)
        # Normalize non-breaking spaces to regular spaces for substring checks.
        text_norm = text.replace("\u00a0", " ")

        for needle in EXPECTED_PDF_SUBSTRINGS:
            assert_true(
                needle in text_norm,
                f"Extracted PDF text contains '{needle}'",
            )

        await browser.close()
        print(f"\nAll E2E assertions passed. PDF: {pdf_path}")


if __name__ == "__main__":
    asyncio.run(main())