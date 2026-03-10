import { describe, it, expect } from "vitest";
import { splitSentences } from "../sentence-splitter";

describe("splitSentences", () => {
  it("splits on periods followed by whitespace", () => {
    const result = splitSentences("Hello world. How are you?");
    expect(result).toEqual(["Hello world.", "How are you?"]);
  });

  it("splits on exclamation marks", () => {
    const result = splitSentences("Wow! That is great!");
    expect(result).toEqual(["Wow!", "That is great!"]);
  });

  it("splits on question marks", () => {
    const result = splitSentences("What is this? I wonder. Really?");
    expect(result).toEqual(["What is this?", "I wonder.", "Really?"]);
  });

  it("returns single sentence without trailing space", () => {
    const result = splitSentences("Just one sentence.");
    expect(result).toEqual(["Just one sentence."]);
  });

  it("returns empty array for empty string", () => {
    expect(splitSentences("")).toEqual([]);
    expect(splitSentences("   ")).toEqual([]);
  });

  it("handles text without sentence-ending punctuation", () => {
    const result = splitSentences("No punctuation here");
    expect(result).toEqual(["No punctuation here"]);
  });

  it("handles multiple spaces between sentences", () => {
    const result = splitSentences("First.   Second.");
    expect(result).toEqual(["First.", "Second."]);
  });
});
