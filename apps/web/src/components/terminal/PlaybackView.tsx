'use client';

import { useRef, useEffect } from 'react';
import type { RecordingData } from '@promptpilot/types';
import { usePlayback } from '@/hooks/usePlayback';

interface PlaybackViewProps {
  recording: RecordingData;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PlaybackView({ recording }: PlaybackViewProps) {
  const playback = usePlayback(recording);
  const outputRef = useRef<HTMLPreElement>(null);

  // Build visible output from events
  const output = playback.visibleEvents
    .filter((e) => e.type === 'output' || e.type === 'command')
    .map((e) => (e.type === 'command' ? `$ ${e.data}\n` : e.data))
    .join('');

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const SPEEDS = [1, 2, 4];

  return (
    <div className="flex h-screen flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold text-white">{recording.scriptTitle}</h1>
          <p className="text-xs text-gray-500">
            Recorded {new Date(recording.startedAt).toLocaleString()} - {formatTime(recording.duration)}
          </p>
        </div>
      </div>

      {/* Output area */}
      <pre
        ref={outputRef}
        className="flex-1 overflow-auto p-6 font-mono text-sm text-green-400"
        style={{ backgroundColor: '#0d1117' }}
      >
        {output || <span className="text-gray-600">Playback will appear here...</span>}
      </pre>

      {/* Playback controls */}
      <div className="border-t border-gray-800 bg-gray-900/80 px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={playback.state === 'playing' ? playback.pause : playback.play}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-pp-primary-600 text-white transition-colors hover:bg-pp-primary-700"
          >
            {playback.state === 'playing' ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
              </svg>
            )}
          </button>

          {/* Time */}
          <span className="min-w-[5rem] text-sm tabular-nums text-gray-400">
            {formatTime(playback.currentTime)} / {formatTime(playback.duration)}
          </span>

          {/* Timeline scrubber */}
          <input
            type="range"
            min={0}
            max={playback.duration}
            value={playback.currentTime}
            onChange={(e) => playback.seek(Number(e.target.value))}
            className="flex-1 accent-pp-primary-500"
          />

          {/* Speed */}
          <div className="flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => playback.setSpeed(s)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  playback.speed === s
                    ? 'bg-pp-primary-600/20 text-pp-primary-400'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={playback.reset}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            title="Reset"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
