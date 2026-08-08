-- =============================================================
-- Migration: User Preferences Sync
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  settings    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own preferences
DROP POLICY IF EXISTS "Manage own preferences" ON user_preferences;
CREATE POLICY "Manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Commentary:
-- This table stores global user settings like:
-- - isExplorerOpen
-- - activeTheme
-- - fontSize
-- - tabSize
-- - currentModel
-- etc.
