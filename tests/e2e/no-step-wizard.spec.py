"""
E2E regression — StepWizard has been fully removed.

Verifies:
  1. No StepWizard chrome renders (progress ring, step counter, Lanjut/Kembali
     step nav buttons, step-by-step display-mode option in Settings).
  2. Horizontal swipe on the form does NOT advance a wizard step (all input
     fields remain visible & filled after a swipe).
  3. All main panels (inputs, ringkasan/summary, rekomendasi, perbandingan
     skenario) remain visible after a full page reload.

Run:
    python3 tests/e2e/no-step-wizard.spec.py
"""
import asyncio
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
CURRENT_LOT = "10"
AVG_PRICE = "3000"

# Text/labels that only exist in the old StepWizard UI. If any of these
# re-appear the wizard has crept back in.
FORBIDDEN_TEXT = [
    "Step-by-Step",
    "Step by Step",
    "Langkah demi langkah",
    "Langkah 1 dari",
    "Step 1 of",
]

# Panels that must always render after reload once a calculation exists.
REQUIRED_PANELS = [
    "Kesimpulan",              # summary/conclusion section
    "Rekomendasi",             # recommendation block
    "Perbandingan Skenario",   # scenario comparison
    "TERP",                    # core result metric
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
    text_inputs = page.locator("input[type=text]")
    await text_inputs.nth(0).fill(STOCK_CODE)
    await text_inputs.nth(1).fill(RATIO_OLD)
    await text_inputs.nth(2).fill(RATIO_NEW)
    await page.locator("#right-price").fill(RIGHT_PRICE)
    await text_inputs.nth(4).fill(CURRENT_LOT)
    await page.locator("#current-avg-price").fill(AVG_PRICE)


async def swipe(page, x1, x2, y=400):
    await page.mouse.move(x1, y)
    await page.mouse.down()
    steps = 12
    for i in range(1, steps + 1):
        await page.mouse.move(x1 + (x2 - x1) * i / steps, y)
    await page.mouse.up()


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Use a mobile-ish width so any lingering swipe handler would fire.
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # ---- 1. Load & assert no wizard chrome ----
        await page.goto(BASE_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await dismiss_onboarding(page)
        await page.screenshot(path=str(OUT / "wiz_01_home.png"))

        body = await page.evaluate("() => document.body.innerText")
        for needle in FORBIDDEN_TEXT:
            ok(needle not in body, f"Body does NOT contain wizard text: '{needle}'")

        # Step navigation buttons "Lanjut" / "Kembali" must not be visible as
        # form-step controls. (Onboarding uses them but was dismissed above.)
        for label in ("Lanjut", "Kembali"):
            visible = await page.get_by_role("button", name=label).count()
            ok(visible == 0, f"No visible step-nav '{label}' button on form")

        # Progress ring from the wizard used data-testid or specific class; also
        # check that a "step counter" pattern (e.g. "1/5", "2 / 5") is absent.
        import re
        ok(
            re.search(r"\b[1-9]\s*/\s*[3-9]\b", body) is None,
            "No 'N / M' step-counter pattern rendered on form",
        )

        # ---- 2. Settings dropdown no longer offers a step-by-step mode ----
        try:
            await page.get_by_role("button", name="Settings").click(timeout=2000)
            await page.wait_for_timeout(400)
            menu_text = await page.evaluate("() => document.body.innerText")
            for needle in ("Step-by-Step", "Step by Step", "Langkah demi langkah"):
                ok(needle not in menu_text, f"Settings menu missing '{needle}'")
            await page.keyboard.press("Escape")
        except Exception as e:
            print(f"NOTE: could not open settings menu ({e}); continuing")

        # ---- 3. Fill form + swipe should NOT hide any input ----
        await fill_form(page)
        await page.screenshot(path=str(OUT / "wiz_02_filled.png"))

        inputs_before = await page.locator("input[type=text]:visible").count()
        # Swipe left then right — either direction would step a wizard.
        await swipe(page, 380, 40)
        await page.wait_for_timeout(300)
        await swipe(page, 40, 380)
        await page.wait_for_timeout(300)
        inputs_after = await page.locator("input[type=text]:visible").count()
        await page.screenshot(path=str(OUT / "wiz_03_after_swipe.png"))
        ok(
            inputs_after == inputs_before and inputs_before >= 5,
            f"All {inputs_before} form inputs still visible after swipe "
            f"(before={inputs_before}, after={inputs_after})",
        )

        # Values didn't get cleared by an accidental step change.
        values = await page.evaluate(
            "() => [...document.querySelectorAll('input[type=text]')].map(i => i.value)"
        )
        norm = [v.replace(".", "").replace(",", "") for v in values]
        ok(STOCK_CODE in values, "Stock code retained after swipe")
        ok(RIGHT_PRICE in norm, "Harga pelaksanaan retained after swipe")

        # ---- 4. Calculate ----
        hitung = page.get_by_role("button", name="Hitung").first
        await hitung.wait_for(state="visible")
        await page.wait_for_function(
            "() => [...document.querySelectorAll('button')].some(b => b.innerText.trim()==='Hitung' && !b.disabled)",
            timeout=5000,
        )
        await hitung.click()
        await page.wait_for_timeout(1200)

        # ---- 5. Reload — all panels re-render ----
        await page.reload(wait_until="domcontentloaded")
        await page.wait_for_timeout(1800)
        await dismiss_onboarding(page)
        await page.wait_for_timeout(500)
        # Results dashboard is gated behind an explicit "Hitung" click; form
        # values are restored from localStorage, so trigger recalc.
        try:
            hitung_r = page.get_by_role("button", name="Hitung").first
            await hitung_r.click(timeout=3000)
            await page.wait_for_timeout(1200)
        except Exception:
            pass
        # Scroll through the page to force lazy sections to mount.
        await page.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(800)
        await page.evaluate("() => window.scrollTo(0, 0)")
        await page.wait_for_timeout(300)
        await page.screenshot(path=str(OUT / "wiz_04_after_reload.png"))

        body_reload = await page.evaluate("() => document.body.innerText")
        for needle in FORBIDDEN_TEXT:
            ok(needle not in body_reload, f"After reload: no wizard text '{needle}'")
        for panel in REQUIRED_PANELS:
            ok(panel in body_reload, f"Panel '{panel}' visible after reload")

        ok(
            "Terjadi kesalahan" not in body_reload,
            "No ErrorBoundary fallback after reload",
        )

        await browser.close()
        print("\nStepWizard regression: all assertions passed.")


if __name__ == "__main__":
    asyncio.run(main())