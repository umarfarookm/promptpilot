import type {
  Script,
  ApiResponse,
  CreateScriptRequest,
  UpdateScriptRequest,
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
