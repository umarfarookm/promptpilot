'use client';

import { useEffect, useCallback } from 'react';
import type { TeleprompterSettings } from '@promptpilot/types';

interface KeyboardShortcutActions {
  toggle: () => void;
  setSettings: (update: Partial<TeleprompterSettings>) => void;
  settings: TeleprompterSettings;
}

export function useKeyboardShortcuts({
  toggle,
  setSettings,
  settings,
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

        default:
          break;
      }
    },
    [toggle, setSettings, settings.scrollSpeed, settings.fontSize],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
