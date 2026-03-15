'use client';

import { useState } from 'react';
import type {
  AiGenerateRequest,
  ScriptTone,
  AudienceLevel,
  ScriptLength,
  TemplateId,
} from '@promptpilot/types';

interface AiGenerateFormProps {
  generating: boolean;
  onGenerate: (req: AiGenerateRequest) => void;
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

const TEMPLATES: { value: TemplateId; label: string }[] = [
  { value: 'keynote', label: 'Keynote' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'product-demo', label: 'Product Demo' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'workshop', label: 'Workshop' },
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

export function AiGenerateForm({ generating, onGenerate }: AiGenerateFormProps) {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState('');
  const [tone, setTone] = useState<ScriptTone | undefined>();
  const [audienceLevel, setAudienceLevel] = useState<AudienceLevel | undefined>();
  const [targetLength, setTargetLength] = useState<ScriptLength | undefined>('medium');
  const [template, setTemplate] = useState<TemplateId | undefined>();

  const handleSubmit = () => {
    if (!topic.trim()) return;
    onGenerate({
      action: 'generate',
      topic: topic.trim(),
      outline: outline.trim() || undefined,
      template,
      tone,
      audienceLevel,
      targetLength,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          Topic *
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Introduction to Docker containers"
          className="w-full rounded-lg border border-gray-700 bg-pp-dark-950 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-pp-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          Outline (optional)
        </label>
        <textarea
          value={outline}
          onChange={(e) => setOutline(e.target.value)}
          placeholder="Paste bullet points or a rough outline..."
          rows={3}
          className="w-full resize-y rounded-lg border border-gray-700 bg-pp-dark-950 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-pp-primary-500 focus:outline-none"
        />
      </div>

      <PillGroup label="Template" options={TEMPLATES} value={template} onChange={setTemplate} />
      <PillGroup label="Tone" options={TONES} value={tone} onChange={setTone} />
      <PillGroup label="Audience" options={AUDIENCES} value={audienceLevel} onChange={setAudienceLevel} />
      <PillGroup label="Length" options={LENGTHS} value={targetLength} onChange={setTargetLength} />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={generating || !topic.trim()}
        className="w-full rounded-lg bg-pp-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pp-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generating ? 'Generating...' : 'Generate Script'}
      </button>
    </div>
  );
}
