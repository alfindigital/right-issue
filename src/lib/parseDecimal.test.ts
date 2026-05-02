import { describe, it, expect } from "vitest";
import { parseDecimalId, sanitizeRatioInput } from "./parseDecimal";

describe("parseDecimalId", () => {
  it("returns 0 for empty string", () => {
    expect(parseDecimalId("")).toBe(0);
  });

  it("parses integer strings", () => {
    expect(parseDecimalId("5")).toBe(5);
  });

  it("parses Indonesian decimal (comma)", () => {
    expect(parseDecimalId("1,5")).toBe(1.5);
    expect(parseDecimalId("0,25")).toBe(0.25);
  });

  it("returns 0 for non-numeric input", () => {
    expect(parseDecimalId("abc")).toBe(0);
  });

  it("handles very large numbers", () => {
    expect(parseDecimalId("999999999")).toBe(999999999);
  });

  it("handles negative-looking input as parsed number", () => {
    // parseFloat will accept the leading minus
    expect(parseDecimalId("-3")).toBe(-3);
  });
});

describe("sanitizeRatioInput", () => {
  it("strips letters and symbols", () => {
    expect(sanitizeRatioInput("12abc!@#")).toBe("12");
  });

  it("keeps digits and a single comma", () => {
    expect(sanitizeRatioInput("1,5")).toBe("1,5");
  });

  it("collapses multiple commas to one", () => {
    expect(sanitizeRatioInput("1,5,7")).toBe("1,57");
  });

  it("strips negative sign", () => {
    expect(sanitizeRatioInput("-3")).toBe("3");
  });

  it("returns empty for fully invalid input", () => {
    expect(sanitizeRatioInput("abc")).toBe("");
  });
});