import type { TeleprompterSettings } from '@promptpilot/types';

export const DEFAULT_TELEPROMPTER_SETTINGS: TeleprompterSettings = {
  fontSize: 32,
  scrollSpeed: 30,
  mirrorMode: false,
  highlightCurrent: true,
  cameraPosition: 'top',
  theme: 'dark',
  lineSpacing: 1.6,
  marginPercent: 15,
};

export const FONT_SIZE_PRESETS = {
  small: 24,
  medium: 32,
  large: 48,
  extraLarge: 64,
} as const;

export const SCROLL_SPEED_PRESETS = {
  slow: 15,
  medium: 30,
  fast: 50,
  veryFast: 75,
} as const;

export const SETTINGS_STORAGE_KEY = 'promptpilot-teleprompter-settings';
