'use client';

import { useEffect, useCallback } from 'react';
import type { TeleprompterSettings } from '@promptpilot/types';

interface KeyboardShortcutActions {
  toggle: () => void;
  setSettings: (update: Partial<TeleprompterSettings>) => void;
  settings: TeleprompterSettings;
  onToggleSpeechSync?: () => void;
  onStepAdvance?: () => void;
  onStepPrevious?: () => void;
  onStepRun?: () => void;
  onStepSkip?: () => void;
  onClose?: () => void;
}

export function useKeyboardShortcuts({
  toggle,
  setSettings,
  settings,
  onToggleSpeechSync,
  onStepAdvance,
  onStepPrevious,
  onStepRun,
  onStepSkip,
  onClose,
}: KeyboardShortcutActions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isStepMode = settings.scrollMode === 'step';

      // Step mode shortcuts
      if (isStepMode) {
        switch (e.key) {
          case 'Enter':
          case 'ArrowRight':
            e.preventDefault();
            onStepAdvance?.();
            return;

          case 'Backspace':
          case 'ArrowLeft':
            e.preventDefault();
            onStepPrevious?.();
            return;

          case 'r':
          case 'R':
            e.preventDefault();
            onStepRun?.();
            return;

          case 's':
          case 'S':
            e.preventDefault();
            onStepSkip?.();
            return;
        }
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          toggle();
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSettings({
            scrollSpeed: Math.min(settings.scrollSpeed + 5, 100),
          });
          break;

        case 'ArrowDown':
          e.preventDefault();
          setSettings({
            scrollSpeed: Math.max(settings.scrollSpeed - 5, 0),
          });
          break;

        case '+':
        case '=':
          e.preventDefault();
          setSettings({
            fontSize: Math.min(settings.fontSize + 2, 72),
          });
          break;

        case '-':
        case '_':
          e.preventDefault();
          setSettings({
            fontSize: Math.max(settings.fontSize - 2, 16),
          });
          break;

        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (onClose) {
            onClose();
          }
          break;

        case 'f':
        case 'F':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          if (onToggleSpeechSync) {
            onToggleSpeechSync();
          }
          break;

        case 'v':
        case 'V':
          e.preventDefault();
          {
            const hasStepMode = !!onStepAdvance;
            const modes: Array<'auto' | 'speech' | 'step'> = hasStepMode
              ? ['auto', 'speech', 'step']
              : ['auto', 'speech'];
            const currentIdx = modes.indexOf(settings.scrollMode);
            const nextMode = modes[(currentIdx + 1) % modes.length];
            setSettings({ scrollMode: nextMode });
          }
          break;

        default:
          break;
      }
    },
    [
      toggle,
      setSettings,
      settings.scrollSpeed,
      settings.fontSize,
      settings.scrollMode,
      onToggleSpeechSync,
      onStepAdvance,
      onStepPrevious,
      onStepRun,
      onStepSkip,
      onClose,
    ],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
