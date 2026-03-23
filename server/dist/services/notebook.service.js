"use strict";
/**
 * NotebookLM business logic service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotebookForUser = createNotebookForUser;
exports.addNoteToNotebook = addNoteToNotebook;
exports.askAI = askAI;
exports.getOrCreateNotebookId = getOrCreateNotebookId;
const supabase_js_1 = require("@supabase/supabase-js");
const notebooklm_client_1 = require("../client/notebooklm.client");
const gemini_client_1 = require("../client/gemini.client");
const config_1 = require("../config");
const supabase = config_1.config.supabase.url && config_1.config.supabase.serviceRoleKey
    ? (0, supabase_js_1.createClient)(config_1.config.supabase.url, config_1.config.supabase.serviceRoleKey)
    : null;
async function getNotebookLMToken() {
    const token = process.env.NOTEBOOKLM_ACCESS_TOKEN;
    if (token)
        return token;
    // TODO: Use google-auth-library with GOOGLE_APPLICATION_CREDENTIALS for production
    throw new Error('NOTEBOOKLM_ACCESS_TOKEN or service account required');
}
let notebookClient = null;
let geminiClient = null;
function getNotebookClient() {
    if (!notebookClient) {
        notebookClient = new notebooklm_client_1.NotebookLMClient({
            projectNumber: config_1.config.notebooklm.projectNumber,
            location: config_1.config.notebooklm.location,
            baseUrl: config_1.config.notebooklm.baseUrl,
            getToken: getNotebookLMToken,
        });
    }
    return notebookClient;
}
function getGeminiClient() {
    if (!geminiClient) {
        geminiClient = new gemini_client_1.GeminiClient({ apiKey: config_1.config.gemini.apiKey });
    }
    return geminiClient;
}
async function createNotebookForUser(userId) {
    if (!supabase)
        return { ok: false, error: 'Supabase not configured' };
    try {
        const { data: existing } = await supabase
            .from('user_notebooks')
            .select('notebook_id')
            .eq('user_id', userId)
            .single();
        if (existing?.notebook_id) {
            return { ok: true, notebookId: existing.notebook_id };
        }
        if ((0, config_1.hasNotebookLMConfig)()) {
            const client = getNotebookClient();
            const result = await client.createNotebook('Bilge Baykuş Not Defteri');
            await supabase.from('user_notebooks').upsert({
                user_id: userId,
                notebook_id: result.notebookId,
                notebook_name: result.name,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
            return { ok: true, notebookId: result.notebookId };
        }
        // Fallback: local notebook
        const localId = `local-${userId}`;
        await supabase.from('user_notebooks').upsert({
            user_id: userId,
            notebook_id: localId,
            notebook_name: null,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        return { ok: true, notebookId: localId };
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { ok: false, error: msg };
    }
}
async function addNoteToNotebook(userId, content, sourceName) {
    if (!supabase)
        return { ok: false, error: 'Supabase not configured' };
    const name = sourceName || `Not ${new Date().toLocaleString('tr-TR')}`;
    try {
        let notebookId;
        if ((0, config_1.hasNotebookLMConfig)()) {
            const { data: row } = await supabase
                .from('user_notebooks')
                .select('notebook_id')
                .eq('user_id', userId)
                .single();
            if (!row?.notebook_id) {
                const created = await createNotebookForUser(userId);
                if (!created.ok || !created.notebookId)
                    return { ok: false, error: created.error };
            }
            const { data: notebook } = await supabase
                .from('user_notebooks')
                .select('notebook_id')
                .eq('user_id', userId)
                .single();
            if (!notebook?.notebook_id)
                return { ok: false, error: 'Notebook not found' };
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
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { ok: false, error: msg };
    }
}
async function askAI(userId, question) {
    if (!supabase)
        return { ok: false, error: 'Supabase not configured' };
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
        if ((0, config_1.hasGeminiConfig)() && context) {
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
    }
    catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { ok: false, error: msg };
    }
}
async function getOrCreateNotebookId(userId) {
    if (!supabase)
        return null;
    const { data } = await supabase
        .from('user_notebooks')
        .select('notebook_id')
        .eq('user_id', userId)
        .single();
    if (data?.notebook_id)
        return data.notebook_id;
    const created = await createNotebookForUser(userId);
    return created.notebookId || null;
}
