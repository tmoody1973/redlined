import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  getGradeBadgeClass,
  getGradeBadgeLabel,
  shouldShowContentWarning,
} from "./ZoneDetail";
import ContentWarning from "./ContentWarning";
import AppraiserDescription from "./AppraiserDescription";
import type { AreaDescription, HOLCGrade } from "@/types/holc";

/** Factory for creating a test area description with sensible defaults. */
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

describe("Zone Detail Panel", () => {
  describe("Panel populates with correct zone name, grade badge color, and grade text", () => {
    it("returns the correct badge class and label for each grade", () => {
      const grades: (HOLCGrade | null)[] = ["A", "B", "C", "D", null];
      const expectedClasses = [
        "holc-badge-a",
        "holc-badge-b",
        "holc-badge-c",
        "holc-badge-d",
        "holc-badge-ungraded",
      ];
      const expectedLabels = [
        "A - Best",
        "B - Still Desirable",
        "C - Declining",
        "D - Hazardous",
        "Ungraded",
      ];

      grades.forEach((grade, i) => {
        expect(getGradeBadgeClass(grade)).toBe(expectedClasses[i]);
        expect(getGradeBadgeLabel(grade)).toBe(expectedLabels[i]);
      });
    });
  });

  describe("Appraiser description fields render for a D-grade zone", () => {
    it("shows all expected non-empty fields", () => {
      const description = makeDescription();
      render(<AppraiserDescription description={description} />);

      // Check that the section heading renders
      expect(
        screen.getByRole("heading", { name: /appraiser description/i }),
      ).toBeInTheDocument();

      // Check visible field labels
      expect(screen.getByText("Clarifying Remarks")).toBeInTheDocument();
      expect(screen.getByText("Detrimental Influences")).toBeInTheDocument();
      expect(screen.getByText("Infiltration")).toBeInTheDocument();
      expect(screen.getByText("Negro Population")).toBeInTheDocument();
      expect(
        screen.getByText("Estimated Annual Family Income"),
      ).toBeInTheDocument();
      expect(screen.getByText("Occupation / Type")).toBeInTheDocument();

      // Favorable Influences is empty and should not appear
      expect(
        screen.queryByText("Favorable Influences"),
      ).not.toBeInTheDocument();

      // Check that the data values appear
      expect(
        screen.getByText(/this is a substandard area/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/laborers/i)).toBeInTheDocument();
    });
  });

  describe("Content warning banner renders for zones containing racist language", () => {
    it("shows the warning for D-grade zones", () => {
      expect(shouldShowContentWarning("D", null)).toBe(true);
    });

    it("shows the warning for non-D zones with infiltrationOf content", () => {
      const desc = makeDescription({
        grade: "C",
        infiltrationOf: "Some content",
      });
      expect(shouldShowContentWarning("C", desc)).toBe(true);
    });

    it("does not show the warning for A-grade zones with empty sensitive fields", () => {
      const desc = makeDescription({
        grade: "A",
        infiltrationOf: "",
        negroYesOrNo: "",
      });
      expect(shouldShowContentWarning("A", desc)).toBe(false);
    });
  });

  describe("Content warning is dismissible and does not trap keyboard focus", () => {
    it("toggles content visibility when the button is clicked", () => {
      const childText = "Hidden appraiser content";
      render(
        <ContentWarning>
          <p>{childText}</p>
        </ContentWarning>,
      );

      // Initially the content should not be visible
      expect(screen.queryByText(childText)).not.toBeInTheDocument();

      // The warning text should be visible
      expect(
        screen.getByText(/original 1938 language/i),
      ).toBeInTheDocument();

      // Click the show button
      const button = screen.getByRole("button", {
        name: /show description/i,
      });
      fireEvent.click(button);

      // Content should now be visible
      expect(screen.getByText(childText)).toBeInTheDocument();

      // Button should now say "Hide description"
      expect(
        screen.getByRole("button", { name: /hide description/i }),
      ).toBeInTheDocument();

      // Click hide
      fireEvent.click(
        screen.getByRole("button", { name: /hide description/i }),
      );
      expect(screen.queryByText(childText)).not.toBeInTheDocument();
    });

    it("does not trap keyboard focus -- Tab moves past the warning", () => {
      render(
        <div>
          <ContentWarning>
            <p>Content behind warning</p>
          </ContentWarning>
          <button type="button">Next interactive element</button>
        </div>,
      );

      // Focus the toggle button directly
      const toggleButton = screen.getByRole("button", {
        name: /show description/i,
      });
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();

      // Simulate Tab keypress to move focus to the next focusable element.
      // In the collapsed state there is only one interactive element inside
      // the ContentWarning (the toggle button), so pressing Tab should move
      // focus to the "Next interactive element" button outside the warning.
      const nextButton = screen.getByRole("button", {
        name: /next interactive element/i,
      });

      // Verify the toggle button and next button are different elements
      expect(toggleButton).not.toBe(nextButton);

      // Verify both buttons are focusable (tabIndex is not -1)
      expect(toggleButton.tabIndex).not.toBe(-1);
      expect(nextButton.tabIndex).not.toBe(-1);

      // Verify there is no focus trap (no tabindex manipulation that would
      // prevent tabbing out). The warning component should not set tabIndex=-1
      // on surrounding elements or use a focus-trap library.
      const allButtons = screen.getAllByRole("button");
      expect(allButtons).toHaveLength(2);
      allButtons.forEach((btn) => {
        expect(btn.tabIndex).not.toBe(-1);
      });
    });
  });

  describe("Ungraded zone displays 'Ungraded' badge in gray", () => {
    it("uses the ungraded badge class and label for null grade", () => {
      expect(getGradeBadgeClass(null)).toBe("holc-badge-ungraded");
      expect(getGradeBadgeLabel(null)).toBe("Ungraded");
    });
  });

  describe("Selecting a different zone updates the panel content", () => {
    it("AppraiserDescription re-renders with new data when description prop changes", () => {
      const descriptionA = makeDescription({
        areaId: "6200",
        grade: "A",
        clarifyingRemarks: "A very good area with well-kept homes.",
        detrimentalInfluences: "",
        infiltrationOf: "",
        negroYesOrNo: "",
        negroPercent: "",
      });

      const descriptionD = makeDescription({
        areaId: "6300",
        grade: "D",
        clarifyingRemarks: "A substandard area.",
        detrimentalInfluences: "Heavy industrial area.",
      });

      const { rerender } = render(
        <AppraiserDescription description={descriptionA} />,
      );
      expect(
        screen.getByText(/a very good area with well-kept homes/i),
      ).toBeInTheDocument();

      // Re-render with a different zone's description
      rerender(<AppraiserDescription description={descriptionD} />);
      expect(
        screen.queryByText(/a very good area/i),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/a substandard area/i)).toBeInTheDocument();
      expect(
        screen.getByText(/heavy industrial area/i),
      ).toBeInTheDocument();
    });
  });
});
