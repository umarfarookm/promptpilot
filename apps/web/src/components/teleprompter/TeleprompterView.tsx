'use client';

import { useCallback } from 'react';
import type { ScriptBlock } from '@promptpilot/types';
import { useTeleprompter } from '@/hooks/useTeleprompter';
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
    play,
    pause,
    toggle,
    reset,
  } = useTeleprompter(blocks.length);

  useKeyboardShortcuts({ toggle, setSettings, settings });

  const handleToggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  return (
    <div
      className="relative h-screen w-screen bg-black"
      style={{
        transform: settings.mirrorMode ? 'scaleX(-1)' : undefined,
      }}
    >
      <CameraIndicator position={settings.cameraPosition} />

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
              fontSize={settings.fontSize}
              lineSpacing={settings.lineSpacing}
              isActive={index === state.currentBlockIndex}
              highlightCurrent={settings.highlightCurrent}
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
          onReset={reset}
          onSettingsChange={setSettings}
          onToggleFullscreen={handleToggleFullscreen}
        />
      </div>
    </div>
  );
}
