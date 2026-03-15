'use client';

import { useState } from 'react';
import { ErrorRecoveryPanel } from './ErrorRecoveryPanel';

interface ErrorAnalysis {
  category: string;
  message: string;
  suggestions: string[];
}

interface CommandConfirmBarProps {
  command: string;
  blockIndex: number;
  onRun: (command: string) => void;
  onSkip: () => void;
  disabled?: boolean;
  errorAnalysis?: ErrorAnalysis | null;
}

export function CommandConfirmBar({
  command,
  blockIndex,
  onRun,
  onSkip,
  disabled,
  errorAnalysis,
}: CommandConfirmBarProps) {
  const [editedCommand, setEditedCommand] = useState(command);
  const [isEditing, setIsEditing] = useState(false);
  const [showError, setShowError] = useState(true);

  return (
    <div>
      {errorAnalysis && showError && (
        <ErrorRecoveryPanel
          analysis={errorAnalysis}
          onTrySuggestion={(cmd) => onRun(cmd)}
          onDismiss={() => setShowError(false)}
        />
      )}

      <div className="border-t border-gray-800 bg-gray-900/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Block {blockIndex + 1}
          </span>

          {isEditing ? (
            <input
              type="text"
              value={editedCommand}
              onChange={(e) => setEditedCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(false);
                  onRun(editedCommand);
                }
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditedCommand(command);
                }
              }}
              className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 font-mono text-sm text-green-400 focus:border-pp-primary-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <code className="flex-1 truncate font-mono text-sm text-green-400">
              $ {command}
            </code>
          )}

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                disabled={disabled}
                title="Edit command before running"
              >
                Edit
              </button>
            )}

            <button
              type="button"
              onClick={onSkip}
              className="rounded px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              disabled={disabled}
            >
              Skip
            </button>

            <button
              type="button"
              onClick={() => onRun(isEditing ? editedCommand : command)}
              className="rounded bg-green-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              disabled={disabled}
            >
              {errorAnalysis ? 'Retry' : 'Run'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
