'use client';

import { useCallback, useEffect } from 'react';
import type { ScriptBlock } from '@promptpilot/types';
import { useTeleprompter } from '@/hooks/useTeleprompter';
import { useSpeechSync } from '@/hooks/useSpeechSync';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { BlockRenderer } from './BlockRenderer';
import { TeleprompterControls } from './TeleprompterControls';
import { CameraIndicator } from './CameraIndicator';

interface TeleprompterViewProps {
  blocks: ScriptBlock[];
}

export function TeleprompterView({ blocks }: TeleprompterViewProps) {
  const {
    scrollRef,
    state,
    settings,
    setSettings,
    toggle,
    reset,
    scrollToWordPosition,
  } = useTeleprompter(blocks.length);

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
  }, [reset, speechSync]);

  useKeyboardShortcuts({
    toggle,
    setSettings,
    settings,
    onToggleSpeechSync: handleToggleSpeechSync,
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

  return (
    <div
      className="relative h-screen w-screen bg-black"
      style={{
        transform: settings.mirrorMode ? 'scaleX(-1)' : undefined,
      }}
    >
      <CameraIndicator position={settings.cameraPosition} />

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
              isActive={index === state.currentBlockIndex}
              highlightCurrent={settings.highlightCurrent}
              activeWordIndex={getActiveWordIndex(index)}
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
