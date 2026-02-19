"use client";

import { useState, type ReactNode } from "react";

interface CollapsibleSectionProps {
  heading: ReactNode;
  subtext?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
  ariaLabel?: string;
}

/**
 * Reusable disclosure component. The heading and optional subtext are
 * always visible; the children are revealed on expand via a chevron toggle.
 */
export default function CollapsibleSection({
  heading,
  subtext,
  children,
  defaultOpen = false,
  accentColor = "rgb(51 65 85)", // slate-700
  ariaLabel,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section aria-label={ariaLabel} className="border-l-2" style={{ borderColor: accentColor }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="focus-ring flex w-full items-start justify-between gap-2 rounded-r-md px-3 py-2 text-left transition-colors hover:bg-slate-800/40"
        aria-expanded={isOpen}
      >
        <div className="min-w-0 flex-1">
          <div>{heading}</div>
          {subtext && <div className="mt-1">{subtext}</div>}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`mt-1 shrink-0 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && <div className="mt-2 pl-3">{children}</div>}
    </section>
  );
}
