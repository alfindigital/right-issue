import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PWAUpdatePrompt } from "./PWAUpdatePrompt";
import { LanguageProvider } from "@/contexts/LanguageContext";

describe("PWAUpdatePrompt", () => {
  it("renders without error when LanguageProvider is available", () => {
    expect(() =>
      render(
        <LanguageProvider>
          <PWAUpdatePrompt />
        </LanguageProvider>,
      ),
    ).not.toThrow();
  });

  it("renders nothing (fallback) when no refresh is needed", () => {
    const { container } = render(
      <LanguageProvider>
        <PWAUpdatePrompt />
      </LanguageProvider>,
    );
    // Component returns null until onNeedRefresh fires; the pwa-register
    // mock never triggers it, so the fallback path renders an empty tree.
    expect(container.firstChild).toBeNull();
  });
});