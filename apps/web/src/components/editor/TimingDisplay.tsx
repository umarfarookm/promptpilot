'use client';

import { useState, useMemo } from 'react';
import { estimateTiming, formatDuration } from '@/lib/timing';

interface TimingDisplayProps {
  rawContent: string;
}

export function TimingDisplay({ rawContent }: TimingDisplayProps) {
  const [wpm, setWpm] = useState(130);
  const [expanded, setExpanded] = useState(false);

  const timing = useMemo(
    () => estimateTiming(rawContent, wpm),
    [rawContent, wpm],
  );

  if (!rawContent.trim()) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-pp-dark-900 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        ~{formatDuration(timing.estimatedMinutes)} &middot; {timing.totalWords} words
      </button>

      {expanded && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-lg border border-gray-700 bg-pp-dark-900 p-4 shadow-xl">
          <h4 className="mb-3 text-sm font-semibold text-white">Timing Estimate</h4>

          <div className="mb-3 flex items-center gap-3">
            <label className="text-xs text-gray-400 whitespace-nowrap">
              {wpm} WPM
            </label>
            <input
              type="range"
              min={80}
              max={200}
              step={5}
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="flex-1 accent-pp-primary-500"
            />
          </div>

          <div className="mb-2 text-sm text-white">
            Total: <strong>{formatDuration(timing.estimatedMinutes)}</strong>
            {' '}<span className="text-gray-500">({timing.totalWords} words)</span>
          </div>

          {timing.blockTimings.length > 0 && (
            <div className="max-h-40 overflow-y-auto">
              <table className="w-full text-xs text-gray-400">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="pb-1 text-left font-medium">#</th>
                    <th className="pb-1 text-left font-medium">Type</th>
                    <th className="pb-1 text-right font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {timing.blockTimings.map((bt) => (
                    <tr key={bt.blockIndex} className="border-b border-gray-800/50">
                      <td className="py-0.5">{bt.blockIndex + 1}</td>
                      <td className="py-0.5">{bt.blockType}</td>
                      <td className="py-0.5 text-right">{formatDuration(bt.estimatedSeconds / 60)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-300"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
