'use client';

import type { BlockActualTiming } from '@promptpilot/types';

interface BlockTimingChartProps {
  blockTimings: BlockActualTiming[];
}

function paceColor(pace: string): string {
  switch (pace) {
    case 'rushed': return 'bg-amber-500';
    case 'slow': return 'bg-red-400';
    default: return 'bg-pp-primary-500';
  }
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function BlockTimingChart({ blockTimings }: BlockTimingChartProps) {
  if (blockTimings.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-pp-dark-900 p-6 text-center text-gray-500">
        No block timing data available
      </div>
    );
  }

  const maxMs = Math.max(...blockTimings.map((b) => Math.max(b.actualMs, b.estimatedMs)), 1);

  return (
    <div className="rounded-lg border border-gray-800 bg-pp-dark-900 p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Block Timing
      </h3>
      <div className="space-y-3">
        {blockTimings.map((block) => (
          <div key={block.blockIndex} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">
                #{block.blockIndex + 1} {block.blockType}
              </span>
              <span className="text-gray-500">
                {formatMs(block.actualMs)} / {formatMs(block.estimatedMs)} est
              </span>
            </div>
            {/* Estimated bar (background) */}
            <div className="relative h-4 overflow-hidden rounded bg-gray-800">
              <div
                className="absolute inset-y-0 left-0 rounded bg-gray-700"
                style={{ width: `${(block.estimatedMs / maxMs) * 100}%` }}
              />
              {/* Actual bar (foreground) */}
              <div
                className={`absolute inset-y-0 left-0 rounded ${paceColor(block.pace)}`}
                style={{ width: `${(block.actualMs / maxMs) * 100}%`, opacity: 0.85 }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded bg-pp-primary-500" /> On pace
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded bg-amber-500" /> Rushed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded bg-red-400" /> Slow
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded bg-gray-700" /> Estimated
        </span>
      </div>
    </div>
  );
}
