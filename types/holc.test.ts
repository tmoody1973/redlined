import { describe, it, expect } from "vitest";
import { HOLC_COLORS, HOLC_DESCRIPTORS, HOLC_HEIGHTS } from "./holc";

describe("HOLC type constants", () => {
  it("defines correct grade colors", () => {
    expect(HOLC_COLORS.A).toBe("#4CAF50");
    expect(HOLC_COLORS.B).toBe("#2196F3");
    expect(HOLC_COLORS.C).toBe("#FFEB3B");
    expect(HOLC_COLORS.D).toBe("#F44336");
    expect(HOLC_COLORS.ungraded).toBe("#9E9E9E");
  });

  it("defines correct grade descriptors", () => {
    expect(HOLC_DESCRIPTORS.A).toBe("Best");
    expect(HOLC_DESCRIPTORS.B).toBe("Still Desirable");
    expect(HOLC_DESCRIPTORS.C).toBe("Declining");
    expect(HOLC_DESCRIPTORS.D).toBe("Hazardous");
    expect(HOLC_DESCRIPTORS.ungraded).toBe("Ungraded");
  });

  it("maps D-grade as tallest extrusion height", () => {
    expect(HOLC_HEIGHTS.D).toBeGreaterThan(HOLC_HEIGHTS.C);
    expect(HOLC_HEIGHTS.C).toBeGreaterThan(HOLC_HEIGHTS.B);
    expect(HOLC_HEIGHTS.B).toBeGreaterThan(HOLC_HEIGHTS.A);
    expect(HOLC_HEIGHTS.A).toBeGreaterThan(HOLC_HEIGHTS.ungraded);
  });
});
