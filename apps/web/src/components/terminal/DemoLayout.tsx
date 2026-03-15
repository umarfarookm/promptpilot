'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ScriptBlock, CommandFinishedPayload } from '@promptpilot/types';
import { TeleprompterView } from '@/components/teleprompter/TeleprompterView';
import { TerminalPane } from './TerminalPane';
import { CommandConfirmBar } from './CommandConfirmBar';
import { StepControls } from './StepControls';
import { RecordingControls } from './RecordingControls';
import { useTerminalSession } from '@/hooks/useTerminalSession';
import { useStepMode } from '@/hooks/useStepMode';

interface DemoLayoutProps {
  blocks: ScriptBlock[];
  scriptId?: string;
  scriptTitle?: string;
}

export function DemoLayout({ blocks, scriptId = '', scriptTitle = '' }: DemoLayoutProps) {
  const session = useTerminalSession();
  const stepMode = useStepMode(blocks, true);
  const [splitPercent, setSplitPercent] = useState(55);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [errorAnalysis, setErrorAnalysis] = useState<{
    category: string;
    message: string;
    suggestions: string[];
  } | null>(null);

  // Keep refs for use in the onCommandFinished callback
  const stepModeRef = useRef(stepMode);
  stepModeRef.current = stepMode;

  // Current block at step index
  const currentBlock = blocks[stepMode.state.currentIndex];
  const isCommandBlock = currentBlock?.type === 'COMMAND';
  const currentStatus = stepMode.state.blockStatuses[stepMode.state.currentIndex];
  const showConfirmBar =
    isCommandBlock && (currentStatus === 'active' || currentStatus === 'failed');

  // Connect to terminal on mount
  useEffect(() => {
    session.connect();
    return () => session.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle command completion — register once
  useEffect(() => {
    session.onCommandFinished((payload: CommandFinishedPayload) => {
      const sm = stepModeRef.current;
      const idx = sm.state.currentIndex;
      const analysis = (payload as unknown as { errorAnalysis?: typeof errorAnalysis }).errorAnalysis;

      if (payload.exitCode === 0) {
        sm.markStatus(idx, 'success');
        setErrorAnalysis(null);
        if (sm.state.autoAdvance) {
          setTimeout(() => sm.advance(), 500);
        }
      } else {
        sm.markStatus(idx, 'failed');
        setErrorAnalysis(analysis || null);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draggable divider
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.max(30, Math.min(70, pct)));
    };

    const handleMouseUp = () => setDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const handleRunCommand = useCallback(
    (command: string) => {
      setErrorAnalysis(null);
      stepMode.markStatus(stepMode.state.currentIndex, 'running');
      session.executeCommand(command, stepMode.state.currentIndex);
    },
    [session, stepMode],
  );

  const handleSkipCommand = useCallback(() => {
    stepMode.markStatus(stepMode.state.currentIndex, 'skipped');
    stepMode.advance();
  }, [stepMode]);

  return (
    <div ref={containerRef} className="flex h-screen w-screen bg-black">
      {/* Teleprompter panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${splitPercent}%` }}
      >
        <TeleprompterView
          blocks={blocks}
          stepMode={stepMode}
          scriptId={scriptId}
        />
      </div>

      {/* Draggable divider */}
      <div
        className={`group relative h-full w-1.5 cursor-col-resize ${
          dragging ? 'bg-pp-primary-500' : 'bg-gray-800 hover:bg-pp-primary-600'
        } transition-colors`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      {/* Terminal panel */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Step controls bar */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-4 py-2">
          <StepControls stepMode={stepMode} totalBlocks={blocks.length} />
          <div className="flex items-center gap-2">
            <RecordingControls
              session={session}
              scriptId={scriptId}
              scriptTitle={scriptTitle}
              blocks={blocks}
            />
            <a
              href={scriptId ? `/scripts/${scriptId}` : '/'}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Close demo"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TerminalPane session={session} />
        </div>

        {showConfirmBar && (
          <CommandConfirmBar
            command={currentBlock.content}
            blockIndex={stepMode.state.currentIndex}
            onRun={handleRunCommand}
            onSkip={handleSkipCommand}
            disabled={session.state === 'executing'}
            errorAnalysis={errorAnalysis}
          />
        )}
      </div>
    </div>
  );
}
