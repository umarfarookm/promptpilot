'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ScriptBlock, ScriptWordPosition, SpeechRecognitionStatus } from '@promptpilot/types';
import { createSpeechProvider } from '@/services/speech';
import type { SpeechRecognitionProvider } from '@/services/speech';
import { ScriptAligner } from '@/services/alignment';

interface UseSpeechSyncOptions {
  enabled: boolean;
  language: string;
  provider: 'web-speech-api' | 'whisper';
}

interface UseSpeechSyncReturn {
  status: SpeechRecognitionStatus;
  matchedPosition: ScriptWordPosition | null;
  confidence: number;
  transcript: string;
  progress: number;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

export function useSpeechSync(
  blocks: ScriptBlock[],
  options: UseSpeechSyncOptions
): UseSpeechSyncReturn {
  const [status, setStatus] = useState<SpeechRecognitionStatus>('idle');
  const [matchedPosition, setMatchedPosition] = useState<ScriptWordPosition | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const providerRef = useRef<SpeechRecognitionProvider | null>(null);
  const alignerRef = useRef<ScriptAligner | null>(null);

  // Initialize aligner when blocks change
  useEffect(() => {
    alignerRef.current = new ScriptAligner(blocks);
  }, [blocks]);

  const start = useCallback(async () => {
    if (!options.enabled) return;

    setError(null);

    // Create provider
    const provider = createSpeechProvider(options.provider, {
      language: options.language,
    });
    providerRef.current = provider;

    if (!provider.isSupported) {
      setStatus('unsupported');
      setError('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    // Wire up callbacks
    provider.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    provider.onError((err) => {
      setError(err);
    });

    provider.onResult((speechTranscript) => {
      setTranscript(speechTranscript.text);

      const aligner = alignerRef.current;
      if (!aligner) return;

      const result = aligner.processTranscript(speechTranscript);
      if (result) {
        setMatchedPosition(result.matchedUpTo);
        setConfidence(result.confidence);
        setProgress(aligner.getProgress());
      }
    });

    await provider.start();
  }, [options.enabled, options.provider, options.language]);

  const stop = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.stop();
      providerRef.current = null;
    }
    setStatus('idle');
  }, []);

  const reset = useCallback(() => {
    stop();
    if (alignerRef.current) {
      alignerRef.current.reset();
    }
    setMatchedPosition(null);
    setConfidence(0);
    setTranscript('');
    setProgress(0);
    setError(null);
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.stop();
      }
    };
  }, []);

  return {
    status,
    matchedPosition,
    confidence,
    transcript,
    progress,
    error,
    start,
    stop,
    reset,
  };
}
