import React, { useEffect, useRef, useState } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { XIcon, ShareIcon, MultiplayerIcon, EditIcon } from '../Icons';
import { supabase } from '../../supabaseClient';

const COLOR_PALETTE = [
  '#388bfd',
  '#2ea043',
  '#f78166',
  '#a371f7',
  '#f0883e',
  '#79c0ff',
  '#56d364',
  '#e36049',
];

const getRandomColor = (id) => {
  if (!id) return COLOR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
};

export function WhiteboardModal({
  isOpen,
  onClose,
  roomId: propRoomId,
  showToast,
  user: propUser,
}) {
  const [roomId] = useState(() => {
    if (propRoomId) return propRoomId;
    const pathParts = window.location.pathname.split('/whiteboard/');
    if (pathParts[1]) return pathParts[1];
    return 'room_' + Math.random().toString(36).substring(2, 9);
  });

  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const editorRef = useRef(null);
  const storeRef = useRef(null);
  const isRemoteUpdateRef = useRef(false);
  const channelRef = useRef(null);

  if (!storeRef.current) {
    storeRef.current = createTLStore({ shapeUtils: defaultShapeUtils });
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load or generate user profile info
  useEffect(() => {
    const initUser = async () => {
      let activeUser = propUser;
      if (!activeUser && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          activeUser = data?.session?.user;
        } catch (e) {
          /* ignore */
        }
      }

      let name = '';
      let id = '';
      let hasCustomName = false;

      if (activeUser) {
        id = activeUser.id || activeUser.email;
        name = activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'Coder';
        hasCustomName = true;
      } else {
        id =
          sessionStorage.getItem('codex_wb_guest_id') ||
          'guest_' + Math.random().toString(36).substring(2, 8);
        sessionStorage.setItem('codex_wb_guest_id', id);
        const storedName = sessionStorage.getItem('codex_wb_guest_name');
        if (storedName) {
          name = storedName;
          hasCustomName = true;
        } else {
          name = 'Guest_' + id.substring(6, 10);
        }
      }

      const color = getRandomColor(id);
      const profile = { id, name, color };
      setUserInfo(profile);
      setNameInput(name);

      // Prompt guest if they don't have a custom saved name yet
      if (!activeUser && !hasCustomName && isOpen) {
        setShowNamePrompt(true);
      }
    };

    if (isOpen) {
      initUser();
    }
  }, [propUser, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Sync URL without reload if opening standalone
    const currentPath = window.location.pathname;
    const targetPath = `/whiteboard/${roomId}`;
    if (currentPath !== targetPath && !currentPath.startsWith('/ide')) {
      window.history.replaceState(null, '', targetPath);
    }
  }, [isOpen, roomId]);

  useEffect(() => {
    if (!isOpen || !supabase || !userInfo) return;

    const channelName = `whiteboard_${roomId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state)
          .flat()
          .map((u) => ({
            id: u.id || u.user,
            name: u.name || u.user || 'Collaborator',
            color: u.color || '#388bfd',
          }));
        const uniqueUsers = Array.from(new Map(users.map((u) => [u.id, u])).values());
        setActiveCollaborators(uniqueUsers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const joinedNames = newPresences
          .map((p) => p.name || p.user)
          .filter(Boolean)
          .join(', ');
        if (joinedNames && showToast) {
          showToast(`${joinedNames} joined the whiteboard`, 'info');
        }
      })
      .on('broadcast', { event: 'board-changes' }, ({ payload }) => {
        if (!editorRef.current || !payload || !payload.changes) return;
        try {
          isRemoteUpdateRef.current = true;
          editorRef.current.store.mergeRemoteChanges(() => {
            const { added, updated, removed } = payload.changes;
            if (added) {
              Object.values(added).forEach((record) => editorRef.current.store.put([record]));
            }
            if (updated) {
              Object.values(updated).forEach(([_, to]) => editorRef.current.store.put([to]));
            }
            if (removed) {
              Object.values(removed).forEach((record) =>
                editorRef.current.store.remove([record.id])
              );
            }
          });
        } catch (e) {
          console.error('Remote sync error:', e);
        } finally {
          isRemoteUpdateRef.current = false;
        }
      })
      .on('broadcast', { event: 'request-board-state' }, () => {
        if (!editorRef.current || !channelRef.current) return;
        const allRecords = editorRef.current.store.allRecords();
        if (allRecords.length > 5) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'full-board-state',
            payload: { records: allRecords },
          });
        }
      })
      .on('broadcast', { event: 'full-board-state' }, ({ payload }) => {
        if (!editorRef.current || !payload || !payload.records) return;
        try {
          isRemoteUpdateRef.current = true;
          editorRef.current.store.mergeRemoteChanges(() => {
            editorRef.current.store.put(payload.records);
          });
        } catch (e) {
          console.error('Full board sync error:', e);
        } finally {
          isRemoteUpdateRef.current = false;
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.track({
            id: userInfo.id,
            name: userInfo.name,
            color: userInfo.color,
            onlineAt: new Date().toISOString(),
          });

          channel.send({
            type: 'broadcast',
            event: 'request-board-state',
          });
        }
      });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
      channelRef.current = null;
    };
  }, [isOpen, roomId, userInfo, showToast]);

  const handleMount = (editor) => {
    editorRef.current = editor;

    if (userInfo) {
      try {
        editor.user.updateUserPreferences({
          name: userInfo.name,
          color: userInfo.color,
        });
      } catch (err) {
        /* fallback */
      }
    }

    // Listen to local store changes and broadcast them (Throttled)
    let pendingChanges = { added: {}, updated: {}, removed: {} };
    let syncTimeout = null;

    editor.store.listen(
      (entry) => {
        if (isRemoteUpdateRef.current || !channelRef.current) return;
        const { changes } = entry;

        Object.assign(pendingChanges.added, changes.added);
        Object.assign(pendingChanges.updated, changes.updated);
        Object.assign(pendingChanges.removed, changes.removed);

        if (!syncTimeout) {
          syncTimeout = setTimeout(() => {
            if (
              Object.keys(pendingChanges.added).length > 0 ||
              Object.keys(pendingChanges.updated).length > 0 ||
              Object.keys(pendingChanges.removed).length > 0
            ) {
              // TEST LOG
              console.log(
                'Broadcasting changes:',
                Object.keys(pendingChanges.added).length,
                'added',
                Object.keys(pendingChanges.updated).length,
                'updated'
              );

              channelRef.current.send({
                type: 'broadcast',
                event: 'board-changes',
                payload: { changes: pendingChanges },
              });
            }
            pendingChanges = { added: {}, updated: {}, removed: {} };
            syncTimeout = null;
          }, 80); // Batch changes every 80ms
        }
      },
      { scope: 'all' }
    );

    // TEST FAKE CURSOR v2: Strict schema compliant
    setInterval(() => {
      if (editorRef.current && isRemoteUpdateRef) {
        const fakeId = 'instance_presence:fake-peer-999';
        const fakeRecord = {
          typeName: 'instance_presence',
          id: fakeId,
          userId: 'fake_user_id',
          userName: 'Mr. Robot (Fake)',
          color: '#388bfd',
          lastActivityTimestamp: Date.now(),
          currentPageId: editorRef.current.getCurrentPageId(),
          cursor: {
            x: 400 + Math.sin(Date.now() / 400) * 150,
            y: 400 + Math.cos(Date.now() / 400) * 150,
            type: 'default',
            rotation: 0,
          },
          selection: [],
          screencast: { type: 'pointer', state: 'idle' },
          followingUserId: null,
          camera: { x: 0, y: 0, z: 1 },
        };
        try {
          isRemoteUpdateRef.current = true;
          editorRef.current.store.mergeRemoteChanges(() => {
            editorRef.current.store.put([fakeRecord]);
          });
        } catch (e) {
          console.error('Test fake cursor error:', e);
        } finally {
          isRemoteUpdateRef.current = false;
        }
      }
    }, 100);
  };

  const handleUpdateName = (newName) => {
    const trimmed = newName.trim();
    if (!trimmed || !userInfo) return;

    sessionStorage.setItem('codex_wb_guest_name', trimmed);
    const updated = { ...userInfo, name: trimmed };
    setUserInfo(updated);
    setShowNamePrompt(false);
    setIsEditingName(false);

    if (editorRef.current) {
      try {
        editorRef.current.user.updateUserPreferences({
          name: trimmed,
          color: userInfo.color,
        });
      } catch (e) {
        /* fallback */
      }
    }

    if (channelRef.current) {
      channelRef.current.track({
        id: userInfo.id,
        name: trimmed,
        color: userInfo.color,
        onlineAt: new Date().toISOString(),
      });
    }

    if (showToast) showToast(`Display name updated to "${trimmed}"`, 'success');
  };

  const handleShareRoom = () => {
    const shareUrl = `${window.location.origin}/whiteboard/${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    if (showToast) showToast('Whiteboard collaboration link copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!isOpen) return null;

  const totalCollaborators = activeCollaborators.length || 1;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0d1117',
        zIndex: 100000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Prompt modal for first-time guests joining via link */}
      {showNamePrompt && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(13, 17, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 200000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#161b22',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '28px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              textAlign: 'center',
              color: '#e6edf3',
            }}
          >
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
              <MultiplayerIcon />
            </div>
            <h2
              style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#58a6ff' }}
            >
              Join Whiteboard Session
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: '#8b949e',
                marginBottom: '20px',
                lineHeight: '1.5',
              }}
            >
              Enter your display name to join room <strong>{roomId}</strong>. No sign-in or email
              required!
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateName(nameInput);
              }}
            >
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name (e.g. Alex)"
                autoFocus
                maxLength={24}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: '#0d1117',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#238636',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Join Board
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div
        style={{
          height: isMobile ? 'auto' : '50px',
          backgroundColor: '#161b22',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '10px 14px' : '0 20px',
          gap: isMobile ? '8px' : '0',
          color: '#e6edf3',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontSize: isMobile ? '15px' : '18px',
              fontWeight: '700',
              color: '#a5d6ff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <MultiplayerIcon /> {isMobile ? 'Whiteboard' : 'Collaborative Whiteboard'}
          </span>
          <span
            style={{
              fontSize: '10px',
              background: 'rgba(56, 139, 253, 0.15)',
              border: '1px solid rgba(56, 139, 253, 0.4)',
              padding: '2px 8px',
              borderRadius: '12px',
              color: '#58a6ff',
              fontWeight: '600',
            }}
          >
            Room: {roomId}
          </span>
          {!isMobile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '4px 12px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <MultiplayerIcon />
              <span style={{ fontSize: '12px', color: '#8b949e', fontWeight: '600' }}>
                {totalCollaborators} Live {totalCollaborators === 1 ? 'User' : 'Users'}:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
                {activeCollaborators.length > 0 ? (
                  activeCollaborators.map((u, i) => (
                    <span
                      key={u.id || i}
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: u.color || '#a5d6ff',
                        background: 'rgba(255, 255, 255, 0.08)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: u.color || '#388bfd',
                          display: 'inline-block',
                        }}
                      />
                      {u.name}
                    </span>
                  ))
                ) : (
                  <span
                    style={{
                      fontSize: '11px',
                      color: userInfo?.color || '#58a6ff',
                      fontWeight: '600',
                    }}
                  >
                    {userInfo?.name || 'You'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {isEditingName ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateName(nameInput);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                maxLength={20}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #388bfd',
                  backgroundColor: '#0d1117',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#238636',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: userInfo?.color || '#a5d6ff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Click to change your display name"
            >
              <EditIcon /> {userInfo?.name || 'Set Name'}
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => {
                onClose();
                if (window.location.pathname.startsWith('/whiteboard')) {
                  window.location.href = '/ide';
                }
              }}
              style={{
                background: '#388bfd',
                border: 'none',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              title="Return to IDE Code Workspace"
            >
              {isMobile ? '← Exit' : '← Back to IDE'}
            </button>

            <button
              onClick={handleShareRoom}
              style={{
                background: isCopied ? '#238636' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              title="Share room link with collaborators"
            >
              <ShareIcon /> {isCopied ? 'Copied!' : isMobile ? 'Share' : 'Share Room'}
            </button>

            <button
              onClick={() => {
                onClose();
                if (window.location.pathname.startsWith('/whiteboard')) {
                  window.location.href = '/ide';
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8b949e',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close Whiteboard"
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Tldraw store={storeRef.current} onMount={handleMount} />
      </div>
    </div>
  );
}

export default WhiteboardModal;
