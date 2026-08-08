import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export const useCollaboration = ({
  roomId,
  activeFileIndex,
  setCode,
  setFiles,
  setSelectedLanguage,
  setPrimaryLanguage,
  setActiveFileIndex,
  showToast,
  myCollaboratorId,
  myColor,
  myName,
  latestStateRef,
  isRemoteChangeRef,
}) => {
  const [collabActive, setCollabActive] = useState(false);
  const [showCollabMenu, setShowCollabMenu] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [collaborators, setCollaborators] = useState([]);
  const channelRef = useRef(null);

  const broadcastFileOperation = useCallback(
    (updatedFiles, newActiveIndex) => {
      if (!channelRef.current || !collabActive) return;
      channelRef.current.send({
        type: 'broadcast',
        event: 'file-operation',
        payload: {
          files: updatedFiles,
          activeFileIndex: newActiveIndex,
          senderId: myCollaboratorId,
        },
      });
    },
    [collabActive, myCollaboratorId]
  );

  const broadcastCodeChange = useCallback(
    (newCode) => {
      if (!channelRef.current || !collabActive) return;
      channelRef.current.send({
        type: 'broadcast',
        event: 'code-change',
        payload: {
          fileIndex: activeFileIndex,
          code: newCode,
          senderId: myCollaboratorId,
        },
      });
    },
    [collabActive, activeFileIndex, myCollaboratorId]
  );

  const handleEditorUpdate = useCallback(
    (viewUpdate) => {
      if (!channelRef.current || !collabActive) return;
      if (viewUpdate.selectionSet || viewUpdate.docChanged) {
        const pos = viewUpdate.state.selection.main.head;
        channelRef.current.send({
          type: 'broadcast',
          event: 'cursor-move',
          payload: {
            senderId: myCollaboratorId,
            name: myName,
            color: myColor,
            fileIndex: activeFileIndex,
            pos: pos,
          },
        });
      }
    },
    [collabActive, activeFileIndex, myCollaboratorId, myName, myColor]
  );

  useEffect(() => {
    if (!supabase || !roomId || !collabActive) {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      setCollaborators([]);
      return;
    }

    // Sanitize room ID to prevent channel injection attacks
    const safeRoomId = String(roomId).replace(/[^a-zA-Z0-9_-]/g, '');
    const channelName = `room_${safeRoomId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state)
          .flat()
          .map((u) => ({
            senderId: u.senderId,
            name: u.name,
            color: u.color,
            isMe: u.senderId === myCollaboratorId,
          }));
        setCollaborators(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUsers = newPresences.map((p) => p.name).join(', ');
        if (newUsers) showToast(`${newUsers} joined the session`, 'info');
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setRemoteCursors((prev) => {
          const next = { ...prev };
          leftPresences.forEach((p) => {
            if (p.senderId) {
              delete next[p.senderId];
            }
          });
          return next;
        });
      })
      .on('broadcast', { event: 'code-change' }, ({ payload }) => {
        if (payload.senderId === myCollaboratorId) return;

        setFiles((prev) => {
          const updated = [...prev];
          if (updated[payload.fileIndex]) {
            updated[payload.fileIndex] = {
              ...updated[payload.fileIndex],
              content: payload.code,
            };
          }
          return updated;
        });

        if (payload.fileIndex === latestStateRef.current.activeFileIndex) {
          isRemoteChangeRef.current = true;
          setCode(payload.code);
        }
      })
      .on('broadcast', { event: 'file-operation' }, ({ payload }) => {
        if (payload.senderId === myCollaboratorId) return;

        setFiles(payload.files);

        // Only jump if a new file was created or a file was deleted
        const prevCount = latestStateRef.current.files.length;
        if (payload.files.length !== prevCount) {
          setActiveFileIndex(payload.activeFileIndex);
          if (payload.files[payload.activeFileIndex]) {
            isRemoteChangeRef.current = true;
            setCode(payload.files[payload.activeFileIndex].content);
          }
        }
      })
      .on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
        if (payload.senderId === myCollaboratorId) return;
        setRemoteCursors((prev) => ({
          ...prev,
          [payload.senderId]: {
            name: payload.name,
            color: payload.color,
            fileIndex: payload.fileIndex,
            pos: payload.pos,
            timestamp: Date.now(),
          },
        }));
      })
      .on('broadcast', { event: 'request-init-state' }, ({ payload }) => {
        if (payload.requesterId === myCollaboratorId) return;
        channel.send({
          type: 'broadcast',
          event: 'respond-init-state',
          payload: {
            targetId: payload.requesterId,
            files: latestStateRef.current.files,
            selectedLanguage: latestStateRef.current.selectedLanguage,
            activeFileIndex: latestStateRef.current.activeFileIndex,
          },
        });
      })
      .on('broadcast', { event: 'respond-init-state' }, ({ payload }) => {
        if (payload.targetId !== myCollaboratorId) return;

        setFiles(payload.files);
        setSelectedLanguage(payload.selectedLanguage);
        setPrimaryLanguage(payload.selectedLanguage);
        setActiveFileIndex(payload.activeFileIndex);
        if (payload.files[payload.activeFileIndex]) {
          isRemoteChangeRef.current = true;
          setCode(payload.files[payload.activeFileIndex].content);
        }
      });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.track({
          senderId: myCollaboratorId,
          name: myName,
          color: myColor,
          joinedAt: Date.now(),
        });
        channel.send({
          type: 'broadcast',
          event: 'request-init-state',
          payload: {
            requesterId: myCollaboratorId,
          },
        });
      }
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
      channelRef.current = null;
    };
  }, [
    roomId,
    collabActive,
    myCollaboratorId,
    myName,
    myColor,
    setCode,
    setFiles,
    setSelectedLanguage,
    setPrimaryLanguage,
    setActiveFileIndex,
    latestStateRef,
    isRemoteChangeRef,
    showToast,
  ]);

  return {
    collabActive,
    setCollabActive,
    showCollabMenu,
    setShowCollabMenu,
    remoteCursors,
    setRemoteCursors,
    collaborators,
    broadcastFileOperation,
    broadcastCodeChange,
    handleEditorUpdate,
  };
};
