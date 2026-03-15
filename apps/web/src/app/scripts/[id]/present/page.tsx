'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { TeleprompterView } from '@/components/teleprompter/TeleprompterView';
import { DemoLayout } from '@/components/terminal/DemoLayout';
import { useScript } from '@/hooks/useScript';

export default function PresentPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { script, loading, error, refresh } = useScript(params.id);
  const isDemoMode = searchParams.get('mode') === 'demo';

  useEffect(() => {
    if (params.id) {
      refresh();
    }
  }, [params.id, refresh]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-pp-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-6 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-gray-400">Script not found</p>
      </div>
    );
  }

  if (isDemoMode) {
    return (
      <DemoLayout
        blocks={script.blocks}
        scriptId={script.id}
        scriptTitle={script.title}
      />
    );
  }

  return <TeleprompterView blocks={script.blocks} scriptId={script.id} />;
}
