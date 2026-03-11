'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Script, ScriptBlock, CreateScriptRequest } from '@promptpilot/types';
import { useScript } from '@/hooks/useScript';
import { BlockRenderer } from '@/components/teleprompter/BlockRenderer';
import { EditorToolbar } from './EditorToolbar';

interface ScriptEditorProps {
  mode: 'create' | 'edit';
  initialScript?: Script;
}

/**
 * Simple parser that converts raw text into ScriptBlock[].
 * Format:
 *   [SAY] text...
 *   [ACTION] text...
 *   [COMMAND] text...
 *   Plain text becomes TEXT blocks
 */
function parseScript(rawContent: string): ScriptBlock[] {
  const lines = rawContent.split('\n');
  const blocks: ScriptBlock[] = [];
  let currentType: ScriptBlock['type'] = 'TEXT';
  let currentContent: string[] = [];
  let order = 0;

  const flush = () => {
    const content = currentContent.join('\n').trim();
    if (content) {
      blocks.push({
        id: `block-${order}`,
        type: currentType,
        content,
        order,
      });
      order++;
    }
    currentContent = [];
  };

  for (const line of lines) {
    const tagMatch = line.match(/^\[(SAY|ACTION|COMMAND|TEXT)\]\s*(.*)/i);
    if (tagMatch) {
      flush();
      currentType = tagMatch[1].toUpperCase() as ScriptBlock['type'];
      if (tagMatch[2].trim()) {
        currentContent.push(tagMatch[2].trim());
      }
    } else {
      currentContent.push(line);
    }
  }
  flush();

  return blocks;
}

export function ScriptEditor({ mode, initialScript }: ScriptEditorProps) {
  const router = useRouter();
  const { save, loading } = useScript();

  const [title, setTitle] = useState(initialScript?.title || '');
  const [description, setDescription] = useState(initialScript?.description || '');
  const [rawContent, setRawContent] = useState(initialScript?.rawContent || '');

  const previewBlocks = useMemo(() => parseScript(rawContent), [rawContent]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    const data: CreateScriptRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      rawContent,
    };

    const result = await save(data, mode === 'edit' ? initialScript?.id : undefined);
    if (result) {
      router.push(`/scripts/${result.id}`);
    }
  }, [title, description, rawContent, save, mode, initialScript?.id, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleImport = useCallback((content: string) => {
    setRawContent(content);
  }, []);

  const handleExport = useCallback(() => {
    const blob = new Blob([rawContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'script'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rawContent, title]);

  return (
    <div className="space-y-4">
      {/* Title and description */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Script title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-pp-dark-900 px-4 py-3 text-lg font-semibold text-white placeholder-gray-500 focus:border-pp-primary-500 focus:outline-none focus:ring-1 focus:ring-pp-primary-500"
        />
        <input
          type="text"
          placeholder="Description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-pp-dark-900 px-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:border-pp-primary-500 focus:outline-none focus:ring-1 focus:ring-pp-primary-500"
        />
      </div>

      {/* Toolbar */}
      <EditorToolbar onImport={handleImport} onExport={handleExport} />

      {/* Split pane: editor + preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: raw editor */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-400">
            Script Content
          </label>
          <textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder={`[SAY] Welcome to the show!\n[ACTION] Wave to camera\n[COMMAND] Start intro music\n\nPlain text becomes a TEXT block.`}
            className="min-h-[500px] flex-1 resize-y rounded-lg border border-gray-700 bg-pp-dark-900 px-4 py-3 font-mono text-sm leading-relaxed text-gray-200 placeholder-gray-600 focus:border-pp-primary-500 focus:outline-none focus:ring-1 focus:ring-pp-primary-500"
          />
        </div>

        {/* Right: live preview */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-400">
            Live Preview
          </label>
          <div className="min-h-[500px] flex-1 overflow-y-auto rounded-lg border border-gray-700 bg-black p-6">
            {previewBlocks.length === 0 ? (
              <p className="text-center text-gray-600">
                Start typing to see a preview...
              </p>
            ) : (
              <div className="space-y-4">
                {previewBlocks.map((block) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    fontSize={20}
                    lineSpacing={1.6}
                    isActive={false}
                    highlightCurrent={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 border-t border-gray-800 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || !title.trim()}
          className="inline-flex items-center rounded-lg bg-pp-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pp-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Script' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
