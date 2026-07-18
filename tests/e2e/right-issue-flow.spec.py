"""
End-to-end Playwright test — main Right Issue user flow.

Verifies:
  1. User can pick an IDX stock code (BRIS)
  2. User can enter right-issue parameters (ratio, harga tebus, lot, avg price)
  3. Calculation results render with the expected numbers
  4. After a full page reload, the form starts blank and the user can re-enter
     values to get results again (no auto-restore).

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
CUM_DATE_PRICE = "3000"
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
    await page.locator("#stock-code").fill(STOCK_CODE)
    await page.locator("#ratioOld-input").fill(RATIO_OLD)
    await page.locator("#ratioNew-input").fill(RATIO_NEW)
    await page.locator("#right-price").fill(RIGHT_PRICE)
    await page.locator("#cum-date-price").fill(CUM_DATE_PRICE)
    await page.locator("#current-lots").fill(CURRENT_LOT)
    await page.locator("#current-avg-price").fill(AVG_PRICE)


async def click_hitung(page):
    hitung = page.get_by_role("button", name="Hitung").first
    await hitung.wait_for(state="visible")
    await page.wait_for_function(
        "() => [...document.querySelectorAll('button')].some(b => b.innerText.trim()==='Hitung' && !b.disabled)",
        timeout=5000,
    )
    await hitung.click()
    await page.wait_for_timeout(1200)


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
        await click_hitung(page)
        await page.screenshot(path=str(OUT / "03_results.png"))

        body = await page.evaluate("() => document.body.innerText")
        for needle in EXPECTED_SUBSTRINGS:
            assert_true(needle in body, f"Result body contains '{needle}'")

        # ---- Step 3: reload & verify blank start + re-calculate ----
        await page.reload(wait_until="domcontentloaded")
        await page.wait_for_timeout(1800)
        await dismiss_onboarding(page)
        await page.wait_for_timeout(500)
        await page.screenshot(path=str(OUT / "04_after_reload.png"))

        values_after_reload = await page.evaluate(
            "() => [...document.querySelectorAll('input[type=text]')].map(i => i.value)"
        )
        # In the new behaviour, the form starts empty after reload.
        non_empty = [v for v in values_after_reload if v.strip()]
        assert_true(len(non_empty) == 0, "Form is blank after reload (no auto-restore)")

        # Re-fill and re-calculate to confirm the app still works after a hard refresh.
        await fill_form(page)
        await click_hitung(page)
        await page.screenshot(path=str(OUT / "05_recalc_after_reload.png"))

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