import type { TimingEstimate, BlockTiming } from "@promptpilot/types";

const DEFAULT_WPM = 130;
const ACTION_SECONDS = 3;
const COMMAND_SECONDS = 5;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Client-side timing estimator. Mirrors the backend logic so the
 * editor can show live estimates without an API call.
 */
export function estimateTiming(
  rawContent: string,
  wpm: number = DEFAULT_WPM,
): TimingEstimate {
  // Simple inline parser — matches [SAY], [ACTION], [COMMAND], [TEXT] tags
  const lines = rawContent.split("\n");
  const blocks: { type: string; content: string }[] = [];
  let currentType = "TEXT";
  let currentContent: string[] = [];

  const flush = () => {
    const content = currentContent.join("\n").trim();
    if (content) {
      blocks.push({ type: currentType, content });
    }
    currentContent = [];
  };

  for (const line of lines) {
    const tagMatch = line.match(/^\[(SAY|ACTION|COMMAND|TEXT)\]\s*(.*)/i);
    if (tagMatch) {
      flush();
      currentType = tagMatch[1].toUpperCase();
      if (tagMatch[2].trim()) {
        currentContent.push(tagMatch[2].trim());
      }
    } else {
      currentContent.push(line);
    }
  }
  flush();

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

/** Format minutes to a human-readable string like "4m 30s" */
export function formatDuration(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}
