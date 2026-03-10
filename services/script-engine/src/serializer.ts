import type { ScriptBlock } from "@promptpilot/types";

export function serializeScript(blocks: ScriptBlock[]): string {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  const parts = sorted.map((block) => {
    switch (block.type) {
      case "SAY":
        return `SAY: ${block.content}`;
      case "ACTION":
        return `ACTION: ${block.content}`;
      case "COMMAND":
        return `COMMAND: ${block.content}`;
      case "TEXT":
      default:
        return block.content;
    }
  });

  return parts.join("\n\n");
}
