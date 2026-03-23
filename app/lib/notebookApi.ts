/**
 * NotebookLM backend API client
 * Endpoints: create-notebook, add-note, ask-ai
 */

const getBaseUrl = (): string => {
  return process.env.EXPO_PUBLIC_NOTEBOOK_API_URL || '';
};

export const hasNotebookApi = (): boolean => !!getBaseUrl();

async function fetchApi<T>(
  path: string,
  method: 'POST',
  body: unknown,
  token: string
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const base = getBaseUrl();
  if (!base) return { ok: false, error: 'Notebook API not configured' };
  try {
    const res = await fetch(`${base}/api/notebook${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string } & T;
    if (!res.ok) return { ok: false, error: data.error || `HTTP ${res.status}` };
    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export async function createNotebook(token: string): Promise<{ ok: boolean; notebookId?: string; error?: string }> {
  return fetchApi<{ notebookId?: string }>('/create-notebook', 'POST', {}, token);
}

export async function addNote(
  token: string,
  content: string,
  sourceName?: string
): Promise<{ ok: boolean; sourceId?: string; error?: string }> {
  return fetchApi<{ sourceId?: string }>('/add-note', 'POST', { content, sourceName }, token);
}

export async function askAI(
  token: string,
  question: string
): Promise<{ ok: boolean; answer?: string; error?: string }> {
  return fetchApi<{ answer?: string }>('/ask-ai', 'POST', { question }, token);
}
