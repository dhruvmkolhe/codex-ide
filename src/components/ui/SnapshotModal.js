import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { XIcon, DownloadIcon } from '../Icons';

const GRADIENTS = [
  { name: 'Aurora', value: 'linear-gradient(135deg, #12c2e9, #c471ed, #f64f59)' },
  { name: 'Deep Ocean', value: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #ee0979, #ff6a00)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #232526, #414345)' },
  { name: 'Hyper', value: 'linear-gradient(135deg, #8E2DE2, #4A00E0)' },
  { name: 'Glass', value: 'rgba(255, 255, 255, 0.1)' },
];

const SnapshotModal = ({ isOpen, onClose, code, fileName, language }) => {
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [customTitle, setCustomTitle] = useState(fileName || 'untitled');
  const [bgType, setBgType] = useState('preset'); // 'preset' or 'custom'
  const [color1, setColor1] = useState('#8E2DE2');
  const [color2, setColor2] = useState('#4A00E0');
  const [angle, setAngle] = useState(135);
  const snapshotRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (fileName) setCustomTitle(fileName);
  }, [fileName, isOpen]);

  const currentBg =
    bgType === 'preset'
      ? selectedGradient.value
      : `linear-gradient(${angle}deg, ${color1}, ${color2})`;

  const handleDownload = async () => {
    if (!snapshotRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(snapshotRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `codex-snapshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export snapshot:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{ zIndex: 3000 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="modal-content snapshot-modal"
          style={{
            width: isMobile ? '95%' : '800px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            padding: '0',
            overflow: 'hidden',
            background: '#1a1a1a',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            className="modal-header"
            style={{ padding: '16px 24px', borderBottom: '1px solid #333' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                className="material-symbols-outlined"
                style={{ color: 'var(--accent-primary)' }}
              >
                image
              </span>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Create Snapshot</h3>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <XIcon />
            </button>
          </div>

          <div
            className="modal-body"
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              height: isMobile ? 'auto' : '500px',
              overflowY: isMobile ? 'auto' : 'hidden',
              flex: 1,
            }}
          >
            {/* Left Sidebar: Controls */}
            <div
              style={{
                width: isMobile ? '100%' : '240px',
                borderRight: isMobile ? 'none' : '1px solid #333',
                borderBottom: isMobile ? '1px solid #333' : 'none',
                padding: '20px',
                background: '#111',
                overflowY: 'auto',
                flexShrink: 0,
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10px',
                    color: '#888',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  Window Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#222',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    padding: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </div>

              <label
                style={{
                  display: 'block',
                  fontSize: '10px',
                  color: '#888',
                  marginBottom: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              >
                Background Style
              </label>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => setBgType('preset')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: bgType === 'preset' ? 'var(--primary-color)' : '#222',
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  Presets
                </button>
                <button
                  onClick={() => setBgType('custom')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: bgType === 'custom' ? 'var(--primary-color)' : '#222',
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  Custom
                </button>
              </div>

              {bgType === 'preset' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.name}
                      onClick={() => setSelectedGradient(g)}
                      style={{
                        height: '40px',
                        borderRadius: '6px',
                        background: g.value,
                        border:
                          selectedGradient.name === g.name
                            ? '2px solid white'
                            : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      title={g.name}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '9px',
                          color: '#666',
                          marginBottom: '4px',
                        }}
                      >
                        COLOR 1
                      </label>
                      <input
                        type="color"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        style={{
                          width: '100%',
                          height: '30px',
                          padding: 0,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '9px',
                          color: '#666',
                          marginBottom: '4px',
                        }}
                      >
                        COLOR 2
                      </label>
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        style={{
                          width: '100%',
                          height: '30px',
                          padding: 0,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '9px',
                        color: '#666',
                        marginBottom: '4px',
                      }}
                    >
                      ANGLE <span>{angle}°</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={angle}
                      onChange={(e) => setAngle(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginTop: '30px' }}>
                <button
                  className="execute-btn"
                  onClick={handleDownload}
                  disabled={isExporting}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {isExporting ? (
                    'Exporting...'
                  ) : (
                    <>
                      <DownloadIcon /> Download PNG
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Side: Preview */}
            <div
              style={{
                flex: 1,
                padding: isMobile ? '16px' : '40px',
                background: '#050505',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
              }}
            >
              <div
                ref={snapshotRef}
                style={{
                  padding: isMobile ? '20px' : '50px',
                  background: currentBg,
                  minWidth: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    background: '#1e1e1e',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    minWidth: isMobile ? '260px' : '400px',
                    width: 'fit-content',
                    maxWidth: '1000px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {/* Mac Buttons */}
                  <div
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#252525',
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#ff5f56',
                      }}
                    />
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#ffbd2e',
                      }}
                    />
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#27c93f',
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#aaa',
                        fontFamily: 'monospace',
                        fontWeight: '500',
                      }}
                    >
                      {customTitle}
                    </div>
                  </div>
                  {/* Code Area */}
                  <pre
                    style={{
                      margin: 0,
                      padding: isMobile ? '16px' : '24px',
                      color: '#d4d4d4',
                      fontSize: isMobile ? '11px' : '14px',
                      fontFamily: '"Fira Code", monospace',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    <code>{code}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SnapshotModal;
