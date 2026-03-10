export type ScriptBlockType = "SAY" | "ACTION" | "COMMAND" | "TEXT";

export interface ScriptBlock {
  id: string;
  type: ScriptBlockType;
  content: string;
  order: number;
  metadata?: Record<string, unknown>;
}

export interface Script {
  id: string;
  title: string;
  description?: string;
  blocks: ScriptBlock[];
  rawContent: string;
  createdAt: Date;
  updatedAt: Date;
}
