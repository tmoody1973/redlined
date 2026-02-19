"use client";

const GENERIC_QUESTIONS = [
  "What is redlining?",
  "Why is Milwaukee so segregated?",
  "What happened to Bronzeville?",
  "How do the HOLC grades work?",
] as const;

function getZoneQuestions(zoneName: string, grade: string | null): string[] {
  const name = zoneName || "this area";
  const questions = [
    `Why was ${name} rated this way?`,
    `What's different about ${name} today?`,
    "How does this compare to other neighborhoods?",
  ];
  if (grade === "D") {
    questions.push("What happened to Bronzeville?");
  } else {
    questions.push("What is redlining?");
  }
  return questions;
}

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  zoneName?: string | null;
  grade?: string | null;
}

/**
 * Renders suggested question pills. When a zone is selected, shows
 * zone-specific questions. Otherwise shows generic Milwaukee questions.
 */
export default function SuggestedQuestions({
  onSelectQuestion,
  zoneName,
  grade,
}: SuggestedQuestionsProps) {
  const questions = zoneName
    ? getZoneQuestions(zoneName, grade ?? null)
    : [...GENERIC_QUESTIONS];

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelectQuestion(question)}
          className="focus-ring rounded-full border border-slate-600 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-200"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {question}
        </button>
      ))}
    </div>
  );
}

export { GENERIC_QUESTIONS };
