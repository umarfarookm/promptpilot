'use client';

import type { TeleprompterSettings, TeleprompterState, SpeechRecognitionStatus } from '@promptpilot/types';

interface TeleprompterControlsProps {
  state: TeleprompterState;
  settings: TeleprompterSettings;
  onToggle: () => void;
  onReset: () => void;
  onSettingsChange: (update: Partial<TeleprompterSettings>) => void;
  onToggleFullscreen: () => void;
  speechStatus: SpeechRecognitionStatus;
  speechProgress: number;
  onToggleSpeechSync: () => void;
}

const STATUS_LABELS: Record<SpeechRecognitionStatus, string> = {
  idle: '',
  'requesting-mic': 'Requesting mic...',
  listening: 'Listening',
  paused: 'Paused',
  error: 'Error',
  unsupported: 'Not supported',
};

export function TeleprompterControls({
  state,
  settings,
  onToggle,
  onReset,
  onSettingsChange,
  onToggleFullscreen,
  speechStatus,
  speechProgress,
  onToggleSpeechSync,
}: TeleprompterControlsProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isSpeechMode = settings.scrollMode === 'speech';
  const isListening = speechStatus === 'listening';

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-black/70 px-6 py-4 backdrop-blur-sm transition-opacity hover:opacity-100 opacity-40">
      <div className="mx-auto flex max-w-5xl items-center gap-4">
        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Reset"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        {/* Play/Pause - only for auto mode */}
        {!isSpeechMode && (
          <button
            type="button"
            onClick={onToggle}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-pp-primary-600 text-white transition-colors hover:bg-pp-primary-700"
            title={state.isPlaying ? 'Pause' : 'Play'}
          >
            {state.isPlaying ? (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
              </svg>
            )}
          </button>
        )}

        {/* Mic toggle - for speech mode */}
        <button
          type="button"
          onClick={onToggleSpeechSync}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            isListening
              ? 'bg-red-600 text-white animate-pulse hover:bg-red-700'
              : isSpeechMode
                ? 'bg-pp-primary-600 text-white hover:bg-pp-primary-700'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
          }`}
          title={isListening ? 'Stop listening' : 'Start speech sync (M)'}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>

        {/* Speech status badge */}
        {speechStatus !== 'idle' && (
          <div className="flex items-center gap-2">
            {isListening && (
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
            <span className={`text-xs ${speechStatus === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
              {STATUS_LABELS[speechStatus]}
            </span>
            {speechProgress > 0 && (
              <span className="text-xs text-gray-500">
                {Math.round(speechProgress * 100)}%
              </span>
            )}
          </div>
        )}

        {/* Elapsed time */}
        <span className="min-w-[4rem] text-center text-sm tabular-nums text-gray-400">
          {formatTime(state.elapsedTime)}
        </span>

        {/* Font size slider */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Size</label>
          <input
            type="range"
            min={16}
            max={72}
            step={2}
            value={settings.fontSize}
            onChange={(e) => onSettingsChange({ fontSize: Number(e.target.value) })}
            className="w-20 accent-pp-primary-500"
          />
          <span className="min-w-[2rem] text-xs tabular-nums text-gray-400">
            {settings.fontSize}
          </span>
        </div>

        {/* Scroll speed slider - dimmed in speech mode */}
        <div className={`flex items-center gap-2 ${isSpeechMode ? 'opacity-30' : ''}`}>
          <label className="text-xs text-gray-500">Speed</label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={settings.scrollSpeed}
            onChange={(e) => onSettingsChange({ scrollSpeed: Number(e.target.value) })}
            className="w-20 accent-pp-primary-500"
            disabled={isSpeechMode}
          />
          <span className="min-w-[2rem] text-xs tabular-nums text-gray-400">
            {settings.scrollSpeed}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Scroll mode toggle */}
        <button
          type="button"
          onClick={() =>
            onSettingsChange({
              scrollMode: isSpeechMode ? 'auto' : 'speech',
            })
          }
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            isSpeechMode
              ? 'bg-pp-primary-600/20 text-pp-primary-400'
              : 'text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
          title="Toggle scroll mode (V)"
        >
          {isSpeechMode ? 'Voice' : 'Auto'}
        </button>

        {/* Mirror toggle */}
        <button
          type="button"
          onClick={() => onSettingsChange({ mirrorMode: !settings.mirrorMode })}
          className={`rounded-lg p-2 transition-colors ${
            settings.mirrorMode
              ? 'bg-pp-primary-600/20 text-pp-primary-400'
              : 'text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
          title="Mirror Mode"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
            />
          </svg>
        </button>

        {/* Camera position selector */}
        <select
          value={settings.cameraPosition}
          onChange={(e) =>
            onSettingsChange({
              cameraPosition: e.target.value as TeleprompterSettings['cameraPosition'],
            })
          }
          className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-xs text-gray-300"
          title="Camera Position"
        >
          <option value="top">Camera: Top</option>
          <option value="bottom">Camera: Bottom</option>
          <option value="left">Camera: Left</option>
          <option value="right">Camera: Right</option>
        </select>

        {/* Fullscreen toggle */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Toggle Fullscreen"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
