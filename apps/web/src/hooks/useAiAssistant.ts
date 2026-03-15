'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  AiGenerateRequest,
  AiRewriteRequest,
  AiTransitionsRequest,
  AiGrammarReviewRequest,
  AiProviderId,
} from '@promptpilot/types';
import { fetchAiStatus, streamAiRequest } from '@/lib/api';

export interface AiStatus {
  available: boolean;
  provider: AiProviderId;
  model: string;
  error?: string;
}

export interface UseAiAssistantReturn {
  generating: boolean;
  generatedContent: string;
  error: string | null;
  status: AiStatus | null;
  generate: (req: AiGenerateRequest) => void;
  rewrite: (req: AiRewriteRequest) => void;
  suggestTransitions: (req: AiTransitionsRequest) => void;
  reviewGrammar: (req: AiGrammarReviewRequest) => void;
  cancel: () => void;
  reset: () => void;
  checkStatus: () => Promise<void>;
}

export function useAiAssistant(): UseAiAssistantReturn {
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const checkStatus = useCallback(async () => {
    const res = await fetchAiStatus();
    if (res.success && res.data) {
      setStatus(res.data);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const startStream = useCallback(
    (endpoint: string, body: AiGenerateRequest | AiRewriteRequest | AiTransitionsRequest | AiGrammarReviewRequest) => {
      controllerRef.current?.abort();
      setGenerating(true);
      setGeneratedContent('');
      setError(null);

      const controller = streamAiRequest(
        endpoint,
        body,
        (chunk) => setGeneratedContent((prev) => prev + chunk),
        () => setGenerating(false),
        (err) => {
          setError(err);
          setGenerating(false);
        },
      );
      controllerRef.current = controller;
    },
    [],
  );

  const generate = useCallback(
    (req: AiGenerateRequest) => startStream('/api/ai/generate', req),
    [startStream],
  );

  const rewrite = useCallback(
    (req: AiRewriteRequest) => startStream('/api/ai/rewrite', req),
    [startStream],
  );

  const suggestTransitions = useCallback(
    (req: AiTransitionsRequest) => startStream('/api/ai/transitions', req),
    [startStream],
  );

  const reviewGrammar = useCallback(
    (req: AiGrammarReviewRequest) => startStream('/api/ai/grammar-review', req),
    [startStream],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setGenerating(false);
  }, []);

  const reset = useCallback(() => {
    cancel();
    setGeneratedContent('');
    setError(null);
  }, [cancel]);

  return {
    generating,
    generatedContent,
    error,
    status,
    generate,
    rewrite,
    suggestTransitions,
    reviewGrammar,
    cancel,
    reset,
    checkStatus,
  };
}
