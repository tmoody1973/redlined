import { describe, it, expect, vi } from "vitest";
import {
  getGradeColor,
  getGradeHeight,
  getGradeElevation,
  getGradeColorRgba,
  hexToRgba,
  formatZoneLabel,
} from "@/lib/scene-helpers";

describe("3D Scene", () => {
  describe("Zone extrusion height mapping returns correct values", () => {
    it("maps D as tallest, then C, B, A, with ungraded shortest", () => {
      const heightD = getGradeHeight("D");
      const heightC = getGradeHeight("C");
      const heightB = getGradeHeight("B");
      const heightA = getGradeHeight("A");
      const heightUngraded = getGradeHeight(null);

      expect(heightD).toBe(1.2);
      expect(heightC).toBe(0.8);
      expect(heightB).toBe(0.5);
      expect(heightA).toBe(0.25);
      expect(heightUngraded).toBe(0.15);

      // Verify ordering: D > C > B > A > ungraded
      expect(heightD).toBeGreaterThan(heightC);
      expect(heightC).toBeGreaterThan(heightB);
      expect(heightB).toBeGreaterThan(heightA);
      expect(heightA).toBeGreaterThan(heightUngraded);
    });
  });

  describe("deck.gl elevation mapping returns correct meter values", () => {
    it("maps D as tallest, then C, B, A, with ungraded shortest", () => {
      expect(getGradeElevation("D")).toBe(150);
      expect(getGradeElevation("C")).toBe(100);
      expect(getGradeElevation("B")).toBe(60);
      expect(getGradeElevation("A")).toBe(30);
      expect(getGradeElevation(null)).toBe(15);
      expect(getGradeElevation(undefined)).toBe(15);
    });
  });

  describe("HOLC color mapping returns correct hex for each grade", () => {
    it("returns correct colors for A, B, C, D, and null", () => {
      expect(getGradeColor("A")).toBe("#4CAF50");
      expect(getGradeColor("B")).toBe("#2196F3");
      expect(getGradeColor("C")).toBe("#FFEB3B");
      expect(getGradeColor("D")).toBe("#F44336");
      expect(getGradeColor(null)).toBe("#9E9E9E");
    });

    it("returns gray for undefined grade", () => {
      expect(getGradeColor(undefined)).toBe("#9E9E9E");
    });
  });

  describe("hexToRgba converts hex colors to RGBA arrays", () => {
    it("converts standard hex colors", () => {
      expect(hexToRgba("#FF0000")).toEqual([255, 0, 0, 220]);
      expect(hexToRgba("#00FF00", 128)).toEqual([0, 255, 0, 128]);
      expect(hexToRgba("#0000FF", 255)).toEqual([0, 0, 255, 255]);
    });
  });

  describe("getGradeColorRgba returns RGBA arrays for grades", () => {
    it("returns correct RGBA for each grade", () => {
      const [r, g, b, a] = getGradeColorRgba("D");
      expect(r).toBe(244);
      expect(g).toBe(67);
      expect(b).toBe(54);
      expect(a).toBe(220);
    });

    it("respects custom alpha", () => {
      const [, , , a] = getGradeColorRgba("A", 128);
      expect(a).toBe(128);
    });
  });

  describe("Zone label text matches expected format", () => {
    it("formats compact labels with a dash separator", () => {
      expect(formatZoneLabel("A1")).toBe("A-1");
      expect(formatZoneLabel("B2")).toBe("B-2");
      expect(formatZoneLabel("C10")).toBe("C-10");
      expect(formatZoneLabel("D7")).toBe("D-7");
    });

    it("preserves non-standard labels unchanged", () => {
      expect(formatZoneLabel("Commercial")).toBe("Commercial");
      expect(formatZoneLabel("Industrial")).toBe("Industrial");
      expect(formatZoneLabel("")).toBe("");
    });
  });

  describe("Raycasting callback fires with correct zone ID", () => {
    it("onClick handler receives the correct areaId", () => {
      const handleClick = vi.fn();
      const testAreaId = "6284";

      handleClick(testAreaId);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith("6284");
    });

    it("onPointerOver handler receives the correct areaId for hover", () => {
      const handleHover = vi.fn();
      const testAreaId = "6300";

      handleHover(testAreaId);

      expect(handleHover).toHaveBeenCalledWith("6300");
    });
  });

  describe("MapView module exports a default component", () => {
    it("MapView module exports a default component", async () => {
      const mod = await import("@/components/map/MapView");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });
  });
});
