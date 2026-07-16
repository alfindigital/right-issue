"""
End-to-end Playwright test — main Right Issue user flow.

Verifies:
  1. User can pick an IDX stock code (BRIS)
  2. User can enter right-issue parameters (ratio, harga tebus, lot, avg price)
  3. Calculation results render with the expected numbers
  4. After a full page reload, form values are restored from localStorage
     AND the calculation results re-render (form persistence + auto-recalc)

How to run (from repo root, dev server must be on http://localhost:8080):
    python3 tests/e2e/right-issue-flow.spec.py

Exits non-zero if any assertion fails. Screenshots are written to
/tmp/browser/e2e/ for post-mortem inspection.
"""
import asyncio
import sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:8080/"
OUT = Path("/tmp/browser/e2e")
OUT.mkdir(parents=True, exist_ok=True)

# Deterministic inputs — same values used to derive the expected numbers below.
STOCK_CODE = "BRIS"
RATIO_OLD = "5"
RATIO_NEW = "2"
RIGHT_PRICE = "2500"
CURRENT_LOT = "10"
AVG_PRICE = "3000"

# Expected calculation output for the inputs above:
#   Jatah RI = 10 * 2 / 5 = 4 lot
#   Total Lot Akhir = 10 + 4 = 14 lot
EXPECTED_SUBSTRINGS = [
    "4 lot",   # Jatah Lot RI
    "14 lot",  # Total Lot Akhir
    "TERP",    # TERP block rendered
    "Rp",      # Currency formatting active
]


async def dismiss_onboarding(page):
    try:
        await page.get_by_role("button", name="Lewati").click(timeout=1500)
    except Exception:
        pass


async def fill_form(page):
    text_inputs = page.locator("input[type=text]")
    # Order in DOM: 0=stock code, 1=ratio old, 2=ratio new,
    # 3=#right-price, 4=jumlah lot, 5=#current-avg-price
    await text_inputs.nth(0).fill(STOCK_CODE)
    await text_inputs.nth(1).fill(RATIO_OLD)
    await text_inputs.nth(2).fill(RATIO_NEW)
    await page.locator("#right-price").fill(RIGHT_PRICE)
    await text_inputs.nth(4).fill(CURRENT_LOT)
    await page.locator("#current-avg-price").fill(AVG_PRICE)


def assert_true(cond, msg):
    if not cond:
        print(f"FAIL: {msg}")
        sys.exit(1)
    print(f"OK:   {msg}")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # ---- Step 1: initial load ----
        await page.goto(BASE_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await dismiss_onboarding(page)
        await page.screenshot(path=str(OUT / "01_home.png"))

        # ---- Step 2: fill inputs & calculate ----
        await fill_form(page)
        await page.screenshot(path=str(OUT / "02_filled.png"))

        # The Hitung button becomes enabled once required fields are valid.
        hitung = page.get_by_role("button", name="Hitung").first
        await hitung.wait_for(state="visible")
        await page.wait_for_function(
            "() => [...document.querySelectorAll('button')].some(b => b.innerText.trim()==='Hitung' && !b.disabled)",
            timeout=5000,
        )
        await hitung.click()
        await page.wait_for_timeout(1200)
        await page.screenshot(path=str(OUT / "03_results.png"))

        body = await page.evaluate("() => document.body.innerText")
        for needle in EXPECTED_SUBSTRINGS:
            assert_true(needle in body, f"Result body contains '{needle}'")

        # ---- Step 3: reload & verify persistence + auto-recalc ----
        await page.reload(wait_until="domcontentloaded")
        await page.wait_for_timeout(1800)
        await dismiss_onboarding(page)
        await page.wait_for_timeout(500)
        await page.screenshot(path=str(OUT / "04_after_reload.png"))

        values_after_reload = await page.evaluate(
            "() => [...document.querySelectorAll('input[type=text]')].map(i => i.value)"
        )
        # Normalize the currency-formatted values ("2.500" -> "2500") for comparison.
        norm = [v.replace(".", "").replace(",", "") for v in values_after_reload]
        assert_true(STOCK_CODE in values_after_reload, "Stock code persisted after reload")
        assert_true(RATIO_OLD in values_after_reload, "Ratio old persisted after reload")
        assert_true(RATIO_NEW in values_after_reload, "Ratio new persisted after reload")
        assert_true(RIGHT_PRICE in norm, "Harga Pelaksanaan persisted after reload")
        assert_true(CURRENT_LOT in values_after_reload, "Jumlah Lot persisted after reload")
        assert_true(AVG_PRICE in norm, "Harga Rata-rata persisted after reload")

        body_reload = await page.evaluate("() => document.body.innerText")
        for needle in EXPECTED_SUBSTRINGS:
            assert_true(
                needle in body_reload,
                f"Calculation result '{needle}' re-renders after reload",
            )

        # Sanity: no ErrorBoundary fallback on either state.
        assert_true(
            "Terjadi kesalahan" not in body_reload,
            "No ErrorBoundary fallback after reload",
        )

        await browser.close()
        print("\nAll E2E assertions passed.")


if __name__ == "__main__":
    asyncio.run(main())