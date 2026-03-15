'use client';

import { useState, useCallback } from 'react';
import type { ScriptBlock } from '@promptpilot/types';

export type BlockStatus = 'pending' | 'active' | 'running' | 'success' | 'failed' | 'skipped';

export interface StepModeState {
  currentIndex: number;
  blockStatuses: BlockStatus[];
  autoAdvance: boolean;
}

export interface StepModeHook {
  state: StepModeState;
  advance: () => void;
  previous: () => void;
  goTo: (index: number) => void;
  markStatus: (index: number, status: BlockStatus) => void;
  toggleAutoAdvance: () => void;
  reset: () => void;
  isActive: boolean;
}

export function useStepMode(blocks: ScriptBlock[], enabled: boolean): StepModeHook {
  const [state, setState] = useState<StepModeState>(() => ({
    currentIndex: 0,
    blockStatuses: blocks.map((_, i) => (i === 0 ? 'active' : 'pending')),
    autoAdvance: false,
  }));

  const advance = useCallback(() => {
    setState((prev) => {
      const next = prev.currentIndex + 1;
      if (next >= blocks.length) return prev;

      const statuses = [...prev.blockStatuses];
      // Mark current as success if still active
      if (statuses[prev.currentIndex] === 'active') {
        statuses[prev.currentIndex] = 'success';
      }
      statuses[next] = 'active';

      return { ...prev, currentIndex: next, blockStatuses: statuses };
    });
  }, [blocks.length]);

  const previous = useCallback(() => {
    setState((prev) => {
      const next = prev.currentIndex - 1;
      if (next < 0) return prev;

      const statuses = [...prev.blockStatuses];
      statuses[prev.currentIndex] = 'pending';
      statuses[next] = 'active';

      return { ...prev, currentIndex: next, blockStatuses: statuses };
    });
  }, []);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= blocks.length) return;
    setState((prev) => {
      const statuses = [...prev.blockStatuses];
      statuses[prev.currentIndex] = 'pending';
      statuses[index] = 'active';
      return { ...prev, currentIndex: index, blockStatuses: statuses };
    });
  }, [blocks.length]);

  const markStatus = useCallback((index: number, status: BlockStatus) => {
    setState((prev) => {
      const statuses = [...prev.blockStatuses];
      statuses[index] = status;
      return { ...prev, blockStatuses: statuses };
    });
  }, []);

  const toggleAutoAdvance = useCallback(() => {
    setState((prev) => ({ ...prev, autoAdvance: !prev.autoAdvance }));
  }, []);

  const reset = useCallback(() => {
    setState({
      currentIndex: 0,
      blockStatuses: blocks.map((_, i) => (i === 0 ? 'active' : 'pending')),
      autoAdvance: false,
    });
  }, [blocks]);

  return {
    state,
    advance,
    previous,
    goTo,
    markStatus,
    toggleAutoAdvance,
    reset,
    isActive: enabled,
  };
}
