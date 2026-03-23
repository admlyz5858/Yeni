"use strict";
/**
 * NotebookLM Enterprise API client
 * https://cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotebookLMClient = void 0;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
    const { token, ...fetchOpts } = options;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...fetchOpts.headers,
    };
    let lastError = null;
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, { ...fetchOpts, headers });
            if (res.status === 429 || res.status >= 500) {
                lastError = new Error(`HTTP ${res.status}: ${await res.text()}`);
                if (i < retries - 1)
                    await sleep(RETRY_DELAY_MS * (i + 1));
                continue;
            }
            return res;
        }
        catch (e) {
            lastError = e instanceof Error ? e : new Error(String(e));
            if (i < retries - 1)
                await sleep(RETRY_DELAY_MS * (i + 1));
        }
    }
    throw lastError || new Error('Request failed');
}
class NotebookLMClient {
    constructor(cfg) {
        this.baseUrl = cfg.baseUrl.replace(/\/$/, '');
        this.parent = `projects/${cfg.projectNumber}/locations/${cfg.location}`;
        this.getToken = cfg.getToken;
    }
    get notebooksUrl() {
        return `${this.baseUrl}/${this.parent}/notebooks`;
    }
    async request(url, method, body) {
        const token = await this.getToken();
        const res = await fetchWithRetry(url, {
            method,
            token,
            body: body ? JSON.stringify(body) : undefined,
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) {
            const err = new Error(data?.error?.message || text);
            err.status = res.status;
            throw err;
        }
        return { data, status: res.status };
    }
    async createNotebook(title) {
        const { data } = await this.request(this.notebooksUrl, 'POST', { title: title || 'Bilge Baykuş Not Defteri' });
        if (!data.notebookId)
            throw new Error('No notebookId in response');
        return {
            notebookId: data.notebookId,
            name: data.name || '',
            title: data.title || title,
        };
    }
    async addTextSource(notebookId, sourceName, content) {
        const url = `${this.notebooksUrl}/${notebookId}/sources:batchCreate`;
        const { data } = await this.request(url, 'POST', {
            userContents: [
                {
                    textContent: {
                        sourceName: sourceName || 'Not',
                        content: content || '',
                    },
                },
            ],
        });
        const sources = (data.sources || []).map((s) => ({
            sourceId: s.sourceId?.id || '',
            name: s.name || '',
            title: s.title || sourceName,
        }));
        return { sources };
    }
    async getNotebook(notebookId) {
        const url = `${this.notebooksUrl}/${notebookId}`;
        const { data } = await this.request(url, 'GET');
        return {
            notebookId: data.notebookId || notebookId,
            title: data.title || '',
            name: data.name || '',
        };
    }
}
exports.NotebookLMClient = NotebookLMClient;
