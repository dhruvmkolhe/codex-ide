import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LightningIcon, RefreshIcon, PlayIcon } from '../Icons';
import './StepperSidebar.css';

// 3D Canvas component
function MemoryCanvas({ entries }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const meshesRef = useRef([]);

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;
    const width = containerElement.clientWidth || 250;
    const height = 180;

    // 1. Setup Scene, Camera, WebGLRenderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Clear out anything that might have lingered
    containerElement.innerHTML = '';
    containerElement.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Setup Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x6366f1, 1.8, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 1.5, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // 3. Grid / Vault visual guides (wireframe vault box)
    const gridGeometry = new THREE.BoxGeometry(6, 3, 2);
    const gridEdges = new THREE.EdgesGeometry(gridGeometry);
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x334155 });
    const gridLine = new THREE.LineSegments(gridEdges, gridMaterial);
    scene.add(gridLine);

    // 4. Animation Loop
    let animationFrameId;
    const animate = () => {
      gridLine.rotation.y += 0.003;
      gridLine.rotation.x += 0.001;

      meshesRef.current.forEach((mesh, i) => {
        mesh.rotation.x += 0.015;
        mesh.rotation.y += 0.02;
        // Smooth floating motion
        mesh.position.y = Math.sin(Date.now() * 0.0015 + i) * 0.25;
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 5. Responsive Resize
    const handleResize = () => {
      if (!containerElement || !rendererRef.current) return;
      const w = containerElement.clientWidth;
      const h = containerElement.clientHeight || 180;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(containerElement);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (rendererRef.current && rendererRef.current.domElement) {
        if (containerElement) {
          containerElement.innerHTML = '';
        }
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update visual node items when variables entries change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old meshes
    meshesRef.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    meshesRef.current = [];

    // Map each memory key-value to a floating shape
    if (entries.length === 0) {
      // Empty memory default globe sphere
      const sphereGeo = new THREE.SphereGeometry(0.7, 16, 12);
      const loaderMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        wireframe: true,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, loaderMat);
      scene.add(sphereMesh);
      meshesRef.current.push(sphereMesh);
    } else {
      const spacing = 3.5 / Math.max(1, entries.length - 1);
      const startX = entries.length > 1 ? -1.75 : 0;

      entries.forEach(([name, val], index) => {
        const xPos = startX + index * spacing;

        let geometry;
        let colorValue = 0x6366f1;

        const checkVal = String(val).toLowerCase();
        if (checkVal === 'true' || checkVal === 'false') {
          geometry = new THREE.ConeGeometry(0.35, 0.7, 4);
          colorValue = 0x10b981; // Green
        } else if (!isNaN(Number(val))) {
          geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
          colorValue = 0x06b6d4; // Cyan
        } else {
          geometry = new THREE.TorusGeometry(0.3, 0.1, 8, 20);
          colorValue = 0xec4899; // Torus pink/magenta
        }

        const material = new THREE.MeshStandardMaterial({
          color: colorValue,
          roughness: 0.1,
          metalness: 0.75,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(xPos, 0, 0);
        scene.add(mesh);
        meshesRef.current.push(mesh);
      });
    }
  }, [entries]);

  return (
    <div className="canvas-3d-wrapper">
      <div ref={containerRef} className="renderer-container-3d" />

      {/* Absolute floating UI overlay tags */}
      <div className="canvas-overlay-labels">
        {entries.map(([name, val], index) => {
          const gridWidth = 100 / entries.length;
          const leftPercent = index * gridWidth + gridWidth / 2;
          return (
            <div
              key={name}
              className="canvas-floating-tag"
              style={{
                left: `${leftPercent}%`,
              }}
            >
              <span className="tag-name">{name}</span>
              <span className="tag-val">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StepperSidebar({ isOpen, width, code, selectedLanguage, callAiApi, showToast }) {
  const [steps, setSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset simulator if the code changes
  useEffect(() => {
    setSteps([]);
    setCurrentStepIdx(-1);
    setIsPlaying(false);
  }, [code]);

  // Handle auto-playing steps
  useEffect(() => {
    let timer;
    if (isPlaying && steps.length > 0) {
      timer = setTimeout(() => {
        if (currentStepIdx < steps.length - 1) {
          setCurrentStepIdx((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          showToast('Simulation complete!', 'success');
        }
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, steps, showToast]);

  const generateSimulation = async () => {
    if (!code || !code.trim()) {
      showToast('Please write some code first!', 'warning');
      return;
    }

    setLoading(true);
    setSteps([]);
    setCurrentStepIdx(-1);
    setIsPlaying(false);

    const promptMessage = [
      {
        role: 'system',
        content: `You are an expert compiler trace emulator. Output a JSON-only trace of the execution of the user's code.
Output ONLY a JSON array, no markdown wrappers, no \`\`\`json tags, no explanation outside JSON.
Each object in the array represents an execution step and MUST follow this exact schema:
{
  "line": number (1-based line number of the executing statement),
  "code": "exact code of this line",
  "explanation": "Simple, beginner-friendly description of what this line does with helpful emojis. Do not mention that you are AI or a language model.",
  "memory": { "variableName": "value" }
}
Provide a logical execution route (up to 12 steps max). If there is a loop, repeat the loop steps 2-3 times to show variables changing in memory.
Example output format:
[
  {"line": 1, "code": "let score = 0;", "explanation": "Creates score and initializes it to 0 📦", "memory": {"score": "0"}},
  {"line": 2, "code": "score += 10;", "explanation": "Add 10 to score. It is now 10 ➕", "memory": {"score": "10"}}
]`,
      },
      {
        role: 'user',
        content: `Trace file execution for this ${selectedLanguage} code:\n\n${code}`,
      },
    ];

    try {
      if (!callAiApi) {
        throw new Error('Simulation engine is initializing...');
      }
      const response = await callAiApi(promptMessage);

      // Clean standard markdown wraps if the model returned them
      let cleaned = response.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned
          .replace(/^```(json)?/, '')
          .replace(/```$/, '')
          .trim();
      }

      const parsedSteps = JSON.parse(cleaned);
      if (Array.isArray(parsedSteps) && parsedSteps.length > 0) {
        setSteps(parsedSteps);
        setCurrentStepIdx(0);
        showToast('Compilation successful! Map trace built.', 'success');
      } else {
        throw new Error('Response is not a valid list of steps.');
      }
    } catch (err) {
      console.error(err);
      showToast('Static analysis warning. Compiling simple line trace...', 'info');

      const lines = code.split('\n');
      const fallbackSteps = lines
        .map((line, idx) => ({
          line: idx + 1,
          code: line.trim(),
          explanation: `System processes line ${idx + 1}.`,
          memory: {},
        }))
        .filter((step) => step.code.length > 0)
        .slice(0, 10);
      setSteps(fallbackSteps);
      if (fallbackSteps.length > 0) {
        setCurrentStepIdx(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const currentStep = steps[currentStepIdx];
  const memoryEntries = currentStep && currentStep.memory ? Object.entries(currentStep.memory) : [];

  return (
    <div
      className={`explorer-sidebar stepper-sidebar ${!isOpen ? 'collapsed' : ''}`}
      style={{ width: isOpen ? width || '280px' : '0px' }}
    >
      <div className="explorer-header stepper-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LightningIcon /> EXECUTION SIMULATOR
        </span>
      </div>

      <div className="stepper-body">
        {/* Helper Card */}
        {steps.length === 0 ? (
          <div className="sim-init-panel">
            <div className="wizard-avatar">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: '#a5b4fc' }}
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3>Compile Code Flow</h3>
            <p>
              Simulate your active workspace line-by-line to inspect memory states and execution
              paths!
            </p>
            <button
              onClick={generateSimulation}
              disabled={loading}
              className="sim-launch-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="spinner"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                    <line x1="16.24" y1="4.93" x2="19.07" y2="7.76" />
                  </svg>{' '}
                  Compiling...
                </>
              ) : (
                <>
                  Simulate Execution <LightningIcon />
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Control Panel */}
            <div className="stepper-card control-card">
              <div className="ctrl-header">
                <h3>Controls</h3>
                <span className="step-counter">
                  {currentStepIdx + 1} / {steps.length}
                </span>
              </div>

              <div className="ctrl-layout">
                {/* Row 1: Step Navigation */}
                <div className="ctrl-row-nav">
                  <button
                    onClick={handlePrev}
                    disabled={currentStepIdx <= 0}
                    className="ctrl-btn-half"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="19 20 9 12 19 4 19 20" />
                      <rect x="5" y="4" width="3" height="16" />
                    </svg>{' '}
                    Prev
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentStepIdx >= steps.length - 1}
                    className="ctrl-btn-half"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    Next{' '}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 4 15 12 5 20 5 4" />
                      <rect x="16" y="4" width="3" height="16" />
                    </svg>
                  </button>
                </div>

                {/* Row 2: Auto Play */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`ctrl-btn-full play-btn ${isPlaying ? 'playing' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {isPlaying ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>{' '}
                      Pause Auto
                    </>
                  ) : (
                    <>
                      <PlayIcon /> Play Auto
                    </>
                  )}
                </button>

                {/* Row 3: Re-map */}
                <button
                  onClick={generateSimulation}
                  disabled={loading}
                  className="sim-rebuild-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  Reset & Recompute <RefreshIcon />
                </button>
              </div>
            </div>

            {/* Current Executing Line */}
            <div className="stepper-card execution-card">
              <div className="badge-row">
                <span className="badge executing-badge">Line {currentStep.line}</span>
              </div>
              <div className="code-viewer-line">
                <code>{currentStep.code || '// Empty statement'}</code>
              </div>
              <p className="step-explanation">{currentStep.explanation}</p>
            </div>

            {/* 3D Visual Computer Memory Vault */}
            <div className="stepper-card memory-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Memory vault (3D){' '}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </h3>
              <MemoryCanvas entries={memoryEntries} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
