import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { auditLog } from '../utils/auditLogger';
import { projectsApi } from '../utils/apiClient';

export function useCloud({
  user,
  files,
  primaryLanguage,
  selectedLanguage,
  showToast,
  setShowSqlGuide,
}) {
  const [cloudFiles, setCloudFiles] = useState([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [activeCloudFileId, setActiveCloudFileId] = useState(null);
  const [cloudSaveName, setCloudSaveName] = useState('');

  const fetchCloudFiles = useCallback(async () => {
    if (!supabase || !user) return;
    setCloudLoading(true);
    try {
      // Use secure backend API instead of direct Supabase access
      const projects = await projectsApi.getAll();
      setCloudFiles(projects);
    } catch (err) {
      console.error('Fetch error:', err);
      // Fallback to direct Supabase for backward compatibility
      try {
        const { data, error } = await supabase
          .from('user_projects')
          .select('*')
          .order('updated_at', { ascending: false });
        if (error) {
          if (error.code === '42P01' || error.message.includes('relation')) {
            setShowSqlGuide(true);
          }
        } else if (data) {
          setCloudFiles(data);
        }
      } catch (fallbackErr) {
        console.error('Fallback fetch error:', fallbackErr);
      }
    } finally {
      setCloudLoading(false);
    }
  }, [user, setShowSqlGuide]);

  const handleSaveToCloud = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      showToast('You must be logged in to save projects.', 'error');
      return;
    }
    const nameToSave = cloudSaveName.trim();
    if (!nameToSave) {
      showToast('Please enter a valid file name.', 'error');
      return;
    }

    setCloudLoading(true);
    try {
      const payload = {
        name: nameToSave,
        content: JSON.stringify(files),
        language: primaryLanguage || selectedLanguage,
      };

      if (activeCloudFileId) {
        // Update existing project via secure backend API
        await projectsApi.update(activeCloudFileId, payload);
        auditLog('update_project', user.id, {
          name: nameToSave,
          language: primaryLanguage || selectedLanguage,
        });
      } else {
        // Create new project via secure backend API
        const savedProject = await projectsApi.create(payload);
        if (savedProject && savedProject.id) {
          setActiveCloudFileId(savedProject.id);
        }
        auditLog('save_project', user.id, {
          name: nameToSave,
          language: primaryLanguage || selectedLanguage,
        });
      }

      showToast('Workspace successfully saved to cloud!', 'success');
      setCloudSaveName('');
      fetchCloudFiles();
    } catch (err) {
      console.error('Cloud save error:', err);
      showToast(err.message || 'Error syncing with cloud database.', 'error');
    } finally {
      setCloudLoading(false);
    }
  };

  const handleDeleteCloudFile = async (fileId) => {
    if (!user) return;
    setCloudLoading(true);
    try {
      // Use secure backend API with ownership verification
      await projectsApi.delete(fileId);

      auditLog('delete_project', user.id, { project_id: fileId });
      showToast('Project deleted successfully from cloud.', 'success');

      if (activeCloudFileId === fileId) {
        setActiveCloudFileId(null);
        setCloudSaveName('');
      }
      fetchCloudFiles();
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Error deleting project.', 'error');
    } finally {
      setCloudLoading(false);
    }
  };

  return {
    cloudFiles,
    cloudLoading,
    activeCloudFileId,
    setActiveCloudFileId,
    cloudSaveName,
    setCloudSaveName,
    fetchCloudFiles,
    handleSaveToCloud,
    handleDeleteCloudFile,
  };
}
