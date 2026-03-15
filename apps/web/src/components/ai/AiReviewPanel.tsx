'use client';

import type {
  AiTransitionsRequest,
  AiGrammarReviewRequest,
} from '@promptpilot/types';

interface AiReviewPanelProps {
  rawContent: string;
  generating: boolean;
  onTransitions: (req: AiTransitionsRequest) => void;
  onGrammar: (req: AiGrammarReviewRequest) => void;
}

export function AiReviewPanel({
  rawContent,
  generating,
  onTransitions,
  onGrammar,
}: AiReviewPanelProps) {
  const disabled = generating || !rawContent.trim();

  return (
    <div className="space-y-3">
      {!rawContent.trim() && (
        <p className="rounded-lg border border-yellow-800/50 bg-yellow-900/20 px-3 py-2 text-xs text-yellow-400">
          Write some script content first, then use these tools to improve it.
        </p>
      )}

      <p className="text-xs text-gray-400">
        Run AI analysis on your current script content.
      </p>

      <button
        type="button"
        onClick={() => onGrammar({ action: 'grammar-review', rawContent })}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-700 bg-pp-dark-950 px-4 py-3 text-left transition-colors hover:border-pp-primary-500 hover:bg-pp-dark-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="text-sm font-medium text-white">Grammar & Clarity</div>
        <div className="mt-0.5 text-xs text-gray-500">
          Fix grammar, spelling, and improve clarity
        </div>
      </button>

      <button
        type="button"
        onClick={() => onTransitions({ action: 'transitions', rawContent })}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-700 bg-pp-dark-950 px-4 py-3 text-left transition-colors hover:border-pp-primary-500 hover:bg-pp-dark-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="text-sm font-medium text-white">Add Transitions</div>
        <div className="mt-0.5 text-xs text-gray-500">
          Insert smooth transitions between sections
        </div>
      </button>
    </div>
  );
}
