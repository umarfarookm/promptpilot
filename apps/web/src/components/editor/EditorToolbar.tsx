'use client';

import { useRef, useState, useCallback } from 'react';

interface EditorToolbarProps {
  onImport: (content: string) => void;
  onExport: () => void;
}

export function EditorToolbar({ onImport, onExport }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          onImport(content);
        }
      };
      reader.readAsText(file);

      // Reset input so the same file can be re-imported
      e.target.value = '';
    },
    [onImport],
  );

  return (
    <div className="relative flex items-center gap-2">
      {/* Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.promptpilot"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-pp-dark-900 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        Import
      </button>

      {/* Export */}
      <button
        type="button"
        onClick={onExport}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-pp-dark-900 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export
      </button>

      {/* Format help */}
      <button
        type="button"
        onClick={() => setShowHelp((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-pp-dark-900 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Format Help
      </button>

      {/* Help popup */}
      {showHelp && (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-lg border border-gray-700 bg-pp-dark-900 p-4 shadow-xl">
          <h4 className="mb-2 text-sm font-semibold text-white">Script Format</h4>
          <div className="space-y-2 text-xs text-gray-400">
            <p>
              <code className="rounded bg-gray-800 px-1 text-pp-primary-400">[SAY]</code>{' '}
              Dialogue to speak aloud
            </p>
            <p>
              <code className="rounded bg-gray-800 px-1 text-pp-accent-400">[ACTION]</code>{' '}
              Stage directions or actions
            </p>
            <p>
              <code className="rounded bg-gray-800 px-1 text-green-400">[COMMAND]</code>{' '}
              Technical cues or commands
            </p>
            <p>
              <code className="rounded bg-gray-800 px-1 text-gray-300">[TEXT]</code>{' '}
              Plain text (default if no tag)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp(false)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-300"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
