/**
 * Supabase JWT auth middleware
 */

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

const supabase = config.supabase.url && config.supabase.serviceRoleKey
  ? createClient(config.supabase.url, config.supabase.serviceRoleKey)
  : null;

export type AuthRequest = Request & { userId?: string };

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ ok: false, error: 'Bearer token required' });
    return;
  }
  const token = auth.slice(7);
  if (!token) {
    res.status(401).json({ ok: false, error: 'Invalid token' });
    return;
  }
  if (!supabase) {
    res.status(503).json({ ok: false, error: 'Auth not configured' });
    return;
  }
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user?.id) {
      res.status(401).json({ ok: false, error: error?.message || 'Invalid token' });
      return;
    }
    req.userId = user.id;
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'Auth failed' });
  }
}
