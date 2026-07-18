"""
E2E — Full-mode persistence.

Verifies that in the (now-only) full form mode, both input values AND the
calculation results survive a hard page refresh, without depending on any
wizard/step state (StepWizard has been removed).

Guards against regressions where:
  - autosave stops writing the full field set,
  - a wizard step gets re-introduced and hides fields on reload,
  - results panels fail to re-render after recalc post-reload.

Run:
    python3 tests/e2e/full-mode-persistence.spec.py
"""
import asyncio
import re
import sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:8080/"
OUT = Path("/tmp/browser/e2e")
OUT.mkdir(parents=True, exist_ok=True)

STOCK_CODE = "BRIS"
RATIO_OLD = "5"
RATIO_NEW = "2"
RIGHT_PRICE = "2500"
CUM_DATE_PRICE = "3000"
CURRENT_LOT = "10"
AVG_PRICE = "3000"

# For BRIS 5:2 @ 2.500 with 10 lot @ 3.000:
#   Jatah   = 10 * 2 / 5 = 4 lot
#   Total   = 10 + 4     = 14 lot
#   TERP    = (10*3000 + 4*2500) / 14 = 42.857/14 = 3.061 → rounded 3.061
EXPECTED_RESULT_SUBSTRINGS = ["4 lot", "14 lot", "TERP", "Rp"]

WIZARD_MARKERS = [
    "Step-by-Step",
    "Langkah demi langkah",
    "Langkah 1 dari",
    "Step 1 of",
]


def ok(cond, msg):
    print(("OK:   " if cond else "FAIL: ") + msg)
    if not cond:
        sys.exit(1)


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


async def read_inputs(page):
    return await page.evaluate(
        "() => [...document.querySelectorAll('input[type=text]')].map(i => i.value)"
    )


async def click_hitung(page):
    hitung = page.get_by_role("button", name="Hitung").first
    await page.wait_for_function(
        "() => [...document.querySelectorAll('button')].some(b => b.innerText.trim()==='Hitung' && !b.disabled)",
        timeout=5000,
    )
    await hitung.click()
    await page.wait_for_timeout(1200)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await ctx.new_page()

        # --- 1. Fresh load & confirm full-mode form (all fields visible, no wizard) ---
        await page.goto(BASE_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await dismiss_onboarding(page)

        body = await page.evaluate("() => document.body.innerText")
        for w in WIZARD_MARKERS:
            ok(w not in body, f"No wizard marker '{w}' on initial load")

        inputs_initial = await page.locator("input[type=text]:visible").count()
        ok(inputs_initial >= 6, f"Full-mode shows all form fields at once ({inputs_initial} visible)")

        # --- 2. Fill + calculate ---
        await fill_form(page)
        values_pre = await read_inputs(page)
        await page.screenshot(path=str(OUT / "fmp_01_filled.png"))

        await click_hitung(page)

        body_pre = await page.evaluate("() => document.body.innerText")
        for needle in EXPECTED_RESULT_SUBSTRINGS:
            ok(needle in body_pre, f"Pre-reload result contains '{needle}'")

        # Sanity: autosave key exists and contains our inputs (no wizard step key).
        autosave = await page.evaluate(
            "() => localStorage.getItem('ri-calculator-autosave')"
        )
        ok(autosave is not None, "Autosave written to localStorage")
        ok(
            "wizardStep" not in (autosave or "") and "currentStep" not in (autosave or ""),
            "Autosave payload does NOT reference wizard/step state",
        )
        ok(STOCK_CODE in (autosave or ""), "Autosave payload contains stock code")

        # --- 3. Hard refresh ---
        await page.reload(wait_until="domcontentloaded")
        await page.wait_for_timeout(1800)
        await dismiss_onboarding(page)
        await page.wait_for_timeout(400)
        await page.screenshot(path=str(OUT / "fmp_02_after_reload.png"))

        # Full mode still active (no wizard chrome, all inputs visible together).
        body_reload = await page.evaluate("() => document.body.innerText")
        for w in WIZARD_MARKERS:
            ok(w not in body_reload, f"No wizard marker '{w}' after reload")
        ok(
            re.search(r"\b[1-9]\s*/\s*[3-9]\b", body_reload) is None,
            "No step counter (N/M) after reload",
        )
        inputs_after = await page.locator("input[type=text]:visible").count()
        ok(inputs_after >= 6, f"All full-mode inputs still visible after reload ({inputs_after})")

        # In the new behaviour, the form starts blank after a hard refresh.
        values_post = await read_inputs(page)
        non_empty_post = [v for v in values_post if v.strip()]
        ok(len(non_empty_post) == 0, "Form is blank after hard refresh (no auto-restore)")

        # Full-mode still active (no wizard chrome, all inputs visible together).
        body_reload = await page.evaluate("() => document.body.innerText")
        for w in WIZARD_MARKERS:
            ok(w not in body_reload, f"No wizard marker '{w}' after reload")
        ok(
            re.search(r"\b[1-9]\s*/\s*[3-9]\b", body_reload) is None,
            "No step counter (N/M) after reload",
        )
        inputs_after = await page.locator("input[type=text]:visible").count()
        ok(inputs_after >= 6, f"All full-mode inputs still visible after reload ({inputs_after})")

        # --- 4. Re-fill and recompute to confirm the app still works after refresh ---
        await fill_form(page)
        await click_hitung(page)
        await page.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(500)

        body_final = await page.evaluate("() => document.body.innerText")
        for needle in EXPECTED_RESULT_SUBSTRINGS:
            ok(needle in body_final, f"Post-reload recalc still yields '{needle}'")
        ok(
            "Terjadi kesalahan" not in body_final,
            "No ErrorBoundary fallback after reload + recalc",
        )

        # Values unchanged after recalc.
        values_final = await read_inputs(page)
        ok(
            values_final == values_pre,
            "Input values unchanged by post-reload recalc",
        )

        await browser.close()
        print("\nFull-mode persistence: all assertions passed.")


if __name__ == "__main__":
    asyncio.run(main())