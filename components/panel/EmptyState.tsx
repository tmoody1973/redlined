"use client";

/**
 * Info panel empty state shown when no zone is selected.
 * Displays a heading and instruction text guiding the user to click a zone.
 */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {/* Map pin icon as visual indicator */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
        <svg
          className="h-6 w-6 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          />
        </svg>
      </div>

      <h2
        className="mb-2 text-lg font-semibold text-slate-100"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Select a neighborhood
      </h2>

      <p
        className="max-w-xs text-sm leading-relaxed text-slate-400"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Click any zone or building on the map to see its details
      </p>
    </div>
  );
}
