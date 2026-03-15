'use client';

import type { TerminalSessionHook } from '@/hooks/useTerminalSession';

interface RecordingControlsProps {
  session: TerminalSessionHook;
  scriptId: string;
  scriptTitle: string;
  blocks: unknown[];
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function RecordingControls({
  session,
  scriptId,
  scriptTitle,
  blocks,
}: RecordingControlsProps) {
  const { recordingState, startRecording, stopRecording } = session;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  return (
    <div className="flex items-center gap-3">
      {recordingState.isRecording ? (
        <>
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-600/30"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Recording
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => startRecording(scriptId, scriptTitle, blocks)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          disabled={!session.connected}
        >
          <span className="h-2 w-2 rounded-full border border-red-500" />
          Record
        </button>
      )}

      {recordingState.lastSavedId && (
        <a
          href={`${API_URL}/api/recordings/${recordingState.lastSavedId}/download`}
          className="rounded-lg px-2 py-1 text-xs text-pp-primary-400 transition-colors hover:bg-pp-primary-600/20"
          download
        >
          Download
        </a>
      )}
    </div>
  );
}
