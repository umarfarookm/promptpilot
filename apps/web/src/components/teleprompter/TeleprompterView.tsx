'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ScriptBlock } from '@promptpilot/types';
import { useTeleprompter } from '@/hooks/useTeleprompter';
import { useSpeechSync } from '@/hooks/useSpeechSync';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { BlockRenderer } from './BlockRenderer';
import { TeleprompterControls } from './TeleprompterControls';
import { CameraIndicator } from './CameraIndicator';
import type { StepModeHook } from '@/hooks/useStepMode';

interface TeleprompterViewProps {
  blocks: ScriptBlock[];
  stepMode?: StepModeHook;
  scriptId?: string;
}

export function TeleprompterView({ blocks, stepMode, scriptId }: TeleprompterViewProps) {
  const router = useRouter();
  const {
    scrollRef,
    state,
    settings,
    setSettings,
    toggle,
    reset,
    scrollToBlock,
    scrollToWordPosition,
  } = useTeleprompter(blocks.length);

  // In demo mode, force step mode; in standalone mode, reset step mode to auto
  useEffect(() => {
    if (stepMode && settings.scrollMode !== 'step') {
      setSettings({ scrollMode: 'step' });
    } else if (!stepMode && settings.scrollMode === 'step') {
      setSettings({ scrollMode: 'auto' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!stepMode]);

  const speechSync = useSpeechSync(blocks, {
    enabled: settings.scrollMode === 'speech',
    language: settings.speechSync?.language ?? 'en-US',
    provider: settings.speechSync?.provider ?? 'web-speech-api',
  });

  // When speech sync produces a new matched position, scroll there
  useEffect(() => {
    if (settings.scrollMode === 'speech' && speechSync.matchedPosition) {
      scrollToWordPosition(speechSync.matchedPosition);
    }
  }, [settings.scrollMode, speechSync.matchedPosition, scrollToWordPosition]);

  // In step mode, scroll to current block when it changes
  useEffect(() => {
    if (stepMode && settings.scrollMode === 'step') {
      scrollToBlock(stepMode.state.currentIndex);
    }
  }, [stepMode, stepMode?.state.currentIndex, settings.scrollMode, scrollToBlock]);

  const handleToggleSpeechSync = useCallback(async () => {
    if (speechSync.status === 'listening') {
      speechSync.stop();
    } else {
      // Switch to speech mode if not already
      if (settings.scrollMode !== 'speech') {
        setSettings({ scrollMode: 'speech' });
      }
      await speechSync.start();
    }
  }, [speechSync, settings.scrollMode, setSettings]);

  const handleReset = useCallback(() => {
    reset();
    speechSync.reset();
    stepMode?.reset();
  }, [reset, speechSync, stepMode]);

  const handleClose = useCallback(() => {
    if (scriptId) {
      router.push(`/scripts/${scriptId}`);
    } else {
      router.push('/');
    }
  }, [scriptId, router]);

  useKeyboardShortcuts({
    toggle,
    setSettings,
    settings,
    onToggleSpeechSync: handleToggleSpeechSync,
    onStepAdvance: stepMode?.advance,
    onStepPrevious: stepMode?.previous,
    onClose: handleClose,
  });

  const handleToggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  // Calculate active word index for the current block when in speech mode
  const getActiveWordIndex = (blockIndex: number): number | undefined => {
    if (settings.scrollMode !== 'speech') return undefined;
    const pos = speechSync.matchedPosition;
    if (!pos || pos.blockIndex !== blockIndex) return undefined;
    return pos.wordIndex;
  };

  // Determine active block: step mode takes precedence
  const activeBlockIndex = stepMode
    ? stepMode.state.currentIndex
    : state.currentBlockIndex;

  return (
    <div
      className={`relative bg-black ${stepMode ? 'h-full w-full' : 'h-screen w-screen'}`}
      style={{
        transform: settings.mirrorMode ? 'scaleX(-1)' : undefined,
      }}
    >
      <CameraIndicator position={settings.cameraPosition} />

      {/* Back button */}
      {scriptId && !stepMode && (
        <a
          href={`/scripts/${scriptId}`}
          className="fixed left-4 top-4 z-50 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-2 text-sm text-gray-400 opacity-0 backdrop-blur-sm transition-opacity hover:opacity-100 hover:text-white focus:opacity-100"
          style={{ transform: settings.mirrorMode ? 'scaleX(-1)' : undefined }}
          title="Back to editor (Esc)"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Close
        </a>
      )}

      {/* Speech transcript debug overlay */}
      {settings.scrollMode === 'speech' && speechSync.transcript && (
        <div className="fixed top-4 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-black/60 px-4 py-2 backdrop-blur-sm"
          style={{ transform: settings.mirrorMode ? 'scaleX(-1)' : undefined }}
        >
          <p className="text-xs text-gray-400 text-center max-w-md truncate">
            {speechSync.transcript}
          </p>
        </div>
      )}

      <div
        ref={scrollRef}
        className="h-full overflow-y-auto scroll-smooth"
        style={{
          paddingLeft: `${settings.marginPercent}%`,
          paddingRight: `${settings.marginPercent}%`,
        }}
      >
        {/* Top spacer so text starts at middle of viewport */}
        <div className="h-[50vh]" />

        <div className="space-y-6">
          {blocks.map((block, index) => (
            <BlockRenderer
              key={block.id}
              block={block}
              blockIndex={index}
              fontSize={settings.fontSize}
              lineSpacing={settings.lineSpacing}
              isActive={index === activeBlockIndex}
              highlightCurrent={settings.highlightCurrent}
              activeWordIndex={getActiveWordIndex(index)}
              executionStatus={
                stepMode && block.type === 'COMMAND'
                  ? stepMode.state.blockStatuses[index]
                  : undefined
              }
            />
          ))}
        </div>

        {/* Bottom spacer so text can scroll to center */}
        <div className="h-[50vh]" />
      </div>

      {/* Controls overlay - un-mirror if mirrored */}
      <div
        style={{
          transform: settings.mirrorMode ? 'scaleX(-1)' : undefined,
        }}
      >
        <TeleprompterControls
          state={state}
          settings={settings}
          onToggle={toggle}
          onReset={handleReset}
          onSettingsChange={setSettings}
          onToggleFullscreen={handleToggleFullscreen}
          speechStatus={speechSync.status}
          speechProgress={speechSync.progress}
          onToggleSpeechSync={handleToggleSpeechSync}
          showStepMode={!!stepMode}
        />
      </div>

      {/* Speech error toast */}
      {speechSync.error && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-red-900/80 px-4 py-3 text-sm text-red-200 backdrop-blur-sm"
          style={{ transform: settings.mirrorMode ? 'scaleX(-1)' : undefined }}
        >
          {speechSync.error}
        </div>
      )}
    </div>
  );
}
