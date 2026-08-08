import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function usePreferences({ user }) {
  const [preferences, setPreferences] = useState({});
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!supabase || !user) return;
    setPreferencesLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('settings')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
      } else if (data) {
        setPreferences(data.settings);
      }
    } catch (err) {
      console.error('Fetch preferences error:', err);
    } finally {
      setPreferencesLoading(false);
    }
  }, [user]);

  const updatePreferences = useCallback(
    async (newSettings) => {
      if (!supabase || !user) return;
      try {
        const updatedSettings = { ...preferences, ...newSettings };
        const { error } = await supabase.from('user_preferences').upsert({
          user_id: user.id,
          settings: updatedSettings,
          updated_at: new Date(),
        });
        if (error) {
          console.error('Error updating preferences:', error);
        } else {
          setPreferences(updatedSettings);
        }
      } catch (err) {
        console.error('Update preferences error:', err);
      }
    },
    [user, preferences]
  );

  useEffect(() => {
    if (user) fetchPreferences();
    else setPreferences({});
  }, [user, fetchPreferences]);

  return { preferences, preferencesLoading, fetchPreferences, updatePreferences };
}
