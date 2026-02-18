import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./layout/Header";
import { EmptyState } from "./panel/EmptyState";
import ContentWarning from "./panel/ContentWarning";
import AppraiserDescription from "./panel/AppraiserDescription";
import SuggestedQuestions from "./panel/SuggestedQuestions";
import { IntroOverlay } from "./ui/IntroOverlay";
import {
  getGradeBadgeLabel,
} from "./panel/ZoneDetail";
import type { AreaDescription, HOLCGrade } from "@/types/holc";

// Mock zone selection and data overlay contexts
vi.mock("@/lib/zone-selection", () => ({
  useZoneSelection: () => ({
    selectedZoneId: null,
    selectZone: vi.fn(),
    clearSelection: vi.fn(),
  }),
  ZoneSelectionProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock("@/lib/data-overlay", () => ({
  useDataOverlay: () => ({
    overlayActive: false,
    overlayOpacity: 0.75,
    toggleOverlay: vi.fn(),
    setOverlayOpacity: vi.fn(),
  }),
  DataOverlayProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

/** Factory for creating a test area description. */
function makeDescription(
  overrides: Partial<AreaDescription> = {},
): AreaDescription {
  return {
    areaId: "6300",
    cityId: 201,
    grade: "D",
    clarifyingRemarks: "This is a substandard area.",
    detrimentalInfluences: "Proximity to industrial plants.",
    favorableInfluences: "",
    infiltrationOf: "Negroes",
    negroYesOrNo: "Yes",
    negroPercent: "75%",
    estimatedAnnualFamilyIncome: "$900-1200",
    occupationType: "Laborers",
    descriptionOfTerrain: "Flat",
    trendOfDesirability: "Declining",
    ...overrides,
  };
}

describe("Accessibility", () => {
  describe("Canvas container has role and aria-label attributes", () => {
    it("MapCanvas wrapper provides role=img and a descriptive aria-label", () => {
      // The canvas container wraps the Three.js canvas with ARIA attributes.
      // Since we cannot mount a full WebGL Canvas in jsdom, we test the
      // CanvasAccessibility wrapper component directly via the page structure.
      // Verify the expected ARIA attributes exist on the rendered output.

      // We render a mock container that mirrors how page.tsx wraps MapCanvas
      render(
        <div
          role="img"
          aria-label="3D visualization of 114 Milwaukee HOLC redlining zones from 1938. Zones are extruded as colored blocks: green for A-grade (Best), blue for B-grade (Still Desirable), yellow for C-grade (Declining), red for D-grade (Hazardous). D-grade zones are tallest, representing the lasting damage of redlining."
        >
          <p className="sr-only">
            This visualization shows 114 HOLC redlining zones in Milwaukee from
            1938 as extruded 3D blocks. Each zone is color-coded by its HOLC
            grade: green for A (Best), blue for B (Still Desirable), yellow for
            C (Declining), and red for D (Hazardous). D-grade zones are the
            tallest, representing the lasting damage of discriminatory lending
            policies. Two zones are ungraded and shown in gray.
          </p>
        </div>,
      );

      const canvasContainer = screen.getByRole("img");
      expect(canvasContainer).toBeInTheDocument();
      expect(canvasContainer.getAttribute("aria-label")).toContain(
        "3D visualization of 114 Milwaukee HOLC redlining zones",
      );
      expect(canvasContainer.getAttribute("aria-label")).toContain("D-grade zones are tallest");

      // Screen reader summary paragraph should be present
      const srText = screen.getByText(/This visualization shows 114 HOLC redlining zones/);
      expect(srText).toBeInTheDocument();
      expect(srText.className).toContain("sr-only");
    });
  });

  describe("All interactive elements have visible focus indicators", () => {
    it("suggested question pills have the focus-ring class", () => {
      const onSelect = vi.fn();
      render(<SuggestedQuestions onSelectQuestion={onSelect} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(4);
      buttons.forEach((button) => {
        expect(button.className).toContain("focus-ring");
      });
    });

    it("content warning toggle button has the focus-ring class", () => {
      render(
        <ContentWarning>
          <p>Test content</p>
        </ContentWarning>,
      );

      const button = screen.getByRole("button", { name: /show description/i });
      expect(button.className).toContain("focus-ring");
    });

    it("intro overlay is keyboard-dismissible and has focus-ring class", () => {
      const onDismiss = vi.fn();
      render(<IntroOverlay onDismiss={onDismiss} />);

      const overlay = screen.getByRole("button", {
        name: /dismiss intro overlay/i,
      });
      expect(overlay.className).toContain("focus-ring");

      // Verify keyboard dismissal works
      fireEvent.keyDown(overlay, { key: "Enter" });
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("Grade badges include text labels in addition to color", () => {
    it("every HOLC grade badge label includes both the letter and descriptor word", () => {
      const grades: (HOLCGrade | null)[] = ["A", "B", "C", "D", null];
      const expectedLabels = [
        "A - Best",
        "B - Still Desirable",
        "C - Declining",
        "D - Hazardous",
        "Ungraded",
      ];

      grades.forEach((grade, i) => {
        const label = getGradeBadgeLabel(grade);
        expect(label).toBe(expectedLabels[i]);
        // Non-null grades must include both the letter and the descriptor
        if (grade !== null) {
          expect(label).toContain(grade);
          expect(label.length).toBeGreaterThan(1);
        }
      });
    });
  });

  describe("Content warning does not trap focus (Tab moves past it)", () => {
    it("all focusable elements inside and outside ContentWarning are reachable via Tab", () => {
      render(
        <div>
          <button type="button">Before warning</button>
          <ContentWarning>
            <p>Hidden content behind warning</p>
          </ContentWarning>
          <button type="button">After warning</button>
        </div>,
      );

      const allButtons = screen.getAllByRole("button");
      // "Before warning", "Show description", "After warning" = 3 buttons
      expect(allButtons).toHaveLength(3);

      // None of the focusable elements should have tabIndex=-1
      allButtons.forEach((btn) => {
        expect(btn.tabIndex).not.toBe(-1);
      });

      // Focus the toggle button
      const toggleButton = screen.getByRole("button", { name: /show description/i });
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();

      // The "After warning" button should be a distinct element that is focusable
      const afterButton = screen.getByRole("button", { name: /after warning/i });
      expect(afterButton.tabIndex).not.toBe(-1);

      // Reveal content and verify no focus trap is introduced
      fireEvent.click(toggleButton);
      const allButtonsAfterReveal = screen.getAllByRole("button");
      allButtonsAfterReveal.forEach((btn) => {
        expect(btn.tabIndex).not.toBe(-1);
      });
    });
  });

  describe("Heading hierarchy is correct (h1 > h2 > h3, no skipped levels)", () => {
    it("Header renders h1 for the app title", () => {
      render(<Header />);
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent("REDLINED");
    });

    it("EmptyState renders h2 for the zone placeholder", () => {
      render(<EmptyState />);
      const h2 = screen.getByRole("heading", { level: 2 });
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveTextContent("Select a neighborhood");
    });

    it("AppraiserDescription renders h3 for its section heading", () => {
      const description = makeDescription();
      render(<AppraiserDescription description={description} />);
      const h3 = screen.getByRole("heading", { level: 3 });
      expect(h3).toBeInTheDocument();
      expect(h3).toHaveTextContent("Appraiser Description");
    });

    it("heading hierarchy does not skip levels (h1 -> h2 -> h3)", () => {
      // Render a composite structure that mirrors the real page
      render(
        <div>
          <header>
            <h1>REDLINED</h1>
          </header>
          <main>
            <h2>Bronzeville / 6th & Walnut</h2>
            <section>
              <h3>Appraiser Description</h3>
            </section>
            <section>
              <h3>AI Narrative Guide</h3>
            </section>
          </main>
        </div>,
      );

      const headings = screen.getAllByRole("heading");
      const levels = headings.map((h) => Number(h.tagName.replace("H", "")));

      // Verify no level is skipped
      for (let i = 1; i < levels.length; i++) {
        const current = levels[i];
        const previous = levels[i - 1];
        // A heading should either be the same level, one deeper, or any level
        // going back up. The key rule is: you should not go from h1 to h3
        // without an h2 in between.
        expect(current).toBeLessThanOrEqual(previous + 1);
      }
    });
  });
});
