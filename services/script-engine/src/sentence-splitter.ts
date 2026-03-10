export function splitSentences(text: string): string[] {
  if (!text.trim()) {
    return [];
  }

  // Split on sentence-ending punctuation followed by whitespace or end of string.
  // This is intentionally simple and does not handle all abbreviation edge cases.
  const parts = text.split(/(?<=[.!?])\s+/);

  return parts.map((s) => s.trim()).filter((s) => s.length > 0);
}
