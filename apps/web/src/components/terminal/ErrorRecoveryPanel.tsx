'use client';

import { useState } from 'react';

interface ErrorAnalysis {
  category: string;
  message: string;
  suggestions: string[];
}

interface ErrorRecoveryPanelProps {
  analysis: ErrorAnalysis;
  onTrySuggestion?: (command: string) => void;
  onDismiss: () => void;
}

export function ErrorRecoveryPanel({
  analysis,
  onTrySuggestion,
  onDismiss,
}: ErrorRecoveryPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-t border-red-800/50 bg-red-950/30">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-sm font-medium text-red-400">{analysis.message}</span>
          <span className="rounded bg-red-900/50 px-1.5 py-0.5 text-[10px] text-red-300">
            {analysis.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Dismiss
          </button>
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="space-y-2 px-4 pb-3">
          <p className="text-xs text-gray-400">Suggestions:</p>
          <ul className="space-y-1.5">
            {analysis.suggestions.map((suggestion, i) => {
              // Check if suggestion contains a command (backtick-wrapped)
              const cmdMatch = suggestion.match(/`([^`]+)`/);
              return (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <span className="mt-0.5 text-gray-600">-</span>
                  <span className="flex-1">{suggestion}</span>
                  {cmdMatch && onTrySuggestion && (
                    <button
                      type="button"
                      onClick={() => onTrySuggestion(cmdMatch[1])}
                      className="shrink-0 rounded bg-gray-800 px-2 py-0.5 text-[10px] text-pp-primary-400 transition-colors hover:bg-gray-700"
                    >
                      Try this
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
