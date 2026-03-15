'use client';

import type { StepModeHook } from '@/hooks/useStepMode';

interface StepControlsProps {
  stepMode: StepModeHook;
  totalBlocks: number;
}

export function StepControls({ stepMode, totalBlocks }: StepControlsProps) {
  const { state, advance, previous, toggleAutoAdvance } = stepMode;
  const completedCount = state.blockStatuses.filter(
    (s) => s === 'success' || s === 'skipped',
  ).length;

  return (
    <div className="flex items-center gap-3">
      {/* Previous */}
      <button
        type="button"
        onClick={previous}
        disabled={state.currentIndex <= 0}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
        title="Previous block (Backspace)"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Block counter */}
      <span className="min-w-[4rem] text-center text-sm tabular-nums text-gray-400">
        {state.currentIndex + 1} / {totalBlocks}
      </span>

      {/* Next */}
      <button
        type="button"
        onClick={advance}
        disabled={state.currentIndex >= totalBlocks - 1}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
        title="Next block (Enter)"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="h-1.5 w-20 rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-pp-primary-500 transition-all"
          style={{ width: `${(completedCount / totalBlocks) * 100}%` }}
        />
      </div>

      {/* Auto-advance toggle */}
      <button
        type="button"
        onClick={toggleAutoAdvance}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          state.autoAdvance
            ? 'bg-pp-primary-600/20 text-pp-primary-400'
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
        title="Auto-advance after command completion"
      >
        Auto
      </button>
    </div>
  );
}
