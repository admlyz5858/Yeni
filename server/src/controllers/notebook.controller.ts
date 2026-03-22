/**
 * NotebookLM API HTTP controller
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as notebookService from '../services/notebook.service';

export async function createNotebook(req: AuthRequest, res: Response): Promise<void> {
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

export async function addNote(req: AuthRequest, res: Response): Promise<void> {
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

export async function askAI(req: AuthRequest, res: Response): Promise<void> {
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
