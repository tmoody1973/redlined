"use client";

import { useState } from "react";
import { generateContentWarningContext } from "@/lib/narrative-text";
import type { HOLCGrade } from "@/types/holc";

interface ContentWarningProps {
  children: React.ReactNode;
  grade?: HOLCGrade | null;
}

/**
 * Dismissible content warning banner displayed above appraiser descriptions
 * that contain original 1938 racist language. Reframed as a narrative entry
 * point that explains why reading the language matters to the story.
 */
export default function ContentWarning({ children, grade }: ContentWarningProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const contextText = generateContentWarningContext(grade ?? null);

  return (
    <div>
      <div
        className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4"
        role="alert"
      >
        <p className="text-sm leading-relaxed text-amber-200/90" style={{ fontFamily: "var(--font-body)" }}>
          {contextText}
        </p>
        <button
          type="button"
          onClick={() => setIsRevealed((prev) => !prev)}
          className="focus-ring mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
        >
          {isRevealed ? "Hide appraisal" : "Read the 1938 appraisal"}
        </button>
      </div>
      {isRevealed && <div className="mt-4">{children}</div>}
    </div>
  );
}
