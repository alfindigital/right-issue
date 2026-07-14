import { describe, it, expect, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
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

  it("reads fallback from localStorage when a valid language is saved", () => {
    window.localStorage.setItem("language", "en");
    const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(result.current.language).toBe("en");
    expect(result.current.t("app.title")).toBe("Right Issue Calculator");
    window.localStorage.removeItem("language");
  });

  it("falls back to default 'id' when localStorage value is empty string", () => {
    window.localStorage.setItem("language", "");
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

  it("persists selected language to localStorage and restores it on reload", () => {
    window.localStorage.removeItem("language");

    // First mount: user switches language to 'en'.
    const first = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(first.result.current.language).toBe("id");

    act(() => first.result.current.setLanguage("en"));

    expect(first.result.current.language).toBe("en");
    expect(window.localStorage.getItem("language")).toBe("en");

    // Simulate a reload by unmounting and mounting a fresh provider tree.
    first.unmount();
    const second = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(second.result.current.language).toBe("en");
    expect(second.result.current.t("app.title")).toBe("Right Issue Calculator");

    // And switching back to 'id' persists too.
    act(() => second.result.current.setLanguage("id"));
    expect(window.localStorage.getItem("language")).toBe("id");
    second.unmount();

    const third = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
    expect(third.result.current.language).toBe("id");

    window.localStorage.removeItem("language");
  });
});

describe("useLanguage localStorage fallback safety", () => {
  const mount = () => renderHook(() => useLanguage(), { wrapper: LanguageProvider });

  it("falls back to 'id' when localStorage has no 'language' key at all", () => {
    window.localStorage.clear();
    const { result } = mount();
    expect(result.current.language).toBe("id");
    expect(result.current.t("app.title")).not.toBe("app.title");
  });

  it.each([
    ["whitespace only", "   "],
    ["json object", '{"lang":"en"}'],
    ["number as string", "42"],
    ["null literal", "null"],
    ["undefined literal", "undefined"],
    ["mixed case invalid", "EN-US"],
  ])("falls back to 'id' when localStorage value is corrupt (%s)", (_label, value) => {
    window.localStorage.setItem("language", value);
    const { result } = mount();
    expect(result.current.language).toBe("id");
    window.localStorage.removeItem("language");
  });

  it.each([
    ["german", "de"],
    ["chinese", "zh"],
    ["japanese", "ja"],
    ["indonesian regional", "id-ID"],
    ["english regional", "en-US"],
  ])("falls back to 'id' for unknown language key (%s)", (_label, code) => {
    window.localStorage.setItem("language", code);
    const { result } = mount();
    expect(result.current.language).toBe("id");
    // Translations must still work for the default language.
    expect(result.current.t("app.title")).toBe("Kalkulator Right Issue");
    window.localStorage.removeItem("language");
  });

  it("only accepts the exact supported codes 'id' and 'en'", () => {
    window.localStorage.setItem("language", "id");
    expect(mount().result.current.language).toBe("id");
    window.localStorage.setItem("language", "en");
    expect(mount().result.current.language).toBe("en");
    window.localStorage.removeItem("language");
  });
});