'use client';

import { useState, useRef, useEffect } from 'react';
import type { UseAiAssistantReturn } from '@/hooks/useAiAssistant';
import { AiGenerateForm } from './AiGenerateForm';
import { AiRewriteForm } from './AiRewriteForm';
import { AiReviewPanel } from './AiReviewPanel';

type Tab = 'generate' | 'rewrite' | 'review';

interface AiPanelProps {
  ai: UseAiAssistantReturn;
  rawContent: string;
  onApply: (content: string) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'generate', label: 'Generate' },
  { id: 'rewrite', label: 'Rewrite' },
  { id: 'review', label: 'Review' },
];

const PROVIDER_LABELS: Record<string, string> = {
  ollama: 'Ollama',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
};

export function AiPanel({ ai, rawContent, onApply }: AiPanelProps) {
  const [tab, setTab] = useState<Tab>('generate');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [ai.generatedContent]);

  const providerName = ai.status
    ? PROVIDER_LABELS[ai.status.provider] ?? ai.status.provider
    : 'AI';

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
          {ai.status?.available === true && (
            <span
              className="inline-block h-2 w-2 rounded-full bg-green-500"
              title={`${providerName} connected (${ai.status.model})`}
            />
          )}
          {ai.status?.available === false && (
            <span
              className="inline-block h-2 w-2 rounded-full bg-red-500"
              title={`${providerName} not connected`}
            />
          )}
          {ai.status && (
            <span className="text-[10px] text-gray-500">
              {providerName}
            </span>
          )}
        </div>
      </div>

      {/* Provider warning */}
      {ai.status?.available === false && (
        <div className="border-b border-red-800/50 bg-red-900/20 px-4 py-2 text-xs text-red-400">
          {ai.status.provider === 'ollama' ? (
            <>
              Ollama is not running. Start it with{' '}
              <code className="rounded bg-gray-800 px-1">ollama serve</code> and pull a model:{' '}
              <code className="rounded bg-gray-800 px-1">ollama pull llama3.2</code>
            </>
          ) : (
            <>
              {providerName} is not reachable. Check your{' '}
              <code className="rounded bg-gray-800 px-1">AI_API_KEY</code> and{' '}
              <code className="rounded bg-gray-800 px-1">AI_PROVIDER</code> in{' '}
              <code className="rounded bg-gray-800 px-1">.env</code>
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); ai.reset(); }}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              tab === t.id
                ? 'border-b-2 border-pp-primary-500 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'generate' && (
          <AiGenerateForm
            generating={ai.generating}
            onGenerate={ai.generate}
          />
        )}
        {tab === 'rewrite' && (
          <AiRewriteForm
            rawContent={rawContent}
            generating={ai.generating}
            onRewrite={ai.rewrite}
          />
        )}
        {tab === 'review' && (
          <AiReviewPanel
            rawContent={rawContent}
            generating={ai.generating}
            onTransitions={ai.suggestTransitions}
            onGrammar={ai.reviewGrammar}
          />
        )}
      </div>

      {/* Output area */}
      {(ai.generatedContent || ai.generating || ai.error) && (
        <div className="border-t border-gray-800">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium text-gray-400">
              {ai.generating ? 'Generating...' : 'Output'}
            </span>
            <div className="flex gap-2">
              {ai.generating && (
                <button
                  type="button"
                  onClick={ai.cancel}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Cancel
                </button>
              )}
              {ai.generatedContent && !ai.generating && (
                <button
                  type="button"
                  onClick={() => onApply(ai.generatedContent)}
                  className="rounded bg-pp-primary-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-pp-primary-700"
                >
                  Apply to Editor
                </button>
              )}
            </div>
          </div>

          <div
            ref={outputRef}
            className="max-h-60 overflow-y-auto border-t border-gray-800/50 bg-black px-4 py-3 font-mono text-xs leading-relaxed text-gray-300"
          >
            {ai.error ? (
              <p className="text-red-400">{ai.error}</p>
            ) : (
              <pre className="whitespace-pre-wrap">{ai.generatedContent || ' '}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
