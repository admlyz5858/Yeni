"use strict";
/**
 * Gemini API client for AI queries with notebook context
 * Used when NotebookLM doesn't expose a query API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiClient = void 0;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
class GeminiClient {
    constructor(cfg) {
        this.apiKey = cfg.apiKey;
    }
    async generateWithContext(context, question) {
        const prompt = `Aşağıdaki not defteri içeriği bağlamında soruyu yanıtla. Sadece verilen bağlama dayanarak cevap ver.

## Not Defteri İçeriği
${context}

## Kullanıcı Sorusu
${question}

## Yanıt (Türkçe):`;
        const res = await fetch(`${GEMINI_URL}?key=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            }),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Gemini API error: ${res.status} ${err}`);
        }
        const data = (await res.json());
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || 'Yanıt oluşturulamadı.';
    }
}
exports.GeminiClient = GeminiClient;
