import { describe, it, expect } from "vitest";
import { parseScript } from "../parser";
import { serializeScript } from "../serializer";

describe("serializeScript", () => {
  it("serializes SAY blocks with prefix", () => {
    const blocks = parseScript("SAY: Hello world");
    const result = serializeScript(blocks);
    expect(result).toBe("SAY: Hello world");
  });

  it("serializes ACTION blocks with prefix", () => {
    const blocks = parseScript("ACTION: Click button");
    const result = serializeScript(blocks);
    expect(result).toBe("ACTION: Click button");
  });

  it("serializes COMMAND blocks with prefix", () => {
    const blocks = parseScript("COMMAND: deploy");
    const result = serializeScript(blocks);
    expect(result).toBe("COMMAND: deploy");
  });

  it("serializes TEXT blocks without prefix", () => {
    const blocks = parseScript("Just some text");
    const result = serializeScript(blocks);
    expect(result).toBe("Just some text");
  });

  it("separates blocks with blank lines", () => {
    const input = `SAY: First

ACTION: Second`;
    const blocks = parseScript(input);
    const result = serializeScript(blocks);
    expect(result).toBe("SAY: First\n\nACTION: Second");
  });

  it("round-trips mixed content", () => {
    const input = `SAY: Welcome

ACTION: Open settings

Some descriptive text

COMMAND: run build`;
    const blocks = parseScript(input);
    const result = serializeScript(blocks);
    expect(result).toBe(input);
  });

  it("round-trips multiline TEXT blocks", () => {
    // NOTE: consecutive text lines merge into one block with \n,
    // and serialization outputs the content as-is (no prefix).
    // The round-trip won't be identical because original had no blank lines
    // between text lines but parsing merged them. Serialization outputs
    // the merged content as a single block.
    const input = `SAY: Intro

Line one
Line two

COMMAND: finish`;
    const blocks = parseScript(input);
    const result = serializeScript(blocks);
    expect(result).toBe("SAY: Intro\n\nLine one\nLine two\n\nCOMMAND: finish");
  });

  it("respects order when blocks are unsorted", () => {
    const blocks = [
      { id: "b", type: "ACTION" as const, content: "Second", order: 1 },
      { id: "a", type: "SAY" as const, content: "First", order: 0 },
    ];
    const result = serializeScript(blocks);
    expect(result).toBe("SAY: First\n\nACTION: Second");
  });
});
