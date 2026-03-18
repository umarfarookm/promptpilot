'use client';

import Link from 'next/link';
import type { SessionAnalyticsSummary } from '@promptpilot/types';

interface SessionHistoryProps {
  scriptId: string;
  sessions: SessionAnalyticsSummary[];
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SessionHistory({ scriptId, sessions }: SessionHistoryProps) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-pp-dark-900 p-6 text-center text-gray-500">
        No sessions recorded yet
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-pp-dark-900 p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Session History
      </h3>
      <div className="divide-y divide-gray-800/50">
        {sessions.map((session) => (
          <div
            key={session.recordingId}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-gray-300">{session.title}</p>
              <p className="text-xs text-gray-500">{formatDate(session.recordedAt)}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">
                {formatDuration(session.actualDurationMs)}
              </span>
              <span className="text-xs text-gray-500">
                {session.commandSuccessRate}% success
              </span>
              {session.errorCount > 0 && (
                <span className="text-xs text-red-400">
                  {session.errorCount} error{session.errorCount > 1 ? 's' : ''}
                </span>
              )}
              <Link
                href={`/scripts/${scriptId}/playback?recording=${session.recordingId}`}
                className="rounded px-2 py-1 text-xs text-pp-primary-400 transition-colors hover:bg-pp-primary-600/10"
              >
                Playback
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
