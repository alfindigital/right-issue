import { describe, it, expect, vi } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "./LanguageContext";

describe("useLanguage", () => {
  it("throws a clear error when used outside LanguageProvider", () => {
    // Suppress React's error log noise for this expected throw
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useLanguage())).toThrow(
      /useLanguage must be used within a LanguageProvider/,
    );
    spy.mockRestore();
  });

  it("returns translations and language when wrapped in LanguageProvider", () => {
    const Probe = () => {
      const { language, t } = useLanguage();
      return (
        <div>
          <span data-testid="lang">{language}</span>
          <span data-testid="title">{t("app.title")}</span>
        </div>
      );
    };

    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    expect(screen.getByTestId("lang").textContent).toMatch(/^(id|en)$/);
    expect(screen.getByTestId("title").textContent).not.toBe("app.title");
  });

  it("falls back to the key itself for unknown translation keys (inside provider)", () => {
    const Probe = () => {
      const { t } = useLanguage();
      return <span data-testid="missing">{t("this.key.does.not.exist")}</span>;
    };
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("missing").textContent).toBe("this.key.does.not.exist");
  });

  it("defaults language to 'id' when localStorage has no saved language", () => {
    window.localStorage.removeItem("language");
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(result.current.language).toBe("id");
    expect(typeof result.current.t).toBe("function");
  });

  it("ignores invalid saved language values and keeps default", () => {
    window.localStorage.setItem("language", "fr-not-supported");
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(result.current.language).toBe("id");
    window.localStorage.removeItem("language");
  });

  it("does not silently return undefined outside a provider (guards blank screen)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    // The hook must throw a descriptive error rather than return an undefined
    // context — a silent undefined would blank the screen at call sites.
    expect(() => renderHook(() => useLanguage())).toThrow(/LanguageProvider/);
    spy.mockRestore();
  });
});