"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/** Metadata for a single research paper. */
export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  institution?: string;
  journal?: string;
  pdfPath: string;
  topics: string[];
  keyFindings: string[];
  quotes: { text: string; source: string; topic: string }[];
}

interface ResearchContextValue {
  /** All loaded papers. */
  papers: ResearchPaper[];
  /** Currently open paper (or null). */
  activePaper: ResearchPaper | null;
  /** Open the PDF modal for a given paper id. */
  openPaper: (paperId: string) => void;
  /** Close the PDF modal. */
  closePaper: () => void;
}

const ResearchContext = createContext<ResearchContextValue>({
  papers: [],
  activePaper: null,
  openPaper: () => {},
  closePaper: () => {},
});

/** Module-level cache so we only fetch once across re-mounts. */
let cachedPapers: ResearchPaper[] | null = null;

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [papers, setPapers] = useState<ResearchPaper[]>(cachedPapers ?? []);
  const [activePaperId, setActivePaperId] = useState<string | null>(null);

  useEffect(() => {
    if (cachedPapers) return;
    fetch("/data/research-context.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.papers) {
          cachedPapers = data.papers;
          setPapers(data.papers);
        }
      })
      .catch(() => {});
  }, []);

  const openPaper = useCallback((paperId: string) => {
    setActivePaperId(paperId);
  }, []);

  const closePaper = useCallback(() => {
    setActivePaperId(null);
  }, []);

  const activePaper =
    activePaperId !== null
      ? papers.find((p) => p.id === activePaperId) ?? null
      : null;

  return (
    <ResearchContext.Provider
      value={{ papers, activePaper, openPaper, closePaper }}
    >
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearch() {
  return useContext(ResearchContext);
}
