import type { ScriptBlock, ScriptBlockType } from "@promptpilot/types";

const VALID_TYPES: ScriptBlockType[] = ["SAY", "ACTION", "COMMAND", "TEXT"];

export function validateScript(
  blocks: ScriptBlock[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (!VALID_TYPES.includes(block.type)) {
      errors.push(
        `Block ${i} (order ${block.order}): invalid type "${block.type}"`,
      );
    }

    if (!block.content || block.content.trim().length === 0) {
      errors.push(
        `Block ${i} (order ${block.order}): content must not be empty`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
