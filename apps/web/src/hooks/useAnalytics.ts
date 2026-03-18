'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ScriptAnalytics } from '@promptpilot/types';
import { fetchScriptAnalytics } from '@/lib/api';

export function useAnalytics(scriptId: string) {
  const [analytics, setAnalytics] = useState<ScriptAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchScriptAnalytics(scriptId);
      if (res.success && res.data) {
        setAnalytics(res.data);
      } else {
        setError(res.error ?? 'Failed to load analytics');
      }
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [scriptId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { analytics, loading, error, refresh };
}
