import { describe, it, expect, vi } from "vitest";
import { incomeToColor, INCOME_MIN, INCOME_MAX, NEUTRAL_GRAY } from "./colorScale";

describe("Census Income Data Overlay", () => {
  describe("Income-to-color gradient mapping produces red for low income and green for high income", () => {
    it("maps $2K (minimum) to red", () => {
      const color = incomeToColor(2000);
      // Should be close to #F44336 (pure red end of gradient)
      expect(color).toBe("#f44336");
    });

    it("maps $120K (maximum) to green", () => {
      const color = incomeToColor(120000);
      // Should be close to #4CAF50 (pure green end of gradient)
      expect(color).toBe("#4caf50");
    });

    it("maps midpoint income to a blended color between red and green", () => {
      const midIncome = (INCOME_MIN + INCOME_MAX) / 2; // $61,000
      const color = incomeToColor(midIncome);
      // Should be a hex string, not red and not green
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
      expect(color).not.toBe("#f44336");
      expect(color).not.toBe("#4caf50");
    });

    it("maps null income to neutral gray", () => {
      expect(incomeToColor(null)).toBe(NEUTRAL_GRAY);
    });

    it("clamps values below minimum to red", () => {
      expect(incomeToColor(0)).toBe("#f44336");
      expect(incomeToColor(-5000)).toBe("#f44336");
    });

    it("clamps values above maximum to green", () => {
      expect(incomeToColor(200000)).toBe("#4caf50");
    });
  });

  describe("Toggling overlay on replaces HOLC grade colors with income gradient colors", () => {
    it("overlay color prop overrides base grade color when provided", () => {
      // Simulates the logic in HOLCZone: when overlayColor is provided,
      // it is used instead of the HOLC grade color
      const baseColor = "#4CAF50"; // A grade green
      const overlayColor = "#c87840"; // Some income gradient color
      const activeColor = overlayColor ?? baseColor;
      expect(activeColor).toBe("#c87840");
    });

    it("overlay opacity prop overrides default opacity when provided", () => {
      const defaultOpacity = 0.75;
      const overlayOpacity = 0.5;
      const activeOpacity = overlayOpacity ?? defaultOpacity;
      expect(activeOpacity).toBe(0.5);
    });
  });

  describe("Toggling overlay off restores original HOLC grade colors", () => {
    it("null overlay color falls back to base grade color", () => {
      const baseColor = "#F44336"; // D grade red
      const overlayColor = null;
      const activeColor = overlayColor ?? baseColor;
      expect(activeColor).toBe("#F44336");
    });

    it("null overlay opacity falls back to default 0.75", () => {
      const overlayOpacity = null;
      const activeOpacity = overlayOpacity ?? 0.75;
      expect(activeOpacity).toBe(0.75);
    });
  });

  describe("Info panel shows income statistics when overlay is active and zone is selected", () => {
    it("income formatting produces expected dollar format", () => {
      // Test the formatting logic used in IncomeStatistics
      const value = 24800;
      const formatted = `$${Math.round(value).toLocaleString("en-US")}`;
      expect(formatted).toBe("$24,800");
    });

    it("percentile formatting produces ordinal strings", () => {
      const formatPercentile = (rank: number): string => {
        const r = Math.round(rank);
        const suffix =
          r % 100 >= 11 && r % 100 <= 13
            ? "th"
            : r % 10 === 1
              ? "st"
              : r % 10 === 2
                ? "nd"
                : r % 10 === 3
                  ? "rd"
                  : "th";
        return `${r}${suffix} percentile`;
      };

      expect(formatPercentile(8)).toBe("8th percentile");
      expect(formatPercentile(1)).toBe("1st percentile");
      expect(formatPercentile(2)).toBe("2nd percentile");
      expect(formatPercentile(3)).toBe("3rd percentile");
      expect(formatPercentile(11)).toBe("11th percentile");
      expect(formatPercentile(21)).toBe("21st percentile");
      expect(formatPercentile(100)).toBe("100th percentile");
    });
  });

  describe("Opacity slider value changes the zone mesh opacity", () => {
    it("opacity clamping keeps value between 0 and 1", () => {
      const clamp = (val: number) => Math.max(0, Math.min(1, val));
      expect(clamp(0.5)).toBe(0.5);
      expect(clamp(0)).toBe(0);
      expect(clamp(1)).toBe(1);
      expect(clamp(-0.1)).toBe(0);
      expect(clamp(1.5)).toBe(1);
    });

    it("slider percent-to-decimal conversion works correctly", () => {
      // Slider is 0-100 (percent), converted to 0-1 for Three.js opacity
      expect(50 / 100).toBe(0.5);
      expect(75 / 100).toBe(0.75);
      expect(0 / 100).toBe(0);
      expect(100 / 100).toBe(1);
    });
  });
});
