import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useInputValidation, type ValidationInputs } from "./useInputValidation";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const baseInputs: ValidationInputs = {
  ratioOld: "2",
  ratioNew: "1",
  rightPrice: "500",
  cumDatePrice: "1000",
  currentLots: "10",
  currentAvgPrice: "1000",
  noOwnership: false,
  hmetdLots: "",
  hmetdPrice: "",
  hasWarrant: false,
  warrantRatioOld: "",
  warrantRatioNew: "",
};

const run = (overrides: Partial<ValidationInputs>) =>
  renderHook(() => useInputValidation({ ...baseInputs, ...overrides }), { wrapper }).result.current;

describe("useInputValidation", () => {
  it("passes with valid baseline inputs", () => {
    const r = run({});
    expect(r.hasErrors).toBe(false);
    expect(r.errors).toEqual({});
  });

  describe("price validation", () => {
    it("rejects zero right price", () => {
      const r = run({ rightPrice: "0" });
      expect(r.errors.rightPrice).toBeDefined();
      expect(r.hasErrors).toBe(true);
    });

    it("rejects zero cum-date price", () => {
      const r = run({ cumDatePrice: "0" });
      expect(r.errors.cumDatePrice).toBeDefined();
    });

    it("rejects unrealistic price above 10jt", () => {
      const r = run({ rightPrice: "20000000" });
      expect(r.errors.rightPrice).toMatch(/tidak wajar|unrealistic|tidak realistis/i);
    });

    it("allows empty price (not yet typed)", () => {
      const r = run({ rightPrice: "", cumDatePrice: "" });
      expect(r.errors.rightPrice).toBeUndefined();
      expect(r.errors.cumDatePrice).toBeUndefined();
    });

    it("warns when RI price >= cum price", () => {
      const r = run({ rightPrice: "1000", cumDatePrice: "1000" });
      expect(r.warnings.priceWarning).toBeDefined();
      expect(r.hasErrors).toBe(false);
    });

    it("does not warn when RI < cum", () => {
      const r = run({ rightPrice: "500", cumDatePrice: "1000" });
      expect(r.warnings.priceWarning).toBeUndefined();
    });
  });

  describe("lots validation", () => {
    it("rejects zero current lots", () => {
      const r = run({ currentLots: "0" });
      expect(r.errors.currentLots).toBeDefined();
    });

    it("rejects unrealistic lot count", () => {
      const r = run({ currentLots: "999999999" });
      expect(r.errors.currentLots).toMatch(/tidak wajar|unrealistic|tidak realistis/i);
    });

    it("accepts normal lot count", () => {
      const r = run({ currentLots: "100" });
      expect(r.errors.currentLots).toBeUndefined();
    });
  });

  describe("ratio validation", () => {
    it("rejects zero ratio", () => {
      const r = run({ ratioOld: "0" });
      expect(r.errors.ratioOld).toBeDefined();
    });

    it("rejects unrealistic ratio", () => {
      const r = run({ ratioNew: "9999999" });
      expect(r.errors.ratioNew).toMatch(/tidak wajar|unrealistic|tidak realistis/i);
    });

    it("accepts decimal ratio with comma", () => {
      const r = run({ ratioOld: "2", ratioNew: "1,5" });
      expect(r.errors.ratioOld).toBeUndefined();
      expect(r.errors.ratioNew).toBeUndefined();
    });
  });

  describe("HMETD / no-ownership mode", () => {
    it("requires HMETD lots when no ownership", () => {
      const r = run({ noOwnership: true, hmetdLots: "0", currentLots: "" });
      expect(r.errors.hmetdLots).toBeDefined();
    });

    it("rejects negative HMETD price", () => {
      const r = run({ noOwnership: true, hmetdLots: "5", hmetdPrice: "-100" });
      // parseInt('-100') => -100, our check is n < 0
      expect(r.errors.hmetdPrice).toBeDefined();
    });

    it("allows zero HMETD price (free)", () => {
      const r = run({ noOwnership: true, hmetdLots: "5", hmetdPrice: "0" });
      expect(r.errors.hmetdPrice).toBeUndefined();
    });

    it("does not validate ownership fields in no-ownership mode", () => {
      const r = run({ noOwnership: true, hmetdLots: "5", currentLots: "0", currentAvgPrice: "0" });
      expect(r.errors.currentLots).toBeUndefined();
      expect(r.errors.currentAvgPrice).toBeUndefined();
    });
  });

  describe("warrant validation", () => {
    it("requires warrant ratios when warrant enabled", () => {
      const r = run({ hasWarrant: true, warrantRatioOld: "0", warrantRatioNew: "1" });
      expect(r.errors.warrantRatioOld).toBeDefined();
    });

    it("ignores warrant ratios when disabled", () => {
      const r = run({ hasWarrant: false, warrantRatioOld: "0", warrantRatioNew: "0" });
      expect(r.errors.warrantRatioOld).toBeUndefined();
      expect(r.errors.warrantRatioNew).toBeUndefined();
    });
  });
});