import type { ScriptBlock, ScriptBlockType } from "@promptpilot/types";

const PREFIXES: Record<string, ScriptBlockType> = {
  "SAY:": "SAY",
  "ACTION:": "ACTION",
  "COMMAND:": "COMMAND",
};

export function parseScript(raw: string): ScriptBlock[] {
  const lines = raw.split("\n");
  const blocks: ScriptBlock[] = [];
  let order = 0;
  let pendingTextLines: string[] = [];

  function flushTextLines(): void {
    if (pendingTextLines.length > 0) {
      blocks.push({
        id: crypto.randomUUID(),
        type: "TEXT",
        content: pendingTextLines.join("\n"),
        order: order++,
      });
      pendingTextLines = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty lines separate blocks
    if (trimmed === "") {
      flushTextLines();
      continue;
    }

    // Check for known prefixes
    let matched = false;
    for (const [prefix, type] of Object.entries(PREFIXES)) {
      if (trimmed.startsWith(prefix)) {
        flushTextLines();
        blocks.push({
          id: crypto.randomUUID(),
          type,
          content: trimmed.slice(prefix.length).trim(),
          order: order++,
        });
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Consecutive TEXT lines merge into a single block
      pendingTextLines.push(trimmed);
    }
  }

  // Flush any remaining text lines
  flushTextLines();

  return blocks;
}
