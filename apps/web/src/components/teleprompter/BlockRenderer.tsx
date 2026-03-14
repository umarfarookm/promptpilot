'use client';

import clsx from 'clsx';
import type { ScriptBlock } from '@promptpilot/types';
import { SentenceHighlighter } from './SentenceHighlighter';

interface BlockRendererProps {
  block: ScriptBlock;
  blockIndex: number;
  fontSize: number;
  lineSpacing: number;
  isActive: boolean;
  highlightCurrent: boolean;
  activeWordIndex?: number;
}

export function BlockRenderer({
  block,
  blockIndex,
  fontSize,
  lineSpacing,
  isActive,
  highlightCurrent,
  activeWordIndex,
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

    case 'COMMAND':
      return (
        <div
          {...dataAttrs}
          className={clsx(
            'block-command transition-opacity duration-300',
            isActive && highlightCurrent ? 'opacity-100' : 'opacity-70',
          )}
        >
          <span
            className="mb-1 block text-xs uppercase tracking-widest text-gray-500"
            style={{ fontSize: `${Math.max(fontSize * 0.3, 10)}px` }}
          >
            Command
          </span>
          <pre
            className="whitespace-pre-wrap text-green-400"
            style={{
              fontSize: `${fontSize * 0.65}px`,
              lineHeight: lineSpacing,
            }}
          >
            {block.content}
          </pre>
        </div>
      );

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
