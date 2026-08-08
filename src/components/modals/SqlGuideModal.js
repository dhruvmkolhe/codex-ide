import React from 'react';
import { XIcon } from '../Icons';

export function SqlGuideModal({ showSqlGuide, setShowSqlGuide }) {
  if (!showSqlGuide) return null;

  return (
    <div className="auth-modal-overlay" onClick={() => setShowSqlGuide(false)}>
      <div className="auth-modal sql-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>Setup Supabase Table</h2>
          <button className="auth-modal-close" onClick={() => setShowSqlGuide(false)}>
            <XIcon />
          </button>
        </div>
        <div className="auth-modal-body">
          <p>
            To support workspace cloud saves and past conversations, you need to create the
            <code>user_projects</code> and <code>chat_sessions</code> tables in your Supabase
            dashboard.
          </p>
          <pre className="sql-script-pre">
            {`-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manage own projects" ON user_projects;
CREATE POLICY "Manage own projects" ON user_projects
  FOR ALL USING (auth.uid() = user_id);

-- 2. Create Chat History Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  messages TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manage own chat sessions" ON chat_sessions;
CREATE POLICY "Manage own chat sessions" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);`}
          </pre>
          <button className="sql-guide-close-btn" onClick={() => setShowSqlGuide(false)}>
            I Have Done This!
          </button>
        </div>
      </div>
    </div>
  );
}
