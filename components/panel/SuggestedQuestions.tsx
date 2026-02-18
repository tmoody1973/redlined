"use client";

/** The four default suggested question pills. */
const SUGGESTED_QUESTIONS = [
  "What happened to Bronzeville?",
  "Why was this area graded D?",
  "What's the income gap between A and D zones?",
  "What was here before the highway?",
] as const;

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

/**
 * Renders four suggested question pills. Clicking a pill submits that
 * question as if the user typed it. Displayed when the chat is empty
 * or after a new zone selection.
 */
export default function SuggestedQuestions({
  onSelectQuestion,
}: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
      {SUGGESTED_QUESTIONS.map((question) => (
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

export { SUGGESTED_QUESTIONS };
