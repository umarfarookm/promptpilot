'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PlaybackView } from '@/components/terminal/PlaybackView';
import { fetchRecording } from '@/lib/api';
import type { RecordingData } from '@promptpilot/types';

export default function PlaybackPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const recordingId = searchParams.get('recording');

  const [recording, setRecording] = useState<RecordingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordingId) {
      setError('No recording ID specified. Add ?recording=<id> to the URL.');
      setLoading(false);
      return;
    }

    fetchRecording(recordingId)
      .then((res) => {
        if (res.success && res.data) {
          const data = res.data as { recordingData: RecordingData };
          setRecording(data.recordingData);
        } else {
          setError(res.error || 'Failed to load recording');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load recording');
      })
      .finally(() => setLoading(false));
  }, [recordingId]);

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

  if (!recording) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-gray-400">Recording not found</p>
      </div>
    );
  }

  return <PlaybackView recording={recording} />;
}
