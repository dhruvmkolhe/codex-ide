/**
 * auditLogger.js
 * Lightweight client-side audit logger that writes sensitive actions
 * to the Supabase `audit_log` table (requires table + RLS from supabase_setup.sql).
 *
 * Fails silently — never blocks the UI on a logging error.
 */
import { supabase } from '../supabaseClient';

/**
 * Log a sensitive action to the audit_log table.
 *
 * @param {string} action   - Action name, e.g. 'login', 'logout', 'save_project'
 * @param {string} userId   - The authenticated user's UUID
 * @param {object} metadata - Optional extra context (file name, language, etc.)
 */
export async function auditLog(action, userId, metadata = {}) {
  if (!supabase || !userId) return;
  try {
    const enrichedMetadata = {
      ...metadata,
      userAgent: window.navigator?.userAgent || 'Unknown',
      timestamp: new Date().toISOString(),
      origin: window.location?.origin || '',
    };

    await supabase.from('audit_log').insert([
      {
        user_id: userId,
        action,
        metadata: enrichedMetadata,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch {
    // Intentionally silent — audit failure must never disrupt the user
  }
}
