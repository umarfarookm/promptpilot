'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ScriptEditor } from '@/components/editor/ScriptEditor';
import { useScript } from '@/hooks/useScript';

export default function EditScriptPage() {
  const params = useParams<{ id: string }>();
  const { script, loading, error, refresh } = useScript(params.id);

  useEffect(() => {
    if (params.id) {
      refresh();
    }
  }, [params.id, refresh]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-pp-primary-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
            {error}
          </div>
        )}

        {!loading && script && (
          <>
            <h1 className="mb-6 text-2xl font-bold text-white">Edit Script</h1>
            <ScriptEditor mode="edit" initialScript={script} />
          </>
        )}
      </main>
    </div>
  );
}
