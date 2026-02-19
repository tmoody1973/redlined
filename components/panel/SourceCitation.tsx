"use client";

import { useResearch } from "@/lib/research-context";

interface SourceCitationProps {
  /** Paper id from research-context.json. */
  paperId: string;
  /** Short display label, e.g. "Lynch et al., 2021". */
  label: string;
  /** Optional inline quote or finding to display alongside the link. */
  finding?: string;
}

/**
 * Inline citation link that opens the research PDF modal when clicked.
 * Used in statistics panels to source data claims to academic research.
 */
export function SourceCitation({ paperId, label, finding }: SourceCitationProps) {
  const { openPaper } = useResearch();

  return (
    <div className="mt-3 rounded-md border border-slate-700/50 bg-slate-800/40 px-3 py-2.5">
      {finding && (
        <p
          className="mb-2 text-[11px] leading-relaxed text-slate-300 italic"
          style={{ fontFamily: "var(--font-body)" }}
        >
          &ldquo;{finding}&rdquo;
        </p>
      )}
      <button
        onClick={() => openPaper(paperId)}
        className="flex items-center gap-1.5 text-[10px] font-medium text-blue-400 transition-colors hover:text-blue-300"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <svg
          className="h-3 w-3 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <span>Source: {label}</span>
        <span className="text-slate-500">&mdash; View PDF</span>
      </button>
    </div>
  );
}
