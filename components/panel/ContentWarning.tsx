"use client";

import { useState } from "react";

interface ContentWarningProps {
  children: React.ReactNode;
}

/**
 * Dismissible content warning banner displayed above appraiser descriptions
 * that contain original 1938 racist language. Uses amber/secondary color scheme
 * and toggles visibility of the wrapped content.
 */
export default function ContentWarning({ children }: ContentWarningProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div>
      <div
        className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4"
        role="alert"
      >
        <p className="text-sm leading-relaxed text-amber-200/90" style={{ fontFamily: "var(--font-body)" }}>
          The following contains original 1938 language from HOLC appraisers,
          including racist terminology and discriminatory assessments.
        </p>
        <button
          type="button"
          onClick={() => setIsRevealed((prev) => !prev)}
          className="focus-ring mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
        >
          {isRevealed ? "Hide description" : "Show description"}
        </button>
      </div>
      {isRevealed && <div className="mt-4">{children}</div>}
    </div>
  );
}
