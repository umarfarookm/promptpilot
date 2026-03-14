import type {
  AiGenerateRequest,
  AiRewriteRequest,
  AiTransitionsRequest,
  AiGrammarReviewRequest,
} from "@promptpilot/types";

const COPILOT_FORMAT_INSTRUCTIONS = `Output the script in .copilot format using these tags:
- [SAY] for spoken dialogue
- [ACTION] for physical actions or stage directions
- [COMMAND] for terminal/technical commands
- Plain text (no tag) for narrative or notes

Separate blocks with blank lines. Do NOT include any explanation outside the script itself.`;

const LENGTH_GUIDE: Record<string, string> = {
  short: "about 250 words (~2 minutes spoken)",
  medium: "about 650 words (~5 minutes spoken)",
  long: "about 1950 words (~15 minutes spoken)",
};

export function buildGeneratePrompt(req: AiGenerateRequest): string {
  const parts: string[] = [];

  parts.push(
    `Write a teleprompter script about: ${req.topic}`,
  );

  if (req.outline) {
    parts.push(`\nUse this outline as a guide:\n${req.outline}`);
  }

  if (req.tone) {
    parts.push(`\nTone: ${req.tone}`);
  }

  if (req.audienceLevel) {
    parts.push(`Audience: ${req.audienceLevel} level`);
  }

  if (req.targetLength) {
    parts.push(`Target length: ${LENGTH_GUIDE[req.targetLength] ?? req.targetLength}`);
  }

  parts.push(`\n${COPILOT_FORMAT_INSTRUCTIONS}`);

  return parts.join("\n");
}

export function buildRewritePrompt(req: AiRewriteRequest): string {
  const parts: string[] = [];

  parts.push("Rewrite the following teleprompter script.");

  if (req.instructions) {
    parts.push(`\nSpecific instructions: ${req.instructions}`);
  }

  if (req.tone) {
    parts.push(`\nTarget tone: ${req.tone}`);
  }

  if (req.audienceLevel) {
    parts.push(`Target audience: ${req.audienceLevel} level`);
  }

  if (req.targetLength) {
    parts.push(`Target length: ${LENGTH_GUIDE[req.targetLength] ?? req.targetLength}`);
  }

  parts.push(`\n${COPILOT_FORMAT_INSTRUCTIONS}`);
  parts.push(`\n--- ORIGINAL SCRIPT ---\n${req.rawContent}\n--- END ---`);

  return parts.join("\n");
}

export function buildTransitionsPrompt(req: AiTransitionsRequest): string {
  return `Add smooth transitions between the sections of the following teleprompter script. Keep the existing content intact and insert transition lines where appropriate.

${COPILOT_FORMAT_INSTRUCTIONS}

--- ORIGINAL SCRIPT ---
${req.rawContent}
--- END ---`;
}

export function buildGrammarPrompt(req: AiGrammarReviewRequest): string {
  return `Review and fix the grammar, spelling, and clarity of the following teleprompter script. Preserve the structure and tags. Make minimal changes — only fix actual issues.

${COPILOT_FORMAT_INSTRUCTIONS}

--- ORIGINAL SCRIPT ---
${req.rawContent}
--- END ---`;
}
