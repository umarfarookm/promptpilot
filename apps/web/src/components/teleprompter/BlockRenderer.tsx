'use client';

import clsx from 'clsx';
import type { ScriptBlock } from '@promptpilot/types';
import { SentenceHighlighter } from './SentenceHighlighter';
import type { BlockStatus } from '@/hooks/useStepMode';

interface BlockRendererProps {
  block: ScriptBlock;
  blockIndex: number;
  fontSize: number;
  lineSpacing: number;
  isActive: boolean;
  highlightCurrent: boolean;
  activeWordIndex?: number;
  executionStatus?: BlockStatus;
}

const STATUS_BADGE: Record<BlockStatus, { label: string; className: string } | null> = {
  pending: null,
  active: null,
  running: { label: 'Running', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  success: { label: 'Done', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  failed: { label: 'Failed', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  skipped: { label: 'Skipped', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export function BlockRenderer({
  block,
  blockIndex,
  fontSize,
  lineSpacing,
  isActive,
  highlightCurrent,
  activeWordIndex,
  executionStatus,
}: BlockRendererProps) {
  const dataAttrs = { 'data-block-index': blockIndex };

  switch (block.type) {
    case 'SAY':
      return (
        <div
          {...dataAttrs}
          className={clsx(
            'block-say transition-opacity duration-300',
            isActive && highlightCurrent ? 'opacity-100' : 'opacity-70',
          )}
        >
          <span
            className="mb-1 block text-xs uppercase tracking-widest text-gray-600"
            style={{ fontSize: `${Math.max(fontSize * 0.35, 10)}px` }}
          >
            Say
          </span>
          {isActive && highlightCurrent ? (
            <SentenceHighlighter
              text={block.content}
              currentSentenceIndex={0}
              fontSize={fontSize}
              lineSpacing={lineSpacing}
              activeWordIndex={activeWordIndex}
            />
          ) : (
            <p
              className="teleprompter-text text-white"
              style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}
            >
              {block.content}
            </p>
          )}
        </div>
      );

    case 'ACTION':
      return (
        <div
          {...dataAttrs}
          className={clsx(
            'block-action transition-opacity duration-300',
            isActive && highlightCurrent ? 'opacity-100' : 'opacity-70',
          )}
        >
          <div className="flex items-start gap-3">
            <svg
              className="mt-1 h-5 w-5 flex-shrink-0 text-pp-accent-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <p
              className="text-pp-accent-400"
              style={{
                fontSize: `${fontSize * 0.75}px`,
                lineHeight: lineSpacing,
              }}
            >
              {block.content}
            </p>
          </div>
        </div>
      );

    case 'COMMAND': {
      const badge = executionStatus ? STATUS_BADGE[executionStatus] : null;
      return (
        <div
          {...dataAttrs}
          className={clsx(
            'block-command transition-opacity duration-300',
            isActive && highlightCurrent ? 'opacity-100' : 'opacity-70',
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className="block text-xs uppercase tracking-widest text-gray-500"
              style={{ fontSize: `${Math.max(fontSize * 0.3, 10)}px` }}
            >
              Command
            </span>
            {badge && (
              <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}>
                {executionStatus === 'running' && (
                  <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
                )}
                {badge.label}
              </span>
            )}
          </div>
          <pre
            className="mt-1 whitespace-pre-wrap text-green-400"
            style={{
              fontSize: `${fontSize * 0.65}px`,
              lineHeight: lineSpacing,
            }}
          >
            {block.content}
          </pre>
        </div>
      );
    }

    case 'TEXT':
    default:
      return (
        <div
          {...dataAttrs}
          className={clsx(
            'transition-opacity duration-300',
            isActive && highlightCurrent ? 'opacity-100' : 'opacity-70',
          )}
        >
          {isActive && highlightCurrent ? (
            <SentenceHighlighter
              text={block.content}
              currentSentenceIndex={0}
              fontSize={fontSize}
              lineSpacing={lineSpacing}
              activeWordIndex={activeWordIndex}
            />
          ) : (
            <p
              className="teleprompter-text text-white"
              style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}
            >
              {block.content}
            </p>
          )}
        </div>
      );
  }
}
