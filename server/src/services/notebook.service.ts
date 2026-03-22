/**
 * NotebookLM business logic service
 */

import { createClient } from '@supabase/supabase-js';
import { NotebookLMClient } from '../client/notebooklm.client';
import { GeminiClient } from '../client/gemini.client';
import { config, hasNotebookLMConfig, hasGeminiConfig } from '../config';

const supabase = config.supabase.url && config.supabase.serviceRoleKey
  ? createClient(config.supabase.url, config.supabase.serviceRoleKey)
  : null;

async function getNotebookLMToken(): Promise<string> {
  const token = process.env.NOTEBOOKLM_ACCESS_TOKEN;
  if (token) return token;
  // TODO: Use google-auth-library with GOOGLE_APPLICATION_CREDENTIALS for production
  throw new Error('NOTEBOOKLM_ACCESS_TOKEN or service account required');
}

let notebookClient: NotebookLMClient | null = null;
let geminiClient: GeminiClient | null = null;

function getNotebookClient(): NotebookLMClient {
  if (!notebookClient) {
    notebookClient = new NotebookLMClient({
      projectNumber: config.notebooklm.projectNumber,
      location: config.notebooklm.location,
      baseUrl: config.notebooklm.baseUrl,
      getToken: getNotebookLMToken,
    });
  }
  return notebookClient;
}

function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    geminiClient = new GeminiClient({ apiKey: config.gemini.apiKey });
  }
  return geminiClient;
}

export type CreateNotebookResult = {
  ok: boolean;
  notebookId?: string;
  error?: string;
};

export type AddNoteResult = {
  ok: boolean;
  sourceId?: string;
  error?: string;
};

export type AskAIResult = {
  ok: boolean;
  answer?: string;
  error?: string;
};

export async function createNotebookForUser(userId: string): Promise<CreateNotebookResult> {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  try {
    const { data: existing } = await supabase
      .from('user_notebooks')
      .select('notebook_id')
      .eq('user_id', userId)
      .single();

    if (existing?.notebook_id) {
      return { ok: true, notebookId: existing.notebook_id };
    }

    if (hasNotebookLMConfig()) {
      const client = getNotebookClient();
      const result = await client.createNotebook('Bilge Baykuş Not Defteri');
      await supabase.from('user_notebooks').upsert(
        {
          user_id: userId,
          notebook_id: result.notebookId,
          notebook_name: result.name,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      return { ok: true, notebookId: result.notebookId };
    }

    // Fallback: local notebook
    const localId = `local-${userId}`;
    await supabase.from('user_notebooks').upsert(
      {
        user_id: userId,
        notebook_id: localId,
        notebook_name: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    return { ok: true, notebookId: localId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export async function addNoteToNotebook(
  userId: string,
  content: string,
  sourceName?: string
): Promise<AddNoteResult> {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const name = sourceName || `Not ${new Date().toLocaleString('tr-TR')}`;

  try {
    let notebookId: string;

    if (hasNotebookLMConfig()) {
      const { data: row } = await supabase
        .from('user_notebooks')
        .select('notebook_id')
        .eq('user_id', userId)
        .single();

      if (!row?.notebook_id) {
        const created = await createNotebookForUser(userId);
        if (!created.ok || !created.notebookId) return { ok: false, error: created.error };
      }

      const { data: notebook } = await supabase
        .from('user_notebooks')
        .select('notebook_id')
        .eq('user_id', userId)
        .single();

      if (!notebook?.notebook_id) return { ok: false, error: 'Notebook not found' };
      notebookId = notebook.notebook_id;

      const client = getNotebookClient();
      const result = await client.addTextSource(notebookId, name, content);
      const sourceId = result.sources?.[0]?.sourceId || `src-${Date.now()}`;

      await supabase.from('user_notebook_notes').insert({
        user_id: userId,
        notebook_id: notebookId,
        source_id: sourceId,
        content,
        source_name: name,
      });
      return { ok: true, sourceId };
    }

    // Fallback: store locally when NotebookLM not configured (for ask-ai with Gemini)
    notebookId = `local-${userId}`;
    const sourceId = `src-${Date.now()}`;
    await supabase.from('user_notebook_notes').insert({
      user_id: userId,
      notebook_id: notebookId,
      source_id: sourceId,
      content,
      source_name: name,
    });
    return { ok: true, sourceId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export async function askAI(userId: string, question: string): Promise<AskAIResult> {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  try {
    const { data: notes } = await supabase
      .from('user_notebook_notes')
      .select('content, source_name')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    const context = (notes || [])
      .map((n) => `### ${n.source_name}\n${n.content}`)
      .join('\n\n');

    if (hasGeminiConfig() && context) {
      const client = getGeminiClient();
      const answer = await client.generateWithContext(context, question);
      return { ok: true, answer };
    }

    if (!context) {
      return {
        ok: true,
        answer: 'Henüz not eklemediniz. Önce "Not Ekle" ile notlarınızı ekleyin, sonra sorularınızı sorabilirsiniz.',
      };
    }

    return { ok: false, error: 'GEMINI_API_KEY yapılandırılmadı' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export async function getOrCreateNotebookId(userId: string): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('user_notebooks')
    .select('notebook_id')
    .eq('user_id', userId)
    .single();
  if (data?.notebook_id) return data.notebook_id;
  const created = await createNotebookForUser(userId);
  return created.notebookId || null;
}
