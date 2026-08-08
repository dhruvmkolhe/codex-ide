-- =============================================================
-- CodeX IDE — Supabase Database Setup & Security Configuration
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. USER PROJECTS TABLE (with RLS)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_projects (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  language    TEXT        NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manage own projects" ON user_projects;
CREATE POLICY "Manage own projects" ON user_projects
  FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 2. CHAT SESSIONS TABLE (with RLS)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  messages    TEXT        NOT NULL,
  language    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manage own sessions" ON chat_sessions;
CREATE POLICY "Manage own sessions" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 3. AUDIT LOG TABLE
-- Records sensitive user actions (login, logout, save, delete)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,   -- e.g. 'login', 'logout', 'save_project'
  metadata    JSONB,                  -- optional context (file name, language, etc.)
  ip_hint     TEXT,                   -- client-reported, not trusted for security
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can insert their own log rows; only admins can read all
DROP POLICY IF EXISTS "Insert own audit rows" ON audit_log;
CREATE POLICY "Insert own audit rows" ON audit_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read only their own audit rows
DROP POLICY IF EXISTS "Read own audit rows" ON audit_log;
CREATE POLICY "Read own audit rows" ON audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 4. DATABASE AUDIT TRIGGERS
-- Automatically logs changes even if client-side logging is bypassed
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION log_audit_event() 
RETURNS TRIGGER AS $$
DECLARE
  new_data JSONB := to_jsonb(NEW);
BEGIN
  INSERT INTO audit_log (user_id, action, metadata)
  VALUES (
    COALESCE(auth.uid(), (new_data->>'user_id')::UUID), 
    TG_OP || '_' || TG_TABLE_NAME, 
    jsonb_build_object(
      'id', NEW.id, 
      'name', COALESCE(new_data->>'name', new_data->>'title', 'unknown')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_projects_trigger ON user_projects;
CREATE TRIGGER audit_projects_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_projects
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_sessions_trigger ON chat_sessions;
CREATE TRIGGER audit_sessions_trigger
AFTER INSERT OR UPDATE OR DELETE ON chat_sessions
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ─────────────────────────────────────────────────────────────
-- 5. INDEXES (performance)
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id  ON user_projects (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id  ON chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id      ON audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at   ON audit_log (created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 6. SHARED WORKSPACES TABLE
-- Publicly accessible table for storing custom shareable code link snapshots
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shared_workspaces (
  id          TEXT        PRIMARY KEY, -- Custom ID e.g., 'project-alpha-1234'
  payload     JSONB       NOT NULL,    -- { files: [...], selectedLanguage: 'javascript' }
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and add public read/insert policies
ALTER TABLE shared_workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON shared_workspaces;
CREATE POLICY "Allow public read" ON shared_workspaces
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON shared_workspaces;
CREATE POLICY "Allow authenticated insert" ON shared_workspaces
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND length(payload::text) < 100000);

-- ─────────────────────────────────────────────────────────────
-- 7. DATA RETENTION POLICY (CLEANUP)
-- Function to delete old shared workspaces (e.g., older than 30 days)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cleanup_old_shared_workspaces()
RETURNS void AS $$
BEGIN
  DELETE FROM shared_workspaces WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To automate this, you would typically use pg_cron extension:
-- SELECT cron.schedule('cleanup_workspaces', '0 0 * * *', $$SELECT cleanup_old_shared_workspaces()$$);
