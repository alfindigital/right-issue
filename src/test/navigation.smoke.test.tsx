import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { act, render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import App from "@/App";

// jsdom is missing a few observer APIs that lazy children touch on mount.
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

// Track how often LanguageProvider mounts. If it remounts across a client-side
// navigation, the provider's initial `id` default would clobber the user's
// saved language and every consumer would flicker — the exact failure mode
// this suite guards against.
let providerMountCount = 0;
vi.mock("@/contexts/LanguageContext", async () => {
  const actual =
    await vi.importActual<typeof import("@/contexts/LanguageContext")>(
      "@/contexts/LanguageContext",
    );
  const { useEffect } = await import("react");
  return {
    ...actual,
    LanguageProvider: ({ children }: { children: React.ReactNode }) => {
      useEffect(() => {
        providerMountCount += 1;
      }, []);
      return <actual.LanguageProvider>{children}</actual.LanguageProvider>;
    },
  };
});

const setPath = (path: string) => {
  window.history.pushState({}, "", path);
};

const renderApp = () =>
  render(
    <HelmetProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </HelmetProvider>,
  );

const assertNotBlank = (container: HTMLElement) => {
  // A blank screen would leave the container empty or with an ErrorBoundary
  // "Terjadi kesalahan" fallback. Guard against both.
  expect(container.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  expect(container.textContent).not.toMatch(/Terjadi kesalahan/i);
  expect(container.querySelector("*")).not.toBeNull();
};

describe("App navigation smoke", () => {
  beforeEach(() => {
    providerMountCount = 0;
    window.localStorage.clear();
    setPath("/");
  });

  it("renders each top-level route directly without a blank screen (deep-link reload)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    for (const path of ["/", "/embed", "/ri/BRIS", "/does-not-exist"]) {
      setPath(path);
      const { container, unmount } = renderApp();
      assertNotBlank(container);
      unmount();
    }
    spy.mockRestore();
  });

  it("navigates client-side across routes after initial load without a blank screen", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    setPath("/");
    const { container } = renderApp();
    assertNotBlank(container);

    // Simulate in-app navigation by pushing history and dispatching popstate,
    // which react-router listens to via BrowserRouter.
    for (const path of ["/embed", "/ri/ELPI", "/"]) {
      act(() => {
        window.history.pushState({}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
      assertNotBlank(container);
    }
    spy.mockRestore();
  });

  it("keeps saved language after simulated reload + navigation (provider not remounted mid-nav)", () => {
    window.localStorage.setItem("language", "en");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    // First "page load".
    setPath("/");
    const { container, unmount } = renderApp();
    assertNotBlank(container);
    expect(providerMountCount).toBe(1);

    // Client-side navigations must not remount the provider.
    act(() => {
      window.history.pushState({}, "", "/embed");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    act(() => {
      window.history.pushState({}, "", "/ri/BRIS");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(providerMountCount).toBe(1);
    assertNotBlank(container);

    // Simulated reload = unmount + fresh mount. Saved language must persist.
    unmount();
    setPath("/embed");
    const second = renderApp();
    assertNotBlank(second.container);
    expect(providerMountCount).toBe(2);

    // Verify the reloaded provider still reads 'en' from localStorage.
    let observedLang: string | null = null;
    const Probe = () => {
      observedLang = useLanguage().language;
      return null;
    };
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );
    expect(observedLang).toBe("en");

    second.unmount();
    spy.mockRestore();
  });
});