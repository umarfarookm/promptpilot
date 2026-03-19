'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchRecordings } from '@/lib/api';

interface RecordingItem {
  id: string;
  scriptId: string;
  title: string;
  durationMs: number;
  createdAt: string;
}

interface RecordingListProps {
  scriptId: string;
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

export function RecordingList({ scriptId }: RecordingListProps) {
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecordings(scriptId).then((res) => {
      if (res.success && res.data) {
        setRecordings(res.data as RecordingItem[]);
      }
      setLoading(false);
    });
  }, [scriptId]);

  if (loading) return null;
  if (recordings.length === 0) return null;

  return (
    <div className="mt-8 rounded-lg border border-gray-800 bg-pp-dark-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Recordings
        </h3>
        <Link
          href={`/scripts/${scriptId}/analytics`}
          className="text-xs text-pp-primary-400 transition-colors hover:text-pp-primary-300"
        >
          View Analytics
        </Link>
      </div>
      <div className="divide-y divide-gray-800/50">
        {recordings.slice(0, 5).map((rec) => (
          <div
            key={rec.id}
            className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-sm text-gray-300">{rec.title}</p>
              <p className="text-xs text-gray-500">{formatDate(rec.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{formatDuration(rec.durationMs)}</span>
              <Link
                href={`/scripts/${scriptId}/playback?recording=${rec.id}`}
                className="rounded px-2 py-1 text-xs text-pp-primary-400 transition-colors hover:bg-pp-primary-600/10"
              >
                Playback
              </Link>
            </div>
          </div>
        ))}
      </div>
      {recordings.length > 5 && (
        <Link
          href={`/scripts/${scriptId}/analytics`}
          className="mt-2 block text-center text-xs text-gray-500 hover:text-gray-300"
        >
          View all {recordings.length} recordings
        </Link>
      )}
    </div>
  );
}
