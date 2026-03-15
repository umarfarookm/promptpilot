'use client';

import { useState } from 'react';
import type {
  AiRewriteRequest,
  ScriptTone,
  AudienceLevel,
  ScriptLength,
} from '@promptpilot/types';

interface AiRewriteFormProps {
  rawContent: string;
  generating: boolean;
  onRewrite: (req: AiRewriteRequest) => void;
}

const TONES: { value: ScriptTone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'educational', label: 'Educational' },
];

const AUDIENCES: { value: AudienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' },
];

const LENGTHS: { value: ScriptLength; label: string }[] = [
  { value: 'short', label: '~2 min' },
  { value: 'medium', label: '~5 min' },
  { value: 'long', label: '~15 min' },
];

function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T | undefined) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(value === opt.value ? undefined : opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value === opt.value
                ? 'bg-pp-primary-600 text-white'
                : 'border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AiRewriteForm({ rawContent, generating, onRewrite }: AiRewriteFormProps) {
  const [tone, setTone] = useState<ScriptTone | undefined>();
  const [audienceLevel, setAudienceLevel] = useState<AudienceLevel | undefined>();
  const [targetLength, setTargetLength] = useState<ScriptLength | undefined>();
  const [instructions, setInstructions] = useState('');

  const handleSubmit = () => {
    if (!rawContent.trim()) return;
    onRewrite({
      action: 'rewrite',
      rawContent,
      tone,
      audienceLevel,
      targetLength,
      instructions: instructions.trim() || undefined,
    });
  };

  return (
    <div className="space-y-3">
      {!rawContent.trim() && (
        <p className="rounded-lg border border-yellow-800/50 bg-yellow-900/20 px-3 py-2 text-xs text-yellow-400">
          Write some script content first, then use Rewrite to improve it.
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          Instructions (optional)
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. Make it more conversational, add humor..."
          rows={2}
          className="w-full resize-y rounded-lg border border-gray-700 bg-pp-dark-950 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-pp-primary-500 focus:outline-none"
        />
      </div>

      <PillGroup label="Tone" options={TONES} value={tone} onChange={setTone} />
      <PillGroup label="Audience" options={AUDIENCES} value={audienceLevel} onChange={setAudienceLevel} />
      <PillGroup label="Length" options={LENGTHS} value={targetLength} onChange={setTargetLength} />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={generating || !rawContent.trim()}
        className="w-full rounded-lg bg-pp-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pp-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generating ? 'Rewriting...' : 'Rewrite Script'}
      </button>
    </div>
  );
}
