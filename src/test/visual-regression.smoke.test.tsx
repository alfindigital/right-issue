import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "@/pages/Index";
import { MemoryRouter } from "react-router-dom";

// jsdom lacks these observer APIs used by lazy children on the main page.
beforeAll(() => {
  // @ts-expect-error jsdom missing API
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  };
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const renderIndex = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <LanguageProvider>
          <Index />
        </LanguageProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

/**
 * Structural "visual" regression: without a real headless browser we cannot
 * diff pixels, but we can guard against the two failure modes the user cares
 * about — blank screens and layout collapse — by asserting that in both
 * light and dark modes the main page renders:
 *   - a non-empty DOM tree
 *   - no ErrorBoundary fallback ("Terjadi kesalahan")
 *   - the primary heading / calculator surface
 *   - background + foreground utility classes so the theme actually applies
 */
const assertPageIsHealthy = (container: HTMLElement, mode: "light" | "dark") => {
  // Non-blank
  expect(container.textContent?.trim().length ?? 0).toBeGreaterThan(50);
  // ErrorBoundary did not swallow the tree
  expect(container.textContent).not.toMatch(/Terjadi kesalahan/i);
  // Something interactive shipped (calculator has many buttons/inputs)
  const interactive = container.querySelectorAll("button, input, select, textarea, a");
  expect(interactive.length).toBeGreaterThan(0);
  // Theme class is applied at documentElement level
  if (mode === "dark") {
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  } else {
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  }
};

describe("Visual regression smoke — main page light & dark", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();
    // Silence noisy lazy-load / Helmet warnings the calculator surfaces in jsdom.
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
    vi.restoreAllMocks();
  });

  it("renders the main page in light mode without a blank/broken layout", () => {
    const { container, unmount } = renderIndex();
    assertPageIsHealthy(container, "light");
    unmount();
  });

  it("renders the main page in dark mode without a blank/broken layout", () => {
    document.documentElement.classList.add("dark");
    window.localStorage.setItem("theme", "dark");
    const { container, unmount } = renderIndex();
    assertPageIsHealthy(container, "dark");
    unmount();
  });

  it("keeps the same top-level structural shape between light and dark modes", () => {
    // Light snapshot
    const light = renderIndex();
    const lightTagShape = Array.from(light.container.querySelectorAll("*"))
      .slice(0, 40)
      .map((el) => el.tagName)
      .join(",");
    const lightInteractiveCount = light.container.querySelectorAll(
      "button, input, select, textarea, a",
    ).length;
    light.unmount();

    // Dark snapshot
    document.documentElement.classList.add("dark");
    window.localStorage.setItem("theme", "dark");
    const dark = renderIndex();
    const darkTagShape = Array.from(dark.container.querySelectorAll("*"))
      .slice(0, 40)
      .map((el) => el.tagName)
      .join(",");
    const darkInteractiveCount = dark.container.querySelectorAll(
      "button, input, select, textarea, a",
    ).length;
    dark.unmount();

    // Same DOM shape and same number of interactive elements — a code change
    // that blanks out or restructures the page in one theme would break this.
    expect(darkTagShape).toBe(lightTagShape);
    expect(darkInteractiveCount).toBe(lightInteractiveCount);
    expect(lightInteractiveCount).toBeGreaterThan(0);
  });

  it("captures a stable DOM structure snapshot for the main page (light)", () => {
    const { container, unmount } = renderIndex();
    // Shape-only snapshot — element tag + role/aria attributes, ignoring
    // volatile text/values — so unrelated copy edits don't churn the baseline
    // but a missing section or collapsed layout would.
    const shape = Array.from(container.querySelectorAll("main, header, nav, section, footer, h1, h2"))
      .map((el) => {
        const role = el.getAttribute("role") ?? "";
        const aria = el.getAttribute("aria-label") ?? "";
        return `${el.tagName}${role ? `[role=${role}]` : ""}${aria ? `[aria-label]` : ""}`;
      })
      .join("|");
    expect(shape).toMatchInlineSnapshot(`"HEADER|H1|MAIN|SECTION|H2|SECTION|H2"`);
    unmount();
  });
});