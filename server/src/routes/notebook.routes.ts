/**
 * NotebookLM API routes
 */

import { Router } from 'express';
import * as controller from '../controllers/notebook.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/create-notebook', authMiddleware, controller.createNotebook);
router.post('/add-note', authMiddleware, controller.addNote);
router.post('/ask-ai', authMiddleware, controller.askAI);

export default router;
