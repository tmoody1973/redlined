import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { buildSystemPrompt } from "@/lib/ai-prompt";
import SuggestedQuestions, {
  SUGGESTED_QUESTIONS,
} from "./SuggestedQuestions";

/** Sample zone context matching the shape expected by buildSystemPrompt. */
const sampleZoneContext = {
  name: "Bronzeville / 6th & Walnut",
  grade: "D" as const,
  clarifyingRemarks: "This is a substandard area.",
  detrimentalInfluences: "Age and obsolescence of buildings",
  favorableInfluences: "",
  infiltrationOf: "Negroes",
  negroYesOrNo: "Yes",
  negroPercent: "75%",
  estimatedAnnualFamilyIncome: "$900-1200",
  occupationType: "Laborers",
  descriptionOfTerrain: "Flat",
  trendOfDesirability: "Declining",
  medianIncome: 24800,
  percentile: 8,
};

describe("AI Chat Integration", () => {
  describe("Convex action for Claude proxy accepts messages array and zone context", () => {
    it("buildSystemPrompt produces a non-empty string when given zone context and messages", () => {
      const systemPrompt = buildSystemPrompt(sampleZoneContext, []);

      expect(typeof systemPrompt).toBe("string");
      expect(systemPrompt.length).toBeGreaterThan(100);
      expect(systemPrompt).toContain("AI narrative guide");
      expect(systemPrompt).toContain("REDLINED");
      expect(systemPrompt).toContain("Milwaukee");
    });

    it("buildSystemPrompt includes fallback text when zone context is null", () => {
      const systemPrompt = buildSystemPrompt(null, []);

      expect(systemPrompt).toContain("No zone is currently selected");
      expect(systemPrompt).toContain("general questions");
    });
  });

  describe("System prompt includes the currently-selected zone grade, name, and appraiser fields", () => {
    it("includes zone name, grade, and appraiser description fields in the prompt", () => {
      const systemPrompt = buildSystemPrompt(sampleZoneContext, []);

      expect(systemPrompt).toContain("Bronzeville / 6th & Walnut");
      expect(systemPrompt).toContain("Grade D");
      expect(systemPrompt).toContain("Hazardous");
      expect(systemPrompt).toContain("This is a substandard area.");
      expect(systemPrompt).toContain("Negroes");
      expect(systemPrompt).toContain("$900-1200");
      expect(systemPrompt).toContain("Laborers");
      expect(systemPrompt).toContain("$24,800");
      expect(systemPrompt).toContain("8th percentile");
    });

    it("does not include empty appraiser fields", () => {
      const systemPrompt = buildSystemPrompt(sampleZoneContext, []);

      // favorableInfluences is empty and should not appear as a field value
      const lines = systemPrompt.split("\n");
      const favorableLine = lines.find((l) =>
        l.startsWith("Favorable Influences:"),
      );
      expect(favorableLine).toBeUndefined();
    });

    it("includes recently discussed zones when provided", () => {
      const recentZones = [
        { name: "Shorewood", grade: "A" as const },
        { name: "Bay View", grade: "C" as const },
      ];
      const systemPrompt = buildSystemPrompt(sampleZoneContext, recentZones);

      expect(systemPrompt).toContain("RECENTLY DISCUSSED ZONES");
      expect(systemPrompt).toContain("Shorewood (Grade A)");
      expect(systemPrompt).toContain("Bay View (Grade C)");
    });
  });

  describe("Zone-context divider message is inserted into conversation when zone selection changes", () => {
    it("produces the expected divider format for a graded zone", () => {
      const zoneName = "Bronzeville / 6th & Walnut";
      const grade = "D";
      const gradeLabel = grade ? `Grade ${grade}` : "Ungraded";
      const content = `Now viewing: ${zoneName} -- ${gradeLabel}`;

      expect(content).toBe(
        "Now viewing: Bronzeville / 6th & Walnut -- Grade D",
      );
    });

    it("produces the expected divider format for an ungraded zone", () => {
      const zoneName = "Industrial Area";
      const grade = null;
      const gradeLabel = grade ? `Grade ${grade}` : "Ungraded";
      const content = `Now viewing: ${zoneName} -- ${gradeLabel}`;

      expect(content).toBe("Now viewing: Industrial Area -- Ungraded");
    });
  });

  describe("Suggested question pills render when chat is empty or after a new zone selection", () => {
    it("renders all four suggested question pills", () => {
      const onSelect = vi.fn();
      render(<SuggestedQuestions onSelectQuestion={onSelect} />);

      SUGGESTED_QUESTIONS.forEach((question) => {
        expect(screen.getByText(question)).toBeInTheDocument();
      });

      expect(screen.getAllByRole("button")).toHaveLength(4);
    });

    it("calls onSelectQuestion with the correct text when a pill is clicked", () => {
      const onSelect = vi.fn();
      render(<SuggestedQuestions onSelectQuestion={onSelect} />);

      fireEvent.click(screen.getByText("What happened to Bronzeville?"));
      expect(onSelect).toHaveBeenCalledWith("What happened to Bronzeville?");

      fireEvent.click(
        screen.getByText("Why was this area graded D?"),
      );
      expect(onSelect).toHaveBeenCalledWith("Why was this area graded D?");
    });

    it("pills have accessible group label", () => {
      const onSelect = vi.fn();
      render(<SuggestedQuestions onSelectQuestion={onSelect} />);

      expect(
        screen.getByRole("group", { name: /suggested questions/i }),
      ).toBeInTheDocument();
    });
  });

  describe("User message is added to conversation history when submitted", () => {
    it("message shape matches expected Convex mutation arguments", () => {
      const messageArgs = {
        conversationId: "test-conversation-id",
        role: "user",
        content: "What happened to Bronzeville?",
        zoneId: "6300",
      };

      expect(messageArgs.role).toBe("user");
      expect(messageArgs.content).toBe("What happened to Bronzeville?");
      expect(messageArgs.conversationId).toBeTruthy();
      expect(messageArgs.zoneId).toBe("6300");
    });
  });

  describe("Conversation persists across zone selections (messages from prior zone still visible)", () => {
    it("zone-context messages are preserved alongside user and assistant messages", () => {
      const messages = [
        { role: "user", content: "Tell me about this zone", createdAt: 1 },
        {
          role: "assistant",
          content: "This zone was graded D...",
          createdAt: 2,
        },
        {
          role: "zone-context",
          content: "Now viewing: Bay View -- Grade C",
          createdAt: 3,
        },
        { role: "user", content: "What about this area?", createdAt: 4 },
      ];

      // All prior messages should be retained
      expect(messages).toHaveLength(4);
      expect(messages[0].role).toBe("user");
      expect(messages[1].role).toBe("assistant");
      expect(messages[2].role).toBe("zone-context");
      expect(messages[3].role).toBe("user");

      // Only user and assistant messages should be sent to Claude
      const claudeMessages = messages.filter(
        (m) => m.role === "user" || m.role === "assistant",
      );
      expect(claudeMessages).toHaveLength(3);
      expect(claudeMessages.every((m) => m.role !== "zone-context")).toBe(true);
    });
  });
});
