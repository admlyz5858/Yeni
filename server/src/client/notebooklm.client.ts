/**
 * NotebookLM Enterprise API client
 * https://cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks
 */

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export type NotebookLMConfig = {
  projectNumber: string;
  location: string;
  baseUrl: string;
  getToken: () => Promise<string>;
};

export type CreateNotebookResponse = {
  notebookId: string;
  name: string;
  title: string;
};

export type AddSourceResponse = {
  sources: Array<{
    sourceId: string;
    name: string;
    title: string;
  }>;
};

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit & { token: string },
  retries = MAX_RETRIES
): Promise<Response> {
  const { token, ...fetchOpts } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(fetchOpts.headers as Record<string, string>),
  };
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...fetchOpts, headers });
      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`HTTP ${res.status}: ${await res.text()}`);
        if (i < retries - 1) await sleep(RETRY_DELAY_MS * (i + 1));
        continue;
      }
      return res;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (i < retries - 1) await sleep(RETRY_DELAY_MS * (i + 1));
    }
  }
  throw lastError || new Error('Request failed');
}

export class NotebookLMClient {
  private readonly parent: string;
  private readonly baseUrl: string;
  private readonly getToken: () => Promise<string>;

  constructor(cfg: NotebookLMConfig) {
    this.baseUrl = cfg.baseUrl.replace(/\/$/, '');
    this.parent = `projects/${cfg.projectNumber}/locations/${cfg.location}`;
    this.getToken = cfg.getToken;
  }

  private get notebooksUrl(): string {
    return `${this.baseUrl}/${this.parent}/notebooks`;
  }

  private async request<T>(
    url: string,
    method: string,
    body?: unknown
  ): Promise<{ data: T; status: number }> {
    const token = await this.getToken();
    const res = await fetchWithRetry(url, {
      method,
      token,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const data = text ? (JSON.parse(text) as T) : ({} as T);
    if (!res.ok) {
      const err = new Error((data as { error?: { message?: string } })?.error?.message || text);
      (err as Error & { status?: number }).status = res.status;
      throw err;
    }
    return { data, status: res.status };
  }

  async createNotebook(title: string): Promise<CreateNotebookResponse> {
    const { data } = await this.request<{ notebookId?: string; name?: string; title?: string }>(
      this.notebooksUrl,
      'POST',
      { title: title || 'Bilge Baykuş Not Defteri' }
    );
    if (!data.notebookId) throw new Error('No notebookId in response');
    return {
      notebookId: data.notebookId,
      name: data.name || '',
      title: data.title || title,
    };
  }

  async addTextSource(notebookId: string, sourceName: string, content: string): Promise<AddSourceResponse> {
    const url = `${this.notebooksUrl}/${notebookId}/sources:batchCreate`;
    const { data } = await this.request<{ sources?: Array<{ sourceId?: { id?: string }; title?: string; name?: string }> }>(
      url,
      'POST',
      {
        userContents: [
          {
            textContent: {
              sourceName: sourceName || 'Not',
              content: content || '',
            },
          },
        ],
      }
    );
    const sources = (data.sources || []).map((s) => ({
      sourceId: s.sourceId?.id || '',
      name: s.name || '',
      title: s.title || sourceName,
    }));
    return { sources };
  }

  async getNotebook(notebookId: string): Promise<{ notebookId: string; title: string; name: string }> {
    const url = `${this.notebooksUrl}/${notebookId}`;
    const { data } = await this.request<{ notebookId?: string; title?: string; name?: string }>(url, 'GET');
    return {
      notebookId: data.notebookId || notebookId,
      title: data.title || '',
      name: data.name || '',
    };
  }
}
