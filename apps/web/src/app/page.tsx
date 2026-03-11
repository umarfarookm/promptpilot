'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { ScriptCard } from '@/components/common/ScriptCard';
import { useScript } from '@/hooks/useScript';

export default function DashboardPage() {
  const { scripts, loading, error, refresh } = useScript();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-gray-400">
              Manage your teleprompter scripts
            </p>
          </div>
          <Link
            href="/scripts/new"
            className="inline-flex items-center rounded-lg bg-pp-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pp-primary-700"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Script
          </Link>
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

        {!loading && !error && scripts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 py-20">
            <svg
              className="mb-4 h-12 w-12 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <p className="mb-2 text-lg font-medium text-gray-400">
              No scripts yet
            </p>
            <p className="mb-6 text-sm text-gray-500">
              Create your first teleprompter script to get started
            </p>
            <Link
              href="/scripts/new"
              className="inline-flex items-center rounded-lg bg-pp-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pp-primary-700"
            >
              Create Script
            </Link>
          </div>
        )}

        {!loading && scripts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scripts.map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
