"use strict";
/**
 * NotebookLM API HTTP controller
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotebook = createNotebook;
exports.addNote = addNote;
exports.askAI = askAI;
const notebookService = __importStar(require("../services/notebook.service"));
async function createNotebook(req, res) {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ ok: false, error: 'Unauthorized' });
        return;
    }
    const result = await notebookService.createNotebookForUser(userId);
    if (!result.ok) {
        res.status(400).json(result);
        return;
    }
    res.json({ ok: true, notebookId: result.notebookId });
}
async function addNote(req, res) {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ ok: false, error: 'Unauthorized' });
        return;
    }
    const { content, sourceName } = req.body || {};
    if (!content || typeof content !== 'string') {
        res.status(400).json({ ok: false, error: 'content required' });
        return;
    }
    const result = await notebookService.addNoteToNotebook(userId, content, sourceName);
    if (!result.ok) {
        res.status(400).json(result);
        return;
    }
    res.json({ ok: true, sourceId: result.sourceId });
}
async function askAI(req, res) {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ ok: false, error: 'Unauthorized' });
        return;
    }
    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
        res.status(400).json({ ok: false, error: 'question required' });
        return;
    }
    const result = await notebookService.askAI(userId, question);
    if (!result.ok) {
        res.status(400).json(result);
        return;
    }
    res.json({ ok: true, answer: result.answer });
}
