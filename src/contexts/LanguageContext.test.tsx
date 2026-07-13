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
});