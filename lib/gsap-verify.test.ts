import { describe, it, expect } from "vitest";

describe("GSAP import verification", () => {
  it("imports gsap successfully", async () => {
    const { gsap } = await import("gsap");
    expect(gsap).toBeDefined();
    expect(typeof gsap.to).toBe("function");
  });
});
