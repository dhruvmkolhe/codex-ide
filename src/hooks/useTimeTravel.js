import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useTimeTravel = ({
  user,
  files,
  setFiles,
  activeFileIndex,
  setActiveFileIndex,
  setCode,
  showToast,
}) => {
  const [snapshots, setSnapshots] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch history for the current user
  const fetchSnapshots = useCallback(async () => {
    if (!user) return;
    setIsLoadingSnapshots(true);
    try {
      const { data, error } = await supabase
        .from('workspace_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSnapshots(data || []);
    } catch (err) {
      console.error('Failed to fetch snapshots:', err.message);
    } finally {
      setIsLoadingSnapshots(false);
    }
  }, [user]);

  // Capture current state as a snapshot
  const captureSnapshot = useCallback(
    async (tag = 'autosave') => {
      if (!user || !files || files.length === 0) return;

      // Only capture if there's meaningful content
      const totalContent = files.reduce((acc, f) => acc + (f.content || ''), '');
      if (totalContent.length < 10) return;

      setIsCapturing(true);
      try {
        const { error } = await supabase.from('workspace_snapshots').insert([
          {
            user_id: user.id,
            files: files,
            tag: tag,
          },
        ]);

        if (error) throw error;

        // Refresh list
        fetchSnapshots();
        if (tag === 'manual') showToast('Snapshot captured successfully', 'success');
      } catch (err) {
        console.error('Capture failed:', err.message);
        if (tag === 'manual') showToast('Failed to capture snapshot', 'error');
      } finally {
        setIsCapturing(false);
      }
    },
    [user, files, fetchSnapshots, showToast]
  );

  // Restore to a specific snapshot
  const restoreSnapshot = useCallback(
    (snapshot) => {
      if (!snapshot || !snapshot.files) return;

      setFiles(snapshot.files);
      setPreviewMode(false);

      // Set code to the content of the currently active file in the snapshot
      const newActiveIndex = snapshot.activeFileIndex || 0;
      setActiveFileIndex(newActiveIndex);
      if (snapshot.files[newActiveIndex]) {
        setCode(snapshot.files[newActiveIndex].content);
      }

      showToast(
        `Restored to snapshot from ${new Date(snapshot.created_at).toLocaleString()}`,
        'success'
      );
    },
    [setFiles, setActiveFileIndex, setCode, showToast]
  );

  // Peek/Preview a snapshot without permanent restoration
  const peekSnapshot = useCallback((snapshot) => {
    if (!snapshot || !snapshot.files) return;
    setPreviewMode(true);
    // Logic for preview could involve a temporary state or high-level overlay
  }, []);

  // Periodic autosave (e.g., every 5 minutes if changes occurred)
  useEffect(() => {
    const timer = setInterval(() => {
      captureSnapshot('autosave');
    }, 300000); // 5 minutes

    return () => clearInterval(timer);
  }, [captureSnapshot]);

  useEffect(() => {
    if (user) fetchSnapshots();
  }, [user, fetchSnapshots]);

  return {
    snapshots,
    isCapturing,
    isLoadingSnapshots,
    previewMode,
    setPreviewMode,
    captureSnapshot,
    fetchSnapshots,
    restoreSnapshot,
    peekSnapshot,
  };
};
