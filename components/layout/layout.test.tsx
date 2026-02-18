import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";
import { SplitPanel } from "./SplitPanel";
import { EmptyState } from "@/components/panel/EmptyState";
import { IntroOverlay } from "@/components/ui/IntroOverlay";

// Mock the zone selection context so components that depend on it work
vi.mock("@/lib/zone-selection", () => ({
  useZoneSelection: () => ({
    selectedZoneId: null,
    selectZone: vi.fn(),
    clearSelection: vi.fn(),
  }),
  ZoneSelectionProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

describe("Layout Components", () => {
  describe("Header renders REDLINED title, subtitle, and Milwaukee 1938 pill", () => {
    it("renders all branding elements", () => {
      render(<Header />);

      expect(screen.getByText("REDLINED")).toBeInTheDocument();
      expect(screen.getByText("THE SHAPE OF INEQUALITY")).toBeInTheDocument();
      expect(screen.getByText("Milwaukee 1938")).toBeInTheDocument();
    });

    it("uses a header element with h1 for the app title", () => {
      render(<Header />);

      const header = screen.getByRole("banner");
      expect(header).toBeInTheDocument();

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
    });
  });

  describe("Coordinates display shows Milwaukee coordinates in IBM Plex Mono", () => {
    it('renders "43.0389 N, 87.9065 W" with monospace font', () => {
      render(<Header />);

      const coords = screen.getByText(/43\.0389.*N.*87\.9065.*W/);
      expect(coords).toBeInTheDocument();

      const style = coords.getAttribute("style") ?? "";
      expect(style).toContain("var(--font-mono)");
    });
  });

  describe("Landing overlay renders on first load and dismisses on click", () => {
    it("shows the intro overlay initially", () => {
      render(<IntroOverlay onDismiss={vi.fn()} />);

      // Title is split across spans, so use a function matcher
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading.textContent).toBe(
        "REDLINED: The Shape of Inequality",
      );
      expect(screen.getByText(/Click a zone to begin/)).toBeInTheDocument();
    });

    it("calls onDismiss when clicked", () => {
      const handleDismiss = vi.fn();
      render(<IntroOverlay onDismiss={handleDismiss} />);

      const overlay = screen.getByRole("button", {
        name: /dismiss intro overlay/i,
      });
      fireEvent.click(overlay);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("Empty state shows 'Select a neighborhood' when no zone is selected", () => {
    it("renders the empty state heading and instruction text", () => {
      render(<EmptyState />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Select a neighborhood");

      expect(
        screen.getByText(
          /Click any zone or building on the map to see its details/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Split-panel layout renders canvas and info panel side-by-side", () => {
    it("renders both canvas slot and info panel slot", () => {
      render(
        <SplitPanel
          canvas={<div data-testid="canvas-slot">Canvas</div>}
          panel={<div data-testid="panel-slot">Panel</div>}
        />,
      );

      expect(screen.getByTestId("canvas-slot")).toBeInTheDocument();
      // Panel content is rendered in both the desktop sidebar and the mobile
      // bottom sheet, so we expect at least one instance to be present.
      const panels = screen.getAllByTestId("panel-slot");
      expect(panels.length).toBeGreaterThanOrEqual(1);
    });
  });
});
