import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useAudit({ user }) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    if (!supabase || !user) return;
    setAuditLogsLoading((status) => (!auditLogs.length ? true : status));
    try {
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setAuditLogs(data);
    } catch {
      // ignore
    } finally {
      setAuditLogsLoading(false);
    }
  }, [user, auditLogs.length]);

  useEffect(() => {
    if (user) fetchAuditLogs();
    else setAuditLogs([]);
  }, [user, fetchAuditLogs]);

  return { auditLogs, auditLogsLoading, fetchAuditLogs };
}
