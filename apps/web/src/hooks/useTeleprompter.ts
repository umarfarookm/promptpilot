'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { TeleprompterSettings, TeleprompterState } from '@promptpilot/types';
import { DEFAULT_TELEPROMPTER_SETTINGS, SETTINGS_STORAGE_KEY } from '@/lib/constants';

function loadSettings(): TeleprompterSettings {
  if (typeof window === 'undefined') return DEFAULT_TELEPROMPTER_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_TELEPROMPTER_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_TELEPROMPTER_SETTINGS;
}

function saveSettings(settings: TeleprompterSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function useTeleprompter(blockCount: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const [settings, setSettingsState] = useState<TeleprompterSettings>(DEFAULT_TELEPROMPTER_SETTINGS);
  const [state, setState] = useState<TeleprompterState>({
    isPlaying: false,
    currentBlockIndex: 0,
    currentSentenceIndex: 0,
    elapsedTime: 0,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    setSettingsState(loadSettings());
  }, []);

  const setSettings = useCallback(
    (update: Partial<TeleprompterSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, ...update };
        saveSettings(next);
        return next;
      });
    },
    [],
  );

  const calculateCurrentBlockIndex = useCallback(() => {
    const container = scrollRef.current;
    if (!container || blockCount === 0) return 0;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;

    if (scrollHeight <= 0) return 0;

    const progress = scrollTop / scrollHeight;
    return Math.min(Math.floor(progress * blockCount), blockCount - 1);
  }, [blockCount]);

  const scrollLoop = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const container = scrollRef.current;
      if (container) {
        // scrollSpeed maps to pixels per second: speed * 1.5
        const pixelsPerSecond = settings.scrollSpeed * 1.5;
        const scrollAmount = (pixelsPerSecond * delta) / 1000;
        container.scrollTop += scrollAmount;

        const blockIndex = calculateCurrentBlockIndex();
        setState((prev) => ({
          ...prev,
          currentBlockIndex: blockIndex,
          elapsedTime: (timestamp - startTimeRef.current) / 1000,
        }));

        // Check if we've reached the bottom
        const atBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 2;

        if (atBottom) {
          setState((prev) => ({ ...prev, isPlaying: false }));
          return;
        }
      }

      animationRef.current = requestAnimationFrame(scrollLoop);
    },
    [settings.scrollSpeed, calculateCurrentBlockIndex],
  );

  const play = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true }));
    lastTimeRef.current = 0;
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
    }
    animationRef.current = requestAnimationFrame(scrollLoop);
  }, [scrollLoop]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => {
      if (prev.isPlaying) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = 0;
        }
        return { ...prev, isPlaying: false };
      }
      return prev;
    });

    // If it was not playing, start it
    if (!state.isPlaying) {
      play();
    }
  }, [state.isPlaying, play]);

  const reset = useCallback(() => {
    pause();
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    startTimeRef.current = 0;
    setState({
      isPlaying: false,
      currentBlockIndex: 0,
      currentSentenceIndex: 0,
      elapsedTime: 0,
    });
  }, [pause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    scrollRef,
    state,
    settings,
    setSettings,
    play,
    pause,
    toggle,
    reset,
  };
}
