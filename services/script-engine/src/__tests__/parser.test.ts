import { describe, it, expect } from "vitest";
import { parseScript } from "../parser";

describe("parseScript", () => {
  it("parses SAY blocks", () => {
    const blocks = parseScript("SAY: Hello world");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("SAY");
    expect(blocks[0].content).toBe("Hello world");
    expect(blocks[0].order).toBe(0);
    expect(blocks[0].id).toBeDefined();
  });

  it("parses ACTION blocks", () => {
    const blocks = parseScript("ACTION: Click the button");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("ACTION");
    expect(blocks[0].content).toBe("Click the button");
  });

  it("parses COMMAND blocks", () => {
    const blocks = parseScript("COMMAND: open dashboard");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("COMMAND");
    expect(blocks[0].content).toBe("open dashboard");
  });

  it("merges consecutive TEXT lines into a single block", () => {
    const input = `Line one
Line two
Line three`;
    const blocks = parseScript(input);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("TEXT");
    expect(blocks[0].content).toBe("Line one\nLine two\nLine three");
  });

  it("separates blocks on empty lines", () => {
    const input = `First paragraph line one
First paragraph line two

Second paragraph`;
    const blocks = parseScript(input);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("TEXT");
    expect(blocks[0].content).toBe(
      "First paragraph line one\nFirst paragraph line two",
    );
    expect(blocks[1].type).toBe("TEXT");
    expect(blocks[1].content).toBe("Second paragraph");
  });

  it("handles mixed content", () => {
    const input = `SAY: Welcome to the demo

ACTION: Open the settings page

Here is some explanation
that spans multiple lines

COMMAND: run tests

SAY: All done`;
    const blocks = parseScript(input);
    expect(blocks).toHaveLength(5);
    expect(blocks[0].type).toBe("SAY");
    expect(blocks[0].content).toBe("Welcome to the demo");
    expect(blocks[1].type).toBe("ACTION");
    expect(blocks[1].content).toBe("Open the settings page");
    expect(blocks[2].type).toBe("TEXT");
    expect(blocks[2].content).toBe(
      "Here is some explanation\nthat spans multiple lines",
    );
    expect(blocks[3].type).toBe("COMMAND");
    expect(blocks[3].content).toBe("run tests");
    expect(blocks[4].type).toBe("SAY");
    expect(blocks[4].content).toBe("All done");
  });

  it("assigns incrementing order values", () => {
    const input = `SAY: First

ACTION: Second

COMMAND: Third`;
    const blocks = parseScript(input);
    expect(blocks.map((b) => b.order)).toEqual([0, 1, 2]);
  });

  it("handles empty input", () => {
    const blocks = parseScript("");
    expect(blocks).toHaveLength(0);
  });

  it("handles input with only empty lines", () => {
    const blocks = parseScript("\n\n\n");
    expect(blocks).toHaveLength(0);
  });

  it("trims content after prefix", () => {
    const blocks = parseScript("SAY:    lots of spaces   ");
    expect(blocks[0].content).toBe("lots of spaces");
  });
});
