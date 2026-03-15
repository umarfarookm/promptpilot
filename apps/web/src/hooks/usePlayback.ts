'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { RecordingData, RecordingEvent } from '@promptpilot/types';

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'ended';

export interface PlaybackHook {
  state: PlaybackState;
  currentTime: number;
  duration: number;
  speed: number;
  events: RecordingEvent[];
  visibleEvents: RecordingEvent[];
  play: () => void;
  pause: () => void;
  seek: (timeMs: number) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
}

export function usePlayback(recording: RecordingData | null): PlaybackHook {
  const [state, setState] = useState<PlaybackState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef(0);
  const currentTimeRef = useRef(0);

  const duration = recording?.duration ?? 0;
  const events = recording?.events ?? [];

  const visibleEvents = events.filter((e) => e.timestamp <= currentTimeRef.current);

  const tick = useCallback(
    (timestamp: number) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }

      const delta = (timestamp - lastFrameRef.current) * speed;
      lastFrameRef.current = timestamp;

      currentTimeRef.current = Math.min(currentTimeRef.current + delta, duration);
      setCurrentTime(currentTimeRef.current);

      if (currentTimeRef.current >= duration) {
        setState('ended');
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [speed, duration],
  );

  const play = useCallback(() => {
    if (currentTimeRef.current >= duration) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
    }
    setState('playing');
    lastFrameRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, duration]);

  const pause = useCallback(() => {
    setState('paused');
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const seek = useCallback((timeMs: number) => {
    currentTimeRef.current = Math.max(0, Math.min(timeMs, duration));
    setCurrentTime(currentTimeRef.current);
  }, [duration]);

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s);
  }, []);

  const reset = useCallback(() => {
    pause();
    currentTimeRef.current = 0;
    setCurrentTime(0);
    setState('idle');
  }, [pause]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    state,
    currentTime,
    duration,
    speed,
    events,
    visibleEvents,
    play,
    pause,
    seek,
    setSpeed,
    reset,
  };
}
