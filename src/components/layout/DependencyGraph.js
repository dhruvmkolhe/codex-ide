import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { buildGraph } from '../../utils/dependencyParser';
import { XIcon, GraphIcon } from '../Icons';
import './DependencyGraph.css';

const NODE_RADIUS = 28;
const REPEL_STRENGTH = 4000;
const ATTRACT_STRENGTH = 0.05;
const DAMPING = 0.85;

function runForceLayout(nodes, edges, width, height, draggingNode = null) {
  // Clone nodes with positions
  const positioned = nodes.map((n, i) => {
    if (n.x !== undefined && n.y !== undefined) {
      return { ...n, vx: n.vx || 0, vy: n.vy || 0 };
    }
    const angle = nodes.length > 1 ? (2 * Math.PI * i) / nodes.length : 0;
    const radius = nodes.length > 1 ? Math.min(width, height) * 0.25 : 0;
    return {
      ...n,
      x: width / 2 + Math.cos(angle) * radius,
      y: height / 2 + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
    };
  });

  const nodeMap = {};
  positioned.forEach((n) => {
    nodeMap[n.id] = n;
  });

  for (let iter = 0; iter < 10; iter++) {
    // Repulsion
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const a = positioned[i];
        const b = positioned[j];
        if (a === draggingNode || b === draggingNode) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq) || 1;
        if (dist > 300) continue;
        const force = REPEL_STRENGTH / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // Attraction
    edges.forEach(({ source, target }) => {
      const a = nodeMap[source];
      const b = nodeMap[target];
      if (!a || !b) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 120) * ATTRACT_STRENGTH;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (a !== draggingNode) {
        a.vx += fx;
        a.vy += fy;
      }
      if (b !== draggingNode) {
        b.vx -= fx;
        b.vy -= fy;
      }
    });

    // Center gravity
    positioned.forEach((n) => {
      if (n === draggingNode) return;
      const dx = width / 2 - n.x;
      const dy = height / 2 - n.y;
      n.vx += dx * 0.005;
      n.vy += dy * 0.005;
    });

    // Apply
    positioned.forEach((n) => {
      if (n === draggingNode) return;
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.x += n.vx;
      n.y += n.vy;
    });
  }

  return positioned;
}

function getNodeColor(ext) {
  const map = {
    js: '#f7df1e',
    jsx: '#61dafb',
    ts: '#3178c6',
    tsx: '#61dafb',
    css: '#264de4',
    html: '#e34c26',
    py: '#3776ab',
    json: '#8bc34a',
    md: '#78909c',
    sql: '#ff9800',
    php: '#777bb4',
    java: '#007396',
    cpp: '#00599c',
    c: '#a8b9cc',
    go: '#00add8',
    rs: '#dea584',
    rb: '#cc342d',
    kt: '#7f52ff',
    swift: '#f05138',
    dart: '#0175c2',
    sh: '#4ead28',
    yml: '#cb171e',
    xml: '#0060ac',
    svg: '#ffb13b',
  };
  return map[ext] || '#8b919b';
}

export function DependencyGraph({ files, activeFileIndex, onClose, onSwitchFile, activeTheme }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Pan & zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.8 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setDims({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    ro.observe(el);
    setDims({ w: el.clientWidth, h: el.clientHeight });

    // Auto-center on load
    setTransform({ x: el.clientWidth * 0.05, y: el.clientHeight * 0.05, scale: 0.85 });

    return () => ro.disconnect();
  }, []);

  const { nodes: rawNodes, edges } = useMemo(() => buildGraph(files), [files]);

  const [nodes, setNodes] = useState([]);
  const [isStable, setIsStable] = useState(false);

  // Initialize nodes or update if rawNodes changed
  useEffect(() => {
    if (rawNodes.length > 0) {
      setNodes((prev) => {
        const next = runForceLayout(rawNodes, edges, dims.w, dims.h);
        return next.map((n) => {
          const old = prev.find((p) => p.id === n.id);
          return old ? { ...n, x: old.x, y: old.y, vx: old.vx, vy: old.vy } : n;
        });
      });
      setIsStable(false);
    }
  }, [rawNodes, edges, dims.w, dims.h]);

  // Set initial selection to active file
  useEffect(() => {
    if (files[activeFileIndex]) {
      setSelectedNode(files[activeFileIndex].name);
    }
  }, [activeFileIndex, files]);

  useEffect(() => {
    if (isStable) return;

    let frame;
    const tick = () => {
      setNodes((prev) => {
        const next = runForceLayout(prev, edges, dims.w, dims.h);

        // Check for stability: total velocity
        const totalVelocity = next.reduce((sum, n) => sum + Math.abs(n.vx) + Math.abs(n.vy), 0);
        if (totalVelocity < 0.1 && next.length > 0) {
          setIsStable(true);
        }
        return next;
      });
      if (!isStable) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [edges, dims, isStable]);

  const nodeMap = useMemo(() => {
    const m = {};
    nodes.forEach((n) => {
      m[n.id] = n;
    });
    return m;
  }, [nodes]);

  // Connected edges for hover highlight
  const connectedIds = useMemo(() => {
    const ids = new Set();
    if (!hoveredNode && !selectedNode) return ids;
    const target = selectedNode || hoveredNode;
    edges.forEach((e) => {
      if (e.source === target || e.target === target) {
        ids.add(e.source);
        ids.add(e.target);
      }
    });
    return ids;
  }, [hoveredNode, selectedNode, edges]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.1, Math.min(5, prev.scale * factor)),
    }));
  }, []);

  const [draggingNodeId, setDraggingNodeId] = useState(null);

  const handleMouseDown = useCallback(
    (e) => {
      const nodeEl = e.target.closest('.dep-graph-node');
      if (nodeEl) {
        const id = nodeEl.getAttribute('data-id');
        setDraggingNodeId(id);
        setIsStable(false); // Wake up simulation
        return;
      }
      isPanning.current = true;
      panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    },
    [transform]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (draggingNodeId) {
        const el = containerRef.current;
        const rect = el.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
        const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;

        setNodes((prev) =>
          prev.map((n) =>
            n.id === draggingNodeId ? { ...n, x: mouseX, y: mouseY, vx: 0, vy: 0 } : n
          )
        );
        return;
      }
      if (!isPanning.current) return;
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      }));
    },
    [draggingNodeId, transform]
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
    setDraggingNodeId(null);
  }, []);

  const handleRecenter = () => {
    setTransform({ x: dims.w * 0.05, y: dims.h * 0.05, scale: 0.85 });
  };

  return (
    <div className={`dep-graph-overlay ${activeTheme}`}>
      <div className="dep-graph-header">
        <div className="dep-graph-title">
          <GraphIcon size={18} />
          <span>Dependency Graph</span>
          <span className="dep-graph-badge">
            {nodes.length} nodes · {edges.length} links
          </span>
          {isStable && <span className="dep-graph-stable-flag">Stable</span>}
        </div>
        <button className="dep-graph-close-btn" onClick={onClose}>
          <XIcon size={18} />
        </button>
      </div>

      <div className="dep-graph-toolbar">
        <div className="dep-graph-toolbar-group">
          <span className="dep-graph-hint">
            Scroll to zoom · Drag nodes · Double-click to jump to file
          </span>
        </div>
        <div className="dep-graph-toolbar-group">
          <button
            className="dep-graph-action-btn primary"
            onClick={handleRecenter}
            title="Recenter View"
          >
            Reset View
          </button>
        </div>
      </div>

      <div
        className="dep-graph-canvas"
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {nodes.length === 0 ? (
          <div className="dep-graph-empty">
            <GraphIcon size={64} />
            <p>Scanning for connections...</p>
            <p className="dep-graph-empty-hint">Try adding imports to your project files.</p>
          </div>
        ) : (
          <svg width="100%" height="100%">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="25"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="rgba(153,203,255,0.3)" />
              </marker>
              <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
              {/* Edges */}
              {edges.map((e, i) => {
                const a = nodeMap[e.source];
                const b = nodeMap[e.target];
                if (!a || !b) return null;
                const active =
                  (hoveredNode || selectedNode) === e.source ||
                  (hoveredNode || selectedNode) === e.target;
                return (
                  <line
                    key={`${e.source}-${e.target}-${i}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    className={`dep-edge ${active ? 'active' : ''}`}
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const color = getNodeColor(node.ext);
                const isSelected = selectedNode === node.id;
                const isActiveFile = files[activeFileIndex]?.name === node.id;
                const isHovered = hoveredNode === node.id;
                const isRelated = connectedIds.has(node.id);
                const dimmed =
                  (hoveredNode || selectedNode) && !isRelated && !isSelected && !isHovered;

                return (
                  <g
                    key={node.id}
                    data-id={node.id}
                    className={`dep-graph-node ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isActiveFile ? 'active-file' : ''}`}
                    transform={`translate(${node.x},${node.y})`}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={(e) => {
                      if (e.detail === 2) {
                        // Double click to jump
                        const fileIdx = files.findIndex((f) => f.name === node.id);
                        if (fileIdx !== -1 && onSwitchFile) onSwitchFile(fileIdx);
                      } else {
                        setSelectedNode((prev) => (prev === node.id ? null : node.id));
                      }
                    }}
                    style={{
                      opacity: dimmed ? 0.2 : 1,
                      transition: 'opacity 0.2s, transform 0.2s',
                    }}
                  >
                    {/* Interaction area */}
                    <circle r={NODE_RADIUS + 12} fill="transparent" />

                    {/* Active/Selected indicator ring */}
                    {(isSelected || isActiveFile) && (
                      <circle
                        r={NODE_RADIUS + 6}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        opacity="0.6"
                      >
                        <animateTransform
                          attributeName="transform"
                          attributeType="XML"
                          type="rotate"
                          from="0 0 0"
                          to="360 0 0"
                          dur="10s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Glow ring */}
                    {(isSelected || isHovered) && (
                      <circle
                        r={NODE_RADIUS + 4}
                        fill="none"
                        stroke={color}
                        strokeWidth="4"
                        opacity="0.4"
                        filter="url(#node-glow)"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      r={NODE_RADIUS}
                      fill={activeTheme.includes('light') ? '#ffffff' : '#1e1e1e'}
                      stroke={color}
                      strokeWidth={isSelected || isActiveFile ? 3 : 2}
                      className="node-bg"
                    />

                    {/* File Extension Text */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="11"
                      fill={color}
                      fontWeight="900"
                      style={{ pointerEvents: 'none', userSelect: 'none', letterSpacing: '0.5px' }}
                    >
                      {node.ext.toUpperCase() || 'FILE'}
                    </text>

                    {/* Label */}
                    <g transform={`translate(0, ${NODE_RADIUS + 18})`}>
                      <rect
                        x={-(Math.min(node.label.length, 20) * 3.5 + 8)}
                        y={-10}
                        width={Math.min(node.label.length, 20) * 7 + 16}
                        height={20}
                        rx={10}
                        fill={activeTheme.includes('light') ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.6)'}
                        stroke={isActiveFile ? color : 'transparent'}
                        strokeWidth="1"
                        style={{ opacity: isHovered || isSelected || isActiveFile ? 1 : 0.6 }}
                      />
                      <text
                        textAnchor="middle"
                        fontSize="10"
                        fill={activeTheme.includes('light') ? '#333' : '#fff'}
                        fontWeight={isSelected || isActiveFile ? '700' : '500'}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}
