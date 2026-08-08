/**
 * Workspace Snapshots & User Preferences Supabase Service
 * Handles user settings sync and time-travel history checkpoints.
 */

import { supabase } from '../supabaseClient';

/**
 * Save user preferences to Supabase user_preferences table
 */
export const saveUserPreferences = async (userId, settings) => {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase.from('user_preferences').upsert({
      user_id: userId,
      settings,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('saveUserPreferences error:', err.message);
    return null;
  }
};

/**
 * Fetch user preferences from Supabase
 */
export const getUserPreferences = async (userId) => {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('settings')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data?.settings || null;
  } catch (err) {
    console.warn('getUserPreferences error:', err.message);
    return null;
  }
};

/**
 * Create a new workspace snapshot (Checkpoint / Autosave)
 */
export const createWorkspaceSnapshot = async (
  userId,
  files,
  tag = 'autosave',
  projectId = null
) => {
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('workspace_snapshots')
      .insert({
        user_id: userId,
        project_id: projectId,
        files,
        tag,
        created_at: new Date().toISOString(),
      })
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.warn('createWorkspaceSnapshot error:', err.message);
    return null;
  }
};

/**
 * Get snapshot history list for time-travel restoration
 */
export const getWorkspaceSnapshots = async (userId, limit = 20) => {
  if (!supabase || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('workspace_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('getWorkspaceSnapshots error:', err.message);
    return [];
  }
};
