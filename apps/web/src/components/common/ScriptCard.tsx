'use client';

import Link from 'next/link';
import type { Script } from '@promptpilot/types';

interface ScriptCardProps {
  script: Script;
}

export function ScriptCard({ script }: ScriptCardProps) {
  const updatedAt = new Date(script.updatedAt);
  const timeAgo = getTimeAgo(updatedAt);

  return (
    <div className="group rounded-xl border border-gray-800 bg-pp-dark-900 p-5 transition-colors hover:border-gray-700">
      <Link href={`/scripts/${script.id}`} className="block">
        <h3 className="mb-1 text-lg font-semibold text-white group-hover:text-pp-primary-400 transition-colors">
          {script.title}
        </h3>
        {script.description && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-400">
            {script.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {script.blocks && <><span>{script.blocks.length} blocks</span><span className="text-gray-700">|</span></>}
          <span>Updated {timeAgo}</span>
        </div>
      </Link>

      <div className="mt-4 flex items-center gap-2 border-t border-gray-800 pt-3">
        <Link
          href={`/scripts/${script.id}`}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          Edit
        </Link>
        <Link
          href={`/scripts/${script.id}/present`}
          className="inline-flex items-center gap-1 rounded-md bg-pp-primary-600/10 px-3 py-1.5 text-xs font-medium text-pp-primary-400 transition-colors hover:bg-pp-primary-600/20"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
          </svg>
          Present
        </Link>
        <Link
          href={`/scripts/${script.id}/analytics`}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          Analytics
        </Link>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return 'just now';
}
