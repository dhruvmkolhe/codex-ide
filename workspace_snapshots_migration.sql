-- =============================================================
-- Migration: Workspace Snapshots (Time Travel)
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS workspace_snapshots (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id  UUID,       -- Optional: link to a specific project
  files       JSONB       NOT NULL,
  tag         TEXT        DEFAULT 'autosave', -- 'manual', 'autosave', 'recovery'
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE workspace_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own snapshots
DROP POLICY IF EXISTS "Manage own snapshots" ON workspace_snapshots;
CREATE POLICY "Manage own snapshots" ON workspace_snapshots
  FOR ALL USING (auth.uid() = user_id);

-- Performance Index
CREATE INDEX IF NOT EXISTS idx_workspace_snapshots_user_id ON workspace_snapshots (user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_snapshots_created_at ON workspace_snapshots (created_at DESC);
