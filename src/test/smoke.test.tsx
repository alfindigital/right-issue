import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import App from "@/App";

// Stub IntersectionObserver used by some children.
beforeAll(() => {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    root = null;
    rootMargin = "";
    thresholds = [];
  };
  // jsdom missing API
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const renderApp = () =>
  render(
    <HelmetProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </HelmetProvider>,
  );

describe("App smoke test", () => {
  it("renders content on initial navigation without a blank screen", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container, unmount } = renderApp();
    // Non-empty DOM = not a blank screen.
    expect(container.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    expect(container.querySelector("*")).not.toBeNull();
    unmount();
    spy.mockRestore();
  });

  it("renders again after a simulated reload (unmount + remount)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const first = renderApp();
    first.unmount();
    const second = renderApp();
    expect(second.container.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    second.unmount();
    spy.mockRestore();
  });
});