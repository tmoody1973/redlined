"use client";

interface IntroOverlayProps {
  onDismiss: () => void;
}

/**
 * Landing intro overlay displayed on first load over the canvas area.
 * Shows the application title, a brief description, and a call-to-action.
 * Dismisses on click/tap anywhere on the overlay. Does not trap keyboard focus.
 */
export function IntroOverlay({ onDismiss }: IntroOverlayProps) {
  return (
    <div
      className="focus-ring absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="button"
      tabIndex={0}
      aria-label="Dismiss intro overlay"
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDismiss();
        }
      }}
    >
      <div className="mx-4 max-w-lg text-center">
        <h2
          className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span style={{ color: "#F44336" }}>REDLINED</span>
          <span className="text-slate-200">: The Shape of Inequality</span>
        </h2>

        <p
          className="mb-8 text-base leading-relaxed text-slate-300 md:text-lg"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Explore Milwaukee&rsquo;s 1938 HOLC redlining zones in 3D. See how
          federal appraisers graded neighborhoods&mdash;and how those decisions
          shaped the city for generations.
        </p>

        <p
          className="text-sm tracking-wide text-slate-400"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Click a zone to begin
        </p>
      </div>
    </div>
  );
}
