'use client';

import { Header } from '@/components/layout/Header';
import { ScriptEditor } from '@/components/editor/ScriptEditor';

export default function NewScriptPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-white">Create New Script</h1>
        <ScriptEditor mode="create" />
      </main>
    </div>
  );
}
