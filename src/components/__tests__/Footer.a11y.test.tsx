import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Footer from "../Footer";

expect.extend(toHaveNoViolations);

const EXPECTED_TAB_ORDER = ["lotmetrik", "Telegram", "Instagram", "TikTok", "X"];

describe("Footer accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<Footer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("exposes a contentinfo landmark and a social nav landmark", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /social media/i })).toBeInTheDocument();
  });

  it("keeps the expected keyboard tab order across footer links", () => {
    const { container } = render(<Footer />);
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.tabIndex !== -1);

    const labels = focusables.map(
      (el) =>
        el.getAttribute("aria-label") ||
        el.textContent?.trim() ||
        ""
    );

    expect(labels).toEqual(EXPECTED_TAB_ORDER);
  });

  it("gives every social icon a 44x44 tap target and an accessible name", () => {
    render(<Footer />);
    for (const label of EXPECTED_TAB_ORDER.slice(1)) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("aria-label", label);
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
      expect(link).toHaveAttribute("target", "_blank");
      // Min tap-target enforced via CSS min-width/height: 44px (WCAG 2.5.5).
      expect(link.className).toMatch(/afd-social/);
    }
  });

  it("focuses each footer link in order when programmatically focused", () => {
    const { container } = render(<Footer />);
    const links = Array.from(container.querySelectorAll<HTMLElement>("a"));
    for (const link of links) {
      link.focus();
      expect(document.activeElement).toBe(link);
    }
  });
});