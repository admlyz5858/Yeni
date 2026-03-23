"use strict";
/**
 * Supabase JWT auth middleware
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("../config");
const supabase = config_1.config.supabase.url && config_1.config.supabase.serviceRoleKey
    ? (0, supabase_js_1.createClient)(config_1.config.supabase.url, config_1.config.supabase.serviceRoleKey)
    : null;
async function authMiddleware(req, res, next) {
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
    }
    catch {
        res.status(401).json({ ok: false, error: 'Auth failed' });
    }
}
