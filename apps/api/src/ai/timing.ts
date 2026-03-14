import { parseScript } from "@promptpilot/script-engine";
import type { TimingEstimate, BlockTiming } from "@promptpilot/types";

const DEFAULT_WPM = 130;
const ACTION_SECONDS = 3;
const COMMAND_SECONDS = 5;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateTiming(
  rawContent: string,
  wpm: number = DEFAULT_WPM,
): TimingEstimate {
  const blocks = parseScript(rawContent);
  const blockTimings: BlockTiming[] = [];
  let totalWords = 0;
  let totalSeconds = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const wordCount = countWords(block.content);
    let estimatedSeconds: number;

    switch (block.type) {
      case "SAY":
      case "TEXT":
        estimatedSeconds = (wordCount / wpm) * 60;
        totalWords += wordCount;
        break;
      case "ACTION":
        estimatedSeconds = ACTION_SECONDS;
        break;
      case "COMMAND":
        estimatedSeconds = COMMAND_SECONDS;
        break;
      default:
        estimatedSeconds = (wordCount / wpm) * 60;
        totalWords += wordCount;
    }

    totalSeconds += estimatedSeconds;
    blockTimings.push({
      blockIndex: i,
      blockType: block.type,
      wordCount,
      estimatedSeconds: Math.round(estimatedSeconds * 10) / 10,
    });
  }

  return {
    totalWords,
    estimatedMinutes: Math.round((totalSeconds / 60) * 10) / 10,
    wordsPerMinute: wpm,
    blockTimings,
  };
}
