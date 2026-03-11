'use client';

import { useState, useCallback } from 'react';
import type { Script, CreateScriptRequest, UpdateScriptRequest } from '@promptpilot/types';
import {
  fetchScripts,
  fetchScript,
  createScript,
  updateScript,
  deleteScript,
} from '@/lib/api';

interface UseScriptReturn {
  script: Script | null;
  scripts: Script[];
  loading: boolean;
  error: string | null;
  save: (data: CreateScriptRequest | UpdateScriptRequest, id?: string) => Promise<Script | null>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useScript(id?: string): UseScriptReturn {
  const [script, setScript] = useState<Script | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (id) {
        const res = await fetchScript(id);
        if (res.success && res.data) {
          setScript(res.data);
        } else {
          setError(res.error || 'Failed to fetch script');
        }
      } else {
        const res = await fetchScripts();
        if (res.success && res.data) {
          setScripts(res.data);
        } else {
          setError(res.error || 'Failed to fetch scripts');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const save = useCallback(
    async (
      data: CreateScriptRequest | UpdateScriptRequest,
      scriptId?: string,
    ): Promise<Script | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = scriptId
          ? await updateScript(scriptId, data as UpdateScriptRequest)
          : await createScript(data as CreateScriptRequest);

        if (res.success && res.data) {
          setScript(res.data);
          return res.data;
        }
        setError(res.error || 'Failed to save script');
        return null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const remove = useCallback(async (scriptId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteScript(scriptId);
      if (res.success) {
        setScripts((prev) => prev.filter((s) => s.id !== scriptId));
        return true;
      }
      setError(res.error || 'Failed to delete script');
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { script, scripts, loading, error, save, remove, refresh };
}
