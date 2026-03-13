import type { ScriptBlock, ScriptWordPosition } from '@promptpilot/types';
import { splitSentences } from '@promptpilot/script-engine';

export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^\w\s]/g, '');
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

export function wordsMatch(spoken: string, script: string): boolean {
  const normalizedSpoken = normalizeWord(spoken);
  const normalizedScript = normalizeWord(script);

  if (normalizedSpoken.length < 4 || normalizedScript.length < 4) {
    return normalizedSpoken === normalizedScript;
  }

  return levenshteinDistance(normalizedSpoken, normalizedScript) <= 2;
}

export function flattenBlocksToWords(
  blocks: ScriptBlock[]
): Array<{ word: string; normalized: string; position: ScriptWordPosition }> {
  const result: Array<{ word: string; normalized: string; position: ScriptWordPosition }> = [];
  let globalWordIndex = 0;

  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
    const block = blocks[blockIndex];

    if (block.type !== 'SAY' && block.type !== 'TEXT') {
      continue;
    }

    const sentences = splitSentences(block.content);

    for (let sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex++) {
      const words = sentences[sentenceIndex].split(/\s+/).filter(Boolean);

      for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        result.push({
          word: words[wordIndex],
          normalized: normalizeWord(words[wordIndex]),
          position: {
            blockIndex,
            sentenceIndex,
            wordIndex,
            globalWordIndex,
          },
        });
        globalWordIndex++;
      }
    }
  }

  return result;
}
