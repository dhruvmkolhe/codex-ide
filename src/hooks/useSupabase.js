import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';
import { useCloud } from './useCloud';
import { useAIChat } from './useAIChat';
import { useMfa } from './useMfa';
import { usePreferences } from './usePreferences';
import { useAudit } from './useAudit';
import { useDataPrivacy } from './useDataPrivacy';

/**
 * Composite hook that orchestrates specialized hooks for Supabase functionality.
 * Maintains compatibility with existing App.js usage while enabling modular logic.
 */
export function useSupabase({
  files,
  selectedLanguage,
  primaryLanguage,
  showToast,
  setShowAuthModal,
}) {
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  // 1. Auth Hook
  const auth = useAuth({ showToast, setShowAuthModal });
  const { user } = auth;

  // 2. Cloud Hook
  const cloud = useCloud({
    user,
    files,
    primaryLanguage,
    selectedLanguage,
    showToast,
    setShowSqlGuide,
  });

  // 3. AI Chat Hook
  const chat = useAIChat({ user, selectedLanguage, showToast, setShowSqlGuide });

  // 4. MFA Hook
  const mfa = useMfa({ user, showToast });

  // 5. Preferences Hook
  const prefs = usePreferences({ user });

  // 6. Audit Hook
  const audit = useAudit({ user });

  // 7. Data Privacy Hook
  const privacy = useDataPrivacy({ user, showToast });

  return {
    supabase,
    ...auth,
    ...cloud,
    ...chat,
    ...mfa,
    ...prefs,
    ...audit,
    ...privacy,
    showSqlGuide,
    setShowSqlGuide,
  };
}
