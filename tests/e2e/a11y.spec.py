"""
End-to-end accessibility audit — runs axe-core against the Right Issue
calculator form and results page, in BOTH light and dark modes.

What it audits (4 scans total):
    1. Form state, light mode  — before any calculation is run
    2. Results state, light mode — after clicking Hitung
    3. Form state, dark mode
    4. Results state, dark mode

Runs axe-core (loaded from unpkg) with the wcag2a, wcag2aa, and
wcag21aa tag set. Fails on any violation whose impact is "serious"
or "critical". Lower-impact violations are printed as warnings so
regressions surface without blocking CI on cosmetic issues.

How to run (from repo root, dev server must be on http://localhost:8080):
    python3 tests/e2e/a11y.spec.py

Screenshots + raw axe JSON reports are written to /tmp/browser/a11y/
for post-mortem inspection.
"""
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:8080/"
AXE_CDN = "https://unpkg.com/axe-core@4.10.0/axe.min.js"
OUT = Path("/tmp/browser/a11y")
OUT.mkdir(parents=True, exist_ok=True)

# Deterministic inputs (mirrors right-issue-flow.spec.py)
STOCK_CODE = "BRIS"
RATIO_OLD = "5"
RATIO_NEW = "2"
RIGHT_PRICE = "2500"
CURRENT_LOT = "10"
AVG_PRICE = "3000"

# Impact levels that fail the build.
BLOCKING_IMPACTS = {"serious", "critical"}

# Rules to skip. Keep this list tight and documented — every entry is a
# known false positive or accepted limitation.
#   - "color-contrast": scanning tokens against dynamic gradient backgrounds
#     produces false positives on shadcn semantic tokens which are audited
#     separately at the design-system level.
#   - "landmark-unique": react-joyride injects duplicate landmarks during
#     the onboarding tour lifecycle even after dismissal.
SKIP_RULES = {"color-contrast", "landmark-unique"}


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


async def set_theme(page, mode):
    """Toggle the `dark` class on <html> — matches the app's theme wiring."""
    if mode == "dark":
        await page.evaluate("() => document.documentElement.classList.add('dark')")
    else:
        await page.evaluate("() => document.documentElement.classList.remove('dark')")
    await page.wait_for_timeout(200)


async def run_axe(page, label):
    """Inject axe-core and audit the current page. Returns the raw result."""
    await page.add_script_tag(url=AXE_CDN)
    result = await page.evaluate(
        """async () => {
            const r = await window.axe.run(document, {
                runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
                resultTypes: ['violations'],
            });
            return { violations: r.violations };
        }"""
    )
    # Persist raw report for debugging.
    (OUT / f"{label}.json").write_text(json.dumps(result, indent=2))
    return result


def summarise(label, result):
    """Return (blocking_count, warning_count) and print a per-scan summary."""
    blocking = []
    warnings = []
    for v in result.get("violations", []):
        if v["id"] in SKIP_RULES:
            continue
        entry = {
            "id": v["id"],
            "impact": v.get("impact"),
            "help": v.get("help"),
            "nodes": len(v.get("nodes", [])),
        }
        if (v.get("impact") or "").lower() in BLOCKING_IMPACTS:
            blocking.append(entry)
        else:
            warnings.append(entry)

    print(f"\n--- {label} ---")
    if not blocking and not warnings:
        print("  no violations")
    for w in warnings:
        print(f"  WARN  [{w['impact']}] {w['id']} ({w['nodes']} nodes) — {w['help']}")
    for b in blocking:
        print(f"  FAIL  [{b['impact']}] {b['id']} ({b['nodes']} nodes) — {b['help']}")
    return len(blocking), len(warnings)


async def audit_state(page, label):
    await page.screenshot(path=str(OUT / f"{label}.png"))
    result = await run_axe(page, label)
    return summarise(label, result)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        await page.goto(BASE_URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
        await dismiss_onboarding(page)

        total_blocking = 0
        total_warnings = 0

        for theme in ("light", "dark"):
            await set_theme(page, theme)

            # 1. Empty form audit
            b1, w1 = await audit_state(page, f"form_{theme}")

            # 2. Fill + calculate, then audit the results state
            await fill_form(page)
            await click_calculate(page)
            b2, w2 = await audit_state(page, f"results_{theme}")

            total_blocking += b1 + b2
            total_warnings += w1 + w2

        await browser.close()

        print(
            f"\nTotals — blocking: {total_blocking}, warnings: {total_warnings}"
        )
        if total_blocking > 0:
            print("\nA11y audit FAILED — see reports in /tmp/browser/a11y/")
            sys.exit(1)
        print("\nA11y audit passed (serious/critical == 0).")


if __name__ == "__main__":
    asyncio.run(main())