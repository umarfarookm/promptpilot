'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@promptpilot/ui';
import type { ScriptTemplate } from '@promptpilot/types';
import { fetchTemplates } from '@/lib/api';

interface TemplatePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (skeleton: string) => void;
}

export function TemplatePickerModal({
  open,
  onClose,
  onSelect,
}: TemplatePickerModalProps) {
  const [templates, setTemplates] = useState<ScriptTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchTemplates().then((res) => {
      if (res.success && res.data) {
        setTemplates(res.data);
      }
      setLoading(false);
    });
  }, [open]);

  const handleSelect = (template: ScriptTemplate) => {
    onSelect(template.skeleton);
    onClose();
  };

  return (
    <Modal open={open} title="Choose a Template" onClose={onClose}>
      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Loading templates...</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t)}
              className="rounded-lg border border-gray-700 bg-pp-dark-950 p-4 text-left transition-colors hover:border-pp-primary-500 hover:bg-pp-dark-900"
            >
              <h3 className="mb-1 text-sm font-semibold text-white">{t.name}</h3>
              <p className="text-xs text-gray-400">{t.description}</p>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
