"use client";

interface HeaderProps {
  onAboutClick?: () => void;
}

/**
 * Application header bar with REDLINED branding, subtitle, Milwaukee 1938 pill
 * badge, geographic coordinates, and an "About" button.
 */
export function Header({ onAboutClick }: HeaderProps) {
  return (
    <header className="flex flex-col gap-1 px-4 py-3 md:px-6">
      <nav aria-label="Application navigation">
        <div className="flex items-center gap-3 md:gap-4">
          <h1
            className="text-lg font-bold tracking-wide md:text-xl"
            style={{
              fontFamily: "var(--font-heading)",
              color: "#F44336",
            }}
          >
            REDLINED
          </h1>

          <span
            className="hidden text-sm tracking-widest text-slate-400 uppercase sm:inline"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            THE SHAPE OF INEQUALITY
          </span>

          <span className="ml-auto flex items-center gap-2 sm:ml-4">
            <span
              className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Milwaukee 1938
            </span>

            {onAboutClick && (
              <button
                onClick={onAboutClick}
                className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
                style={{ fontFamily: "var(--font-heading)" }}
                aria-label="About the map"
              >
                About
              </button>
            )}
          </span>
        </div>
      </nav>

      <div
        className="text-xs text-slate-400"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        43.0389&deg; N, 87.9065&deg; W
      </div>
    </header>
  );
}
