"""
End-to-end Playwright test — edge inputs & validation.

Scenarios:
  A. Missing required fields → Hitung button stays DISABLED, no crash.
  B. Invalid ratio (0)       → validation message shown, Hitung DISABLED.
  C. Non-numeric input       → sanitizer strips letters from numeric fields.
  D. Extreme ratios / lots   → very large inputs still calculate without
                                 overflow or ErrorBoundary; results can be
                                 re-created after reload.
  E. Odd-lot boundary        → 1 lot @ 5:2 renders fractional "0,40 lot"
                                 (Indonesian decimal), Hitung stays enabled.

How to run (from repo root, dev server must be on http://localhost:8080):
    python3 tests/e2e/edge-inputs.spec.py

Each scenario clears localStorage first so they cannot bleed into each other.
Screenshots are saved under /tmp/browser/edge-inputs/ for post-mortem.
"""
import asyncio
import sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:8080/"
OUT = Path("/tmp/browser/edge-inputs")
OUT.mkdir(parents=True, exist_ok=True)


def ok(msg):
    print(f"OK:   {msg}")


def fail(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


def assert_true(cond, msg):
    ok(msg) if cond else fail(msg)


async def dismiss_onboarding(page):
    try:
        await page.get_by_role("button", name="Lewati").click(timeout=1500)
    except Exception:
        pass


async def clear_and_reload(page):
    """Drop all localStorage state and land on a clean home page."""
    await page.goto(BASE_URL, wait_until="domcontentloaded")
    await page.evaluate("() => { try { window.localStorage.clear(); } catch (_) {} }")
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(1200)
    await dismiss_onboarding(page)


async def hitung_disabled(page):
    """Return True if every Hitung button on the page is disabled."""
    return await page.evaluate(
        """() => {
            const btns = [...document.querySelectorAll('button')]
              .filter(b => b.innerText.trim() === 'Hitung');
            if (btns.length === 0) return true; // not rendered yet
            return btns.every(b => b.disabled);
        }"""
    )


async def body_text(page):
    return await page.evaluate("() => document.body.innerText")


async def assert_no_error_boundary(page, label):
    txt = await body_text(page)
    assert_true(
        "Terjadi kesalahan" not in txt and "Something went wrong" not in txt,
        f"[{label}] no ErrorBoundary fallback",
    )


async def fill_valid_form(page, current_lots="10"):
    await page.locator("#stock-code").fill("BRIS")
    await page.locator("#ratioOld-input").fill("5")
    await page.locator("#ratioNew-input").fill("2")
    await page.locator("#right-price").fill("2500")
    await page.locator("#cum-date-price").fill("3000")
    await page.locator("#current-lots").fill(current_lots)
    await page.locator("#current-avg-price").fill("3000")


async def click_hitung(page):
    hitung = page.get_by_role("button", name="Hitung").first
    await hitung.wait_for(state="visible")
    await page.wait_for_function(
        "() => [...document.querySelectorAll('button')].some(b => b.innerText.trim()==='Hitung' && !b.disabled)",
        timeout=5000,
    )
    await hitung.click()
    await page.wait_for_timeout(1200)


# ---------------------------------------------------------------------------
# Scenarios
# ---------------------------------------------------------------------------

async def scenario_a_missing_fields(page):
    print("\n--- A. Missing required fields ---")
    await clear_and_reload(page)

    # Fill ratio + right price + cum-date, but skip lots & avg price.
    await page.locator("#stock-code").fill("BRIS")
    await page.locator("#ratioOld-input").fill("5")
    await page.locator("#ratioNew-input").fill("2")
    await page.locator("#right-price").fill("2500")
    await page.locator("#cum-date-price").fill("3000")
    await page.wait_for_timeout(400)

    await page.screenshot(path=str(OUT / "A_missing_fields.png"))
    assert_true(await hitung_disabled(page), "[A] Hitung disabled when lots/avg empty")
    await assert_no_error_boundary(page, "A")


async def scenario_b_invalid_ratio(page):
    print("\n--- B. Invalid ratio (0) ---")
    await clear_and_reload(page)

    await page.locator("#stock-code").fill("BRIS")
    await page.locator("#ratioOld-input").fill("0")      # invalid: rasio lama = 0
    await page.locator("#ratioNew-input").fill("2")
    await page.locator("#right-price").fill("2500")
    await page.locator("#cum-date-price").fill("3000")
    await page.locator("#current-lots").fill("10")
    await page.locator("#current-avg-price").fill("3000")
    await page.wait_for_timeout(600)

    await page.screenshot(path=str(OUT / "B_invalid_ratio.png"))

    txt = await body_text(page)
    assert_true(
        "Rasio lama tidak boleh 0" in txt,
        "[B] Validation message 'Rasio lama tidak boleh 0' visible",
    )
    assert_true(await hitung_disabled(page), "[B] Hitung disabled while ratio invalid")
    await assert_no_error_boundary(page, "B")


async def scenario_c_non_numeric(page):
    print("\n--- C. Non-numeric input is sanitized ---")
    await clear_and_reload(page)

    await page.locator("#ratioOld-input").fill("abc")    # ratio old
    await page.locator("#ratioNew-input").fill("2xx")    # ratio new
    await page.locator("#right-price").fill("abc-25!00")
    await page.locator("#current-lots").fill("ten")      # current lots
    await page.wait_for_timeout(300)

    await page.screenshot(path=str(OUT / "C_non_numeric.png"))

    # RatioInput allows only digits + one comma; price/lot only digits.
    ratio_old_val = await page.locator("#ratioOld-input").input_value()
    ratio_new_val = await page.locator("#ratioNew-input").input_value()
    price_val = await page.locator("#right-price").input_value()
    lots_val = await page.locator("#current-lots").input_value()

    assert_true(
        all(ch.isdigit() or ch == "," for ch in ratio_old_val),
        f"[C] Ratio-old strips letters (got {ratio_old_val!r})",
    )
    assert_true(
        all(ch.isdigit() or ch == "," for ch in ratio_new_val),
        f"[C] Ratio-new strips letters (got {ratio_new_val!r})",
    )
    # Price is currency-formatted after sanitization; the visible value may
    # contain thousands separators ('.') but never letters.
    assert_true(
        all(ch.isdigit() or ch == "." for ch in price_val),
        f"[C] Right-price strips letters (got {price_val!r})",
    )
    assert_true(
        all(ch.isdigit() or ch == "." for ch in lots_val),
        f"[C] Current-lots strips letters (got {lots_val!r})",
    )
    await assert_no_error_boundary(page, "C")


async def scenario_d_extreme_values(page):
    print("\n--- D. Extreme ratios / lots ---")
    await clear_and_reload(page)

    await page.locator("#stock-code").fill("BRIS")
    await page.locator("#ratioOld-input").fill("100")      # extreme ratio old
    await page.locator("#ratioNew-input").fill("1")
    await page.locator("#right-price").fill("50000")
    await page.locator("#cum-date-price").fill("75000")
    await page.locator("#current-lots").fill("100000")     # 100k lots
    await page.locator("#current-avg-price").fill("75000")
    await page.wait_for_timeout(500)

    await click_hitung(page)
    await page.screenshot(path=str(OUT / "D_extreme.png"))

    txt = await body_text(page)
    # 100000 lots @ 100:1 → 1000 new lots. Total = 101000 lot.
    assert_true("1.000 lot" in txt, "[D] Jatah 1.000 lot rendered")
    assert_true("101.000 lot" in txt, "[D] Final 101.000 lot rendered")
    await assert_no_error_boundary(page, "D")

    # Reload — the form starts blank (no auto-restore), but the user can re-run
    # the calculation and get the same results.
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(1500)
    await dismiss_onboarding(page)
    await page.wait_for_timeout(400)
    await page.screenshot(path=str(OUT / "D_extreme_after_reload.png"))

    values = await page.evaluate(
        "() => [...document.querySelectorAll('input[type=text]')].map(i => i.value)"
    )
    non_empty = [v for v in values if v.strip()]
    assert_true(len(non_empty) == 0, "[D] Form is blank after reload")

    await page.locator("#stock-code").fill("BRIS")
    await page.locator("#ratioOld-input").fill("100")
    await page.locator("#ratioNew-input").fill("1")
    await page.locator("#right-price").fill("50000")
    await page.locator("#cum-date-price").fill("75000")
    await page.locator("#current-lots").fill("100000")
    await page.locator("#current-avg-price").fill("75000")
    await click_hitung(page)
    await page.screenshot(path=str(OUT / "D_extreme_recalc_after_reload.png"))

    txt_reload = await body_text(page)
    assert_true("1.000 lot" in txt_reload, "[D] Jatah 1.000 lot re-created after reload")
    assert_true("101.000 lot" in txt_reload, "[D] Final 101.000 lot re-created after reload")
    await assert_no_error_boundary(page, "D/reload")


async def scenario_e_odd_lot(page):
    print("\n--- E. Odd-lot boundary (fractional allocation) ---")
    await clear_and_reload(page)

    await fill_valid_form(page, current_lots="1")  # 1 lot only → entitlement 0,40 lot
    await click_hitung(page)
    await page.screenshot(path=str(OUT / "E_odd_lot.png"))

    txt = await body_text(page)
    # Indonesian decimal separator = comma. 1 lot × 2/5 = 0,4 lot.
    assert_true(
        "0,40 lot" in txt,
        "[E] Fractional allocation '0,40 lot' rendered (odd-lot)",
    )
    # Final total: 1 + 0,4 = 1,4 lot
    assert_true("1,40 lot" in txt, "[E] Final total '1,40 lot' rendered")
    await assert_no_error_boundary(page, "E")

    # Reload — the form starts blank, but the same calculation can be re-run.
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_timeout(1500)
    await dismiss_onboarding(page)
    await page.wait_for_timeout(400)
    await page.screenshot(path=str(OUT / "E_odd_lot_after_reload.png"))

    values = await page.evaluate(
        "() => [...document.querySelectorAll('input[type=text]')].map(i => i.value)"
    )
    non_empty = [v for v in values if v.strip()]
    assert_true(len(non_empty) == 0, "[E] Form is blank after reload")

    await fill_valid_form(page, current_lots="1")
    await click_hitung(page)
    await page.screenshot(path=str(OUT / "E_odd_lot_recalc_after_reload.png"))

    txt_reload = await body_text(page)
    assert_true(
        "0,40 lot" in txt_reload,
        "[E] Fractional '0,40 lot' re-created after reload",
    )
    await assert_no_error_boundary(page, "E/reload")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        await scenario_a_missing_fields(page)
        await scenario_b_invalid_ratio(page)
        await scenario_c_non_numeric(page)
        await scenario_d_extreme_values(page)
        await scenario_e_odd_lot(page)

        await browser.close()
        print("\nAll edge-input E2E scenarios passed.")


if __name__ == "__main__":
    asyncio.run(main())
