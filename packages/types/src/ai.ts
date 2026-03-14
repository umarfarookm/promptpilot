// ---------------------------------------------------------------------------
// AI Script Assistant types (Phase 3)
// ---------------------------------------------------------------------------

export type AiAction = "generate" | "rewrite" | "transitions" | "grammar-review";

export type ScriptTone =
  | "professional"
  | "casual"
  | "enthusiastic"
  | "educational";

export type AudienceLevel = "beginner" | "intermediate" | "expert";

/** short ≈ 2 min, medium ≈ 5 min, long ≈ 15 min */
export type ScriptLength = "short" | "medium" | "long";

// ---- Request types --------------------------------------------------------

export interface AiGenerateRequest {
  action: "generate";
  topic: string;
  outline?: string;
  template?: TemplateId;
  tone?: ScriptTone;
  audienceLevel?: AudienceLevel;
  targetLength?: ScriptLength;
}

export interface AiRewriteRequest {
  action: "rewrite";
  rawContent: string;
  tone?: ScriptTone;
  audienceLevel?: AudienceLevel;
  targetLength?: ScriptLength;
  instructions?: string;
}

export interface AiTransitionsRequest {
  action: "transitions";
  rawContent: string;
}

export interface AiGrammarReviewRequest {
  action: "grammar-review";
  rawContent: string;
}

export type AiRequest =
  | AiGenerateRequest
  | AiRewriteRequest
  | AiTransitionsRequest
  | AiGrammarReviewRequest;

// ---- SSE stream events ----------------------------------------------------

export interface AiStreamEvent {
  type: "chunk" | "done" | "error";
  content?: string;
  error?: string;
}

// ---- Templates ------------------------------------------------------------

export type TemplateId =
  | "keynote"
  | "tutorial"
  | "product-demo"
  | "meeting"
  | "workshop";

export interface ScriptTemplate {
  id: TemplateId;
  name: string;
  description: string;
  skeleton: string;
}

// ---- Timing estimator -----------------------------------------------------

export interface TimingEstimate {
  totalWords: number;
  estimatedMinutes: number;
  wordsPerMinute: number;
  blockTimings: BlockTiming[];
}

export interface BlockTiming {
  blockIndex: number;
  blockType: string;
  wordCount: number;
  estimatedSeconds: number;
}

export interface TimingRequest {
  rawContent: string;
  wordsPerMinute?: number;
}

// ---- Provider configuration -----------------------------------------------

export type AiProviderId = "ollama" | "openai" | "anthropic";

// ---- AI status ------------------------------------------------------------

export interface AiStatusResponse {
  available: boolean;
  provider: AiProviderId;
  model: string;
  error?: string;
}
