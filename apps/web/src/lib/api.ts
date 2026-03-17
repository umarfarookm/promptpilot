import type {
  Script,
  ApiResponse,
  CreateScriptRequest,
  UpdateScriptRequest,
  AiStatusResponse,
  AiRequest,
  AiStreamEvent,
  ScriptTemplate,
  TimingEstimate,
  TimingRequest,
  SessionAnalytics,
  ScriptAnalytics,
} from '@promptpilot/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return {
      success: false,
      error: body?.error || body?.message || `Request failed with status ${res.status}`,
    };
  }

  const body = await res.json();
  return body as ApiResponse<T>;
}

export async function fetchScripts(): Promise<ApiResponse<Script[]>> {
  return request<Script[]>('/api/scripts');
}

export async function fetchScript(id: string): Promise<ApiResponse<Script>> {
  return request<Script>(`/api/scripts/${id}`);
}

export async function createScript(
  data: CreateScriptRequest,
): Promise<ApiResponse<Script>> {
  return request<Script>('/api/scripts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateScript(
  id: string,
  data: UpdateScriptRequest,
): Promise<ApiResponse<Script>> {
  return request<Script>(`/api/scripts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteScript(id: string): Promise<ApiResponse<void>> {
  return request<void>(`/api/scripts/${id}`, {
    method: 'DELETE',
  });
}

export async function exportScript(id: string): Promise<ApiResponse<Script>> {
  return request<Script>(`/api/scripts/${id}/export`);
}

// ---------------------------------------------------------------------------
// AI endpoints
// ---------------------------------------------------------------------------

export async function fetchAiStatus(): Promise<ApiResponse<AiStatusResponse>> {
  return request<AiStatusResponse>('/api/ai/status');
}

export async function fetchTemplates(): Promise<ApiResponse<ScriptTemplate[]>> {
  return request<ScriptTemplate[]>('/api/templates');
}

export async function requestTiming(
  data: TimingRequest,
): Promise<ApiResponse<TimingEstimate>> {
  return request<TimingEstimate>('/api/scripts/timing', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Recording endpoints
// ---------------------------------------------------------------------------

export async function fetchRecordings(
  scriptId: string,
): Promise<ApiResponse<Array<{ id: string; scriptId: string; title: string; durationMs: number; createdAt: string }>>> {
  return request(`/api/scripts/${scriptId}/recordings`);
}

export async function fetchRecording(id: string): Promise<ApiResponse<unknown>> {
  return request(`/api/recordings/${id}`);
}

export async function deleteRecording(id: string): Promise<ApiResponse<void>> {
  return request<void>(`/api/recordings/${id}`, { method: 'DELETE' });
}

export function getRecordingDownloadUrl(id: string): string {
  return `${API_URL}/api/recordings/${id}/download`;
}

// ---------------------------------------------------------------------------
// Analytics endpoints
// ---------------------------------------------------------------------------

export async function fetchRecordingAnalytics(
  id: string,
): Promise<ApiResponse<SessionAnalytics>> {
  return request<SessionAnalytics>(`/api/recordings/${id}/analytics`);
}

export async function fetchScriptAnalytics(
  scriptId: string,
): Promise<ApiResponse<ScriptAnalytics>> {
  return request<ScriptAnalytics>(`/api/scripts/${scriptId}/analytics`);
}

/**
 * Stream an AI request via SSE.
 * Returns an AbortController so the caller can cancel mid-stream.
 */
export function streamAiRequest(
  endpoint: string,
  body: AiRequest,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        onError(text || `Request failed with status ${res.status}`);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        onError('No response body');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const event: AiStreamEvent = JSON.parse(trimmed.slice(6));
            if (event.type === 'chunk' && event.content) {
              onChunk(event.content);
            } else if (event.type === 'done') {
              onDone();
              return;
            } else if (event.type === 'error') {
              onError(event.error ?? 'Unknown error');
              return;
            }
          } catch {
            // Skip malformed events
          }
        }
      }

      onDone();
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      onError((err as Error).message ?? 'Stream failed');
    }
  })();

  return controller;
}
