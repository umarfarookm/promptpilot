'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useAnalytics } from '@/hooks/useAnalytics';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { BlockTimingChart } from '@/components/analytics/BlockTimingChart';
import { CommandResultsTable } from '@/components/analytics/CommandResultsTable';
import { SessionHistory } from '@/components/analytics/SessionHistory';

export default function AnalyticsPage() {
  const params = useParams<{ id: string }>();
  const { analytics, loading, error } = useAnalytics(params.id);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href={`/scripts/${params.id}`}
              className="text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              &larr; Back to script
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-white">
              Presentation Analytics
            </h1>
          </div>
        </div>

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

        {!loading && analytics && (
          <div className="space-y-6">
            <SummaryCards analytics={analytics} />

            {analytics.latest && (
              <>
                <BlockTimingChart blockTimings={analytics.latest.blockTimings} />
                <CommandResultsTable commandStats={analytics.latest.commandStats} />
              </>
            )}

            <SessionHistory scriptId={params.id} sessions={analytics.sessions} />
          </div>
        )}
      </main>
    </div>
  );
}
