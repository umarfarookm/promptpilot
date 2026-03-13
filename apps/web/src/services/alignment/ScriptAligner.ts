import type { ScriptBlock, ScriptWordPosition, AlignmentResult, SpeechTranscript } from '@promptpilot/types';
import { flattenBlocksToWords, normalizeWord, wordsMatch } from './textUtils';

interface ScriptWord {
  word: string;
  normalized: string;
  position: ScriptWordPosition;
}

export class ScriptAligner {
  private scriptWords: ScriptWord[];
  private cursor: number = 0; // current position in scriptWords array
  private spokenWordCount: number = 0;
  private readonly windowSize: number;
  private readonly searchAhead: number;
  private readonly matchThreshold: number;

  constructor(
    blocks: ScriptBlock[],
    options?: { windowSize?: number; searchAhead?: number; matchThreshold?: number }
  ) {
    this.scriptWords = flattenBlocksToWords(blocks);
    this.windowSize = options?.windowSize ?? 5;
    this.searchAhead = options?.searchAhead ?? 30;
    this.matchThreshold = options?.matchThreshold ?? 0.6;
  }

  processTranscript(transcript: SpeechTranscript): AlignmentResult | null {
    const spokenWords = transcript.text.trim().split(/\s+/).filter(Boolean).map(normalizeWord);
    if (spokenWords.length === 0) return null;

    this.spokenWordCount += transcript.isFinal ? spokenWords.length : 0;

    // Take last `windowSize` words from spoken text
    const window = spokenWords.slice(-this.windowSize);

    // Search forward from cursor
    const searchEnd = Math.min(this.cursor + this.searchAhead, this.scriptWords.length - window.length);

    let bestPos = -1;
    let bestScore = 0;

    for (let i = this.cursor; i <= searchEnd; i++) {
      let matches = 0;
      for (let j = 0; j < window.length && (i + j) < this.scriptWords.length; j++) {
        if (wordsMatch(window[j], this.scriptWords[i + j].normalized)) {
          matches++;
        }
      }
      const score = matches / window.length;
      if (score > bestScore && score >= this.matchThreshold) {
        bestScore = score;
        bestPos = i;
      }
    }

    if (bestPos === -1) return null;

    // Advance cursor to end of matched window
    const newCursor = Math.min(bestPos + window.length, this.scriptWords.length - 1);
    if (transcript.isFinal && newCursor > this.cursor) {
      this.cursor = newCursor;
    }

    const matchedWord = this.scriptWords[newCursor];
    return {
      matchedUpTo: matchedWord.position,
      confidence: bestScore,
      spokenWordCount: this.spokenWordCount,
    };
  }

  getCurrentPosition(): ScriptWordPosition | null {
    if (this.scriptWords.length === 0) return null;
    return this.scriptWords[this.cursor].position;
  }

  reset(): void {
    this.cursor = 0;
    this.spokenWordCount = 0;
  }

  getTotalWords(): number {
    return this.scriptWords.length;
  }

  getProgress(): number {
    if (this.scriptWords.length === 0) return 0;
    return this.cursor / this.scriptWords.length;
  }
}
