import { supabase } from '../supabaseClient';
import { auditLog } from '../utils/auditLogger';

export function useDataPrivacy({ user, showToast }) {
  const handleExportData = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      'Are you sure you want to download a full export of your saved projects and chat history?'
    );
    if (!confirmed) return;

    showToast('Preparing your data export...', 'info');
    try {
      const [projectsRes, chatsRes] = await Promise.all([
        supabase.from('user_projects').select('*'),
        supabase.from('chat_sessions').select('*'),
      ]);

      const exportObj = {
        export_date: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
        },
        projects: projectsRes.data || [],
        chat_history: chatsRes.data || [],
      };

      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codex_data_export_${user.email.replace('@', '_at_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      auditLog('data_export', user.id, {});
      showToast('Data export downloaded successfully.', 'success');
    } catch {
      showToast('Failed to export data.', 'error');
    }
  };

  return { handleExportData };
}
