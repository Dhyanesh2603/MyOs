import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  PenTool,
  StickyNote,
  Square,
  ArrowUpRight,
  Eraser,
  Download,
  Plus,
  Minus,
  Trash2,
  Copy,
  Move,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { soundEngine } from '@core/audio/soundEngine';

export type ToolType = 'select' | 'card' | 'shape' | 'pen' | 'connector' | 'eraser';
export type ShapeKind = 'rectangle' | 'circle' | 'diamond' | 'pill';

export interface StickyCard {
  id: string;
  type: 'card';
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content: string;
  color: string;
  textColor: string;
  tag?: string;
}

export interface ShapeBlock {
  id: string;
  type: 'shape';
  shapeKind: ShapeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  fillColor: string;
  borderColor: string;
  textColor: string;
}

export interface ConnectorLine {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color: string;
}

export interface DoodleStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

const CARD_PALETTES = [
  { bg: '#fef08a', text: '#713f12', name: 'Canary' },
  { bg: '#a5f3fc', text: '#155e75', name: 'Cyan' },
  { bg: '#fbcfe8', text: '#831843', name: 'Sakura' },
  { bg: '#bbf7d0', text: '#14532d', name: 'Mint' },
  { bg: '#e9d5ff', text: '#581c87', name: 'Lavender' },
  { bg: '#262626', text: '#fafafa', name: 'Obsidian' },
];

const PEN_COLORS = ['#38bdf8', '#f43f5e', '#10b981', '#a855f7', '#f59e0b', '#ffffff'];

export const FlowBoardApp: React.FC<AppProps> = () => {
  const writeFile = useVFSStore((s) => s.writeFile);
  const notify = useNotificationStore((s) => s.notify);

  // Canvas Viewport State
  const [pan, setPan] = useState({ x: 120, y: 100 });
  const [zoom, setZoom] = useState(1.0);
  const [activeTool, setActiveTool] = useState<ToolType>('select');

  // Board Elements initialized from localStorage or empty
  const [cards, setCards] = useState<StickyCard[]>(() => {
    try {
      const saved = localStorage.getItem('flowos_flowboard_cards_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [shapes, setShapes] = useState<ShapeBlock[]>(() => {
    try {
      const saved = localStorage.getItem('flowos_flowboard_shapes_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [connectors, setConnectors] = useState<ConnectorLine[]>(() => {
    try {
      const saved = localStorage.getItem('flowos_flowboard_connectors_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [strokes, setStrokes] = useState<DoodleStroke[]>(() => {
    try {
      const saved = localStorage.getItem('flowos_flowboard_strokes_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flowos_flowboard_cards_v3', JSON.stringify(cards));
    } catch {}
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem('flowos_flowboard_shapes_v3', JSON.stringify(shapes));
    } catch {}
  }, [shapes]);

  useEffect(() => {
    try {
      localStorage.setItem('flowos_flowboard_connectors_v3', JSON.stringify(connectors));
    } catch {}
  }, [connectors]);

  useEffect(() => {
    try {
      localStorage.setItem('flowos_flowboard_strokes_v3', JSON.stringify(strokes));
    } catch {}
  }, [strokes]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectorSourceId, setConnectorSourceId] = useState<string | null>(null);

  // Pen Tool Settings
  const [penColor, setPenColor] = useState('#38bdf8');
  const [penWidth, setPenWidth] = useState(3);
  const [selectedCardColor, setSelectedCardColor] = useState(CARD_PALETTES[0]!.bg);
  const [isExporting, setIsExporting] = useState(false);

  // Dragging & Interaction Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const draggingItemRef = useRef<{ id: string; offsetX: number; offsetY: number; isShape: boolean } | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);

  // Coordinates helper
  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;
      return {
        x: (rawX - pan.x) / zoom,
        y: (rawY - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // Mouse Down handler for canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && activeTool === 'select')) {
      // Pan canvas
      isPanningRef.current = true;
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (activeTool === 'pen' && e.button === 0) {
      const coords = screenToCanvas(e.clientX, e.clientY);
      isDrawingRef.current = true;
      currentStrokeRef.current = [coords];
      return;
    }

    if (activeTool === 'card' && e.button === 0) {
      const coords = screenToCanvas(e.clientX, e.clientY);
      const palette = CARD_PALETTES.find((p) => p.bg === selectedCardColor) || CARD_PALETTES[0]!;
      const newCard: StickyCard = {
        id: `card-${Date.now()}`,
        type: 'card',
        x: Math.round(coords.x - 100),
        y: Math.round(coords.y - 70),
        width: 220,
        height: 160,
        title: 'New Idea',
        content: 'Type your notes or architectural thoughts here...',
        color: palette.bg,
        textColor: palette.text,
        tag: 'NOTE',
      };
      setCards((prev) => [...prev, newCard]);
      setSelectedId(newCard.id);
      setActiveTool('select');
      soundEngine.playClick();
      return;
    }

    if (activeTool === 'shape' && e.button === 0) {
      const coords = screenToCanvas(e.clientX, e.clientY);
      const newShape: ShapeBlock = {
        id: `shape-${Date.now()}`,
        type: 'shape',
        shapeKind: 'rectangle',
        x: Math.round(coords.x - 80),
        y: Math.round(coords.y - 40),
        width: 160,
        height: 80,
        label: 'Process Node',
        fillColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: '#a855f7',
        textColor: '#e9d5ff',
      };
      setShapes((prev) => [...prev, newShape]);
      setSelectedId(newShape.id);
      setActiveTool('select');
      soundEngine.playClick();
      return;
    }

    // Clicked empty background
    if (activeTool === 'select') {
      setSelectedId(null);
      setConnectorSourceId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanningRef.current) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
      return;
    }

    if (isDrawingRef.current && activeTool === 'pen') {
      const coords = screenToCanvas(e.clientX, e.clientY);
      currentStrokeRef.current.push(coords);
      // Re-render strokes dynamically
      setStrokes((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.id === 'current-stroke') {
          return [
            ...prev.slice(0, -1),
            { id: 'current-stroke', points: [...currentStrokeRef.current], color: penColor, width: penWidth },
          ];
        }
        return [
          ...prev,
          { id: 'current-stroke', points: [...currentStrokeRef.current], color: penColor, width: penWidth },
        ];
      });
      return;
    }

    if (draggingItemRef.current) {
      const { id, offsetX, offsetY, isShape } = draggingItemRef.current;
      const coords = screenToCanvas(e.clientX, e.clientY);
      const nextX = Math.round(coords.x - offsetX);
      const nextY = Math.round(coords.y - offsetY);

      if (isShape) {
        setShapes((prev) =>
          prev.map((s) => (s.id === id ? { ...s, x: nextX, y: nextY } : s))
        );
      } else {
        setCards((prev) =>
          prev.map((c) => (c.id === id ? { ...c, x: nextX, y: nextY } : c))
        );
      }
    }
  };

  const handleMouseUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
    }
    if (draggingItemRef.current) {
      draggingItemRef.current = null;
    }
    if (isDrawingRef.current && activeTool === 'pen') {
      isDrawingRef.current = false;
      if (currentStrokeRef.current.length > 1) {
        const finishedStroke: DoodleStroke = {
          id: `stroke-${Date.now()}`,
          points: [...currentStrokeRef.current],
          color: penColor,
          width: penWidth,
        };
        setStrokes((prev) => [...prev.filter((s) => s.id !== 'current-stroke'), finishedStroke]);
      } else {
        setStrokes((prev) => prev.filter((s) => s.id !== 'current-stroke'));
      }
      currentStrokeRef.current = [];
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const nextZoom = Math.min(2.5, Math.max(0.35, zoom * zoomFactor));

    if (!containerRef.current) {
      setZoom(nextZoom);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Smooth zoom towards mouse point
    const nextPanX = mouseX - (mouseX - pan.x) * (nextZoom / zoom);
    const nextPanY = mouseY - (mouseY - pan.y) * (nextZoom / zoom);

    setZoom(nextZoom);
    setPan({ x: nextPanX, y: nextPanY });
  };

  // Node Click Handlers (Cards and Shapes)
  const handleItemClick = (id: string, isShape: boolean, e: React.MouseEvent) => {
    e.stopPropagation();

    if (activeTool === 'eraser') {
      soundEngine.playClick();
      if (isShape) {
        setShapes((prev) => prev.filter((s) => s.id !== id));
      } else {
        setCards((prev) => prev.filter((c) => c.id !== id));
      }
      setConnectors((prev) => prev.filter((conn) => conn.fromId !== id && conn.toId !== id));
      if (selectedId === id) setSelectedId(null);
      return;
    }

    if (activeTool === 'connector') {
      if (!connectorSourceId) {
        setConnectorSourceId(id);
        soundEngine.playClick();
      } else if (connectorSourceId !== id) {
        // Create link
        const newConn: ConnectorLine = {
          id: `conn-${Date.now()}`,
          fromId: connectorSourceId,
          toId: id,
          color: '#38bdf8',
        };
        setConnectors((prev) => [...prev, newConn]);
        setConnectorSourceId(null);
        setActiveTool('select');
        soundEngine.playSnap();
      }
      return;
    }

    // Select Tool
    setSelectedId(id);
  };

  const handleStartDrag = (id: string, isShape: boolean, e: React.MouseEvent) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    const coords = screenToCanvas(e.clientX, e.clientY);
    const item = isShape ? shapes.find((s) => s.id === id) : cards.find((c) => c.id === id);
    if (!item) return;

    draggingItemRef.current = {
      id,
      offsetX: coords.x - item.x,
      offsetY: coords.y - item.y,
      isShape,
    };
    setSelectedId(id);
  };

  // Helper to get center of an element
  const getNodeCenter = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (card) {
      return { x: card.x + card.width / 2, y: card.y + card.height / 2 };
    }
    const shape = shapes.find((s) => s.id === id);
    if (shape) {
      return { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
    }
    return { x: 0, y: 0 };
  };

  // Export board as PNG to VFS
  const handleExportPNG = async () => {
    setIsExporting(true);
    soundEngine.playSnap();

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas not supported');

      // 1. Draw sleek dark grid background
      ctx.fillStyle = '#0f141c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1e293b';
      for (let x = 0; x < canvas.width; x += 32) {
        for (let y = 0; y < canvas.height; y += 32) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Center view offset
      const offsetX = 300;
      const offsetY = 200;

      // 2. Draw Connectors
      connectors.forEach((conn) => {
        const from = getNodeCenter(conn.fromId);
        const to = getNodeCenter(conn.toId);
        ctx.strokeStyle = conn.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(from.x + offsetX, from.y + offsetY);
        const midX = (from.x + to.x) / 2 + offsetX;
        ctx.quadraticCurveTo(midX, from.y + offsetY, to.x + offsetX, to.y + offsetY);
        ctx.stroke();
      });

      // 3. Draw Doodle Strokes
      strokes.forEach((stroke) => {
        if (stroke.points.length < 2) return;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        stroke.points.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x + offsetX, pt.y + offsetY);
          else ctx.lineTo(pt.x + offsetX, pt.y + offsetY);
        });
        ctx.stroke();
      });

      // 4. Draw Shapes
      shapes.forEach((shape) => {
        ctx.fillStyle = shape.fillColor;
        ctx.strokeStyle = shape.borderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (shape.shapeKind === 'circle') {
          ctx.ellipse(
            shape.x + shape.width / 2 + offsetX,
            shape.y + shape.height / 2 + offsetY,
            shape.width / 2,
            shape.height / 2,
            0,
            0,
            Math.PI * 2
          );
        } else {
          ctx.roundRect(shape.x + offsetX, shape.y + offsetY, shape.width, shape.height, 12);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = shape.textColor;
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          shape.label,
          shape.x + shape.width / 2 + offsetX,
          shape.y + shape.height / 2 + offsetY
        );
      });

      // 5. Draw Cards
      cards.forEach((card) => {
        ctx.fillStyle = card.color;
        ctx.beginPath();
        ctx.roundRect(card.x + offsetX, card.y + offsetY, card.width, card.height, 14);
        ctx.fill();

        // Header Tag
        if (card.tag) {
          ctx.fillStyle = card.textColor;
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(card.tag, card.x + offsetX + 16, card.y + offsetY + 14);
        }

        // Card Title
        ctx.fillStyle = card.textColor;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(card.title, card.x + offsetX + 16, card.y + offsetY + 34);

        // Card Content
        ctx.font = '12px sans-serif';
        const words = card.content.split(' ');
        let line = '';
        let lineY = card.y + offsetY + 62;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > card.width - 32 && n > 0) {
            ctx.fillText(line, card.x + offsetX + 16, lineY);
            line = words[n] + ' ';
            lineY += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, card.x + offsetX + 16, lineY);
      });

      // Title watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('FLOWBOARD CANVAS • FLOWOS', canvas.width - 24, canvas.height - 20);

      const dataUrl = canvas.toDataURL('image/png');
      const filename = `FlowBoard_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
      const path = `/home/user/Pictures/${filename}`;

      await writeFile(path, dataUrl);
      soundEngine.playChime();
      notify({
        title: 'FlowBoard Canvas Saved',
        message: `High-res whiteboard snapshot exported to ${path}`,
        type: 'success',
      });
    } catch {
      notify({
        title: 'Export Failed',
        message: 'Could not export whiteboard snapshot.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Keyboard Delete Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        const activeElem = document.activeElement;
        if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA')) {
          return; // Let user edit text inside card without deleting element
        }
        soundEngine.playClick();
        setCards((prev) => prev.filter((c) => c.id !== selectedId));
        setShapes((prev) => prev.filter((s) => s.id !== selectedId));
        setConnectors((prev) => prev.filter((conn) => conn.fromId !== selectedId && conn.toId !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  return (
    <div className="relative flex h-full w-full flex-col bg-[#0b0f17] text-white select-none overflow-hidden font-sans">
      {/* Top Glass Header Bar */}
      <div className="z-20 flex h-11 items-center justify-between border-b border-white/10 bg-[#0f141e]/90 px-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-inner">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide text-neutral-100 flex items-center gap-1.5">
              <span>FlowBoard</span>
              <span className="rounded bg-sky-500/20 px-1 py-0.2 font-mono text-[9px] text-sky-300">
                VECTOR
              </span>
            </div>
          </div>
        </div>

        {/* Viewport Zoom & HUD Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.35, z - 0.15))}
              className="rounded p-1 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom Out"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[44px] text-center font-mono text-[11px] text-neutral-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="rounded p-1 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom In"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1.0);
                setPan({ x: 120, y: 100 });
              }}
              className="ml-1 rounded px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Reset View"
            >
              1:1
            </button>
          </div>

          {/* Export PNG button */}
          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/20 px-2.5 py-1 text-xs font-medium text-sky-300 hover:bg-sky-500/30 transition-all shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
          </button>
        </div>
      </div>

      {/* Infinite Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative flex-1 overflow-hidden cursor-${
          activeTool === 'select'
            ? 'default'
            : activeTool === 'pen'
            ? 'crosshair'
            : activeTool === 'eraser'
            ? 'no-drop'
            : 'cell'
        }`}
        style={{
          backgroundColor: '#0b0f17',
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.12) 1.2px, transparent 0)`,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* Transformable Canvas Surface */}
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Dynamic SVG Connection Overlay */}
          <svg className="pointer-events-none absolute inset-0 overflow-visible w-full h-full">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
              </marker>
            </defs>
            {connectors.map((conn) => {
              const from = getNodeCenter(conn.fromId);
              const to = getNodeCenter(conn.toId);
              const midX = (from.x + to.x) / 2;
              return (
                <g key={conn.id}>
                  <path
                    d={`M ${from.x} ${from.y} Q ${midX} ${from.y} ${to.x} ${to.y}`}
                    fill="none"
                    stroke={conn.color}
                    strokeWidth="2.5"
                    strokeDasharray="5,3"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}

            {/* Doodle Vector Strokes */}
            {strokes.map((stroke) => {
              if (stroke.points.length < 2) return null;
              const d = stroke.points.reduce((acc, pt, i) => {
                return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
              }, '');
              return (
                <path
                  key={stroke.id}
                  d={d}
                  fill="none"
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={activeTool === 'eraser' ? 'pointer-events-auto cursor-pointer' : ''}
                  onClick={() => {
                    if (activeTool === 'eraser') {
                      soundEngine.playClick();
                      setStrokes((prev) => prev.filter((s) => s.id !== stroke.id));
                    }
                  }}
                />
              );
            })}
          </svg>

          {/* Shapes Layer */}
          {shapes.map((shape) => {
            const isSelected = selectedId === shape.id;
            return (
              <div
                key={shape.id}
                onClick={(e) => handleItemClick(shape.id, true, e)}
                onMouseDown={(e) => handleStartDrag(shape.id, true, e)}
                style={{
                  position: 'absolute',
                  left: shape.x,
                  top: shape.y,
                  width: shape.width,
                  height: shape.height,
                  backgroundColor: shape.fillColor,
                  borderColor: shape.borderColor,
                  borderRadius:
                    shape.shapeKind === 'pill'
                      ? 9999
                      : shape.shapeKind === 'circle'
                      ? '50%'
                      : 12,
                }}
                className={`flex items-center justify-center border-2 transition-shadow cursor-move ${
                  isSelected ? 'ring-2 ring-sky-400 shadow-xl' : 'hover:border-sky-400/80'
                }`}
              >
                <input
                  type="text"
                  value={shape.label}
                  onChange={(e) => {
                    const val = e.target.value;
                    setShapes((prev) =>
                      prev.map((s) => (s.id === shape.id ? { ...s, label: val } : s))
                    );
                  }}
                  className="bg-transparent text-center font-semibold text-xs text-neutral-100 outline-none w-full px-2"
                />
              </div>
            );
          })}

          {/* Sticky Cards Layer */}
          {cards.map((card) => {
            const isSelected = selectedId === card.id;
            return (
              <div
                key={card.id}
                onClick={(e) => handleItemClick(card.id, false, e)}
                style={{
                  position: 'absolute',
                  left: card.x,
                  top: card.y,
                  width: card.width,
                  height: card.height,
                  backgroundColor: card.color,
                  color: card.textColor,
                }}
                className={`flex flex-col rounded-2xl p-3 shadow-2xl transition-all select-text border border-black/10 ${
                  isSelected
                    ? 'ring-4 ring-sky-400/80 scale-[1.02] shadow-2xl z-10'
                    : 'hover:shadow-xl'
                }`}
              >
                {/* Drag Handle & Top Controls */}
                <div
                  onMouseDown={(e) => handleStartDrag(card.id, false, e)}
                  className="flex items-center justify-between pb-1 cursor-move select-none border-b border-black/10 mb-2"
                >
                  <div className="flex items-center gap-1">
                    <Move className="h-3 w-3 opacity-50" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider opacity-60">
                      {card.tag || 'CARD'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playClick();
                        const dupCard: StickyCard = {
                          ...card,
                          id: `card-${Date.now()}`,
                          x: card.x + 30,
                          y: card.y + 30,
                        };
                        setCards((prev) => [...prev, dupCard]);
                      }}
                      className="p-1 rounded hover:bg-black/10"
                      title="Duplicate Card"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playClick();
                        setCards((prev) => prev.filter((c) => c.id !== card.id));
                        setConnectors((prev) =>
                          prev.filter((conn) => conn.fromId !== card.id && conn.toId !== card.id)
                        );
                      }}
                      className="p-1 rounded hover:bg-black/10"
                      title="Delete Card"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Editable Title */}
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCards((prev) =>
                      prev.map((c) => (c.id === card.id ? { ...c, title: val } : c))
                    );
                  }}
                  className="bg-transparent font-bold text-xs outline-none mb-1.5 tracking-tight"
                  placeholder="Card Title..."
                />

                {/* Editable Body Content */}
                <textarea
                  value={card.content}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCards((prev) =>
                      prev.map((c) => (c.id === card.id ? { ...c, content: val } : c))
                    );
                  }}
                  className="flex-1 bg-transparent text-[11px] leading-relaxed resize-none outline-none opacity-90"
                  placeholder="Type notes or bullet points..."
                />

                {/* Bottom Color Swatches (if selected) */}
                {isSelected && (
                  <div className="flex items-center gap-1 pt-1.5 mt-auto border-t border-black/10 select-none">
                    {CARD_PALETTES.map((pal) => (
                      <button
                        key={pal.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCards((prev) =>
                            prev.map((c) =>
                              c.id === card.id
                                ? { ...c, color: pal.bg, textColor: pal.text }
                                : c
                            )
                          );
                        }}
                        style={{ backgroundColor: pal.bg }}
                        className={`h-3.5 w-3.5 rounded-full border border-black/20 transition-transform ${
                          card.color === pal.bg ? 'scale-125 ring-2 ring-black/30' : 'hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {cards.length === 0 && shapes.length === 0 && strokes.length === 0 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md text-center max-w-sm pointer-events-none select-none">
              <LayoutDashboard className="h-10 w-10 text-neutral-600 mb-3" />
              <h4 className="text-sm font-semibold text-white">Whiteboard Canvas</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Select Sticky Note, Shape, or Pen from the toolbar below to begin drafting.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Tactical Bottom Tool Palette Dock */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-2xl border border-white/15 bg-[#0f141e]/90 p-1.5 shadow-2xl backdrop-blur-2xl">
        {/* Selection / Move tool */}
        <button
          onClick={() => {
            setActiveTool('select');
            soundEngine.playClick();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
            activeTool === 'select'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
          title="Select & Move (V)"
        >
          <Move className="h-3.5 w-3.5" />
          <span>Move</span>
        </button>

        {/* Sticky Note Tool */}
        <button
          onClick={() => {
            setActiveTool('card');
            soundEngine.playClick();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
            activeTool === 'card'
              ? 'bg-amber-400 text-amber-950 shadow-md font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
          title="Add Sticky Note (N)"
        >
          <StickyNote className="h-3.5 w-3.5" />
          <span>Note</span>
        </button>

        {/* Shape Tool */}
        <button
          onClick={() => {
            setActiveTool('shape');
            soundEngine.playClick();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
            activeTool === 'shape'
              ? 'bg-purple-500 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
          title="Add Node Shape (S)"
        >
          <Square className="h-3.5 w-3.5" />
          <span>Shape</span>
        </button>

        {/* Connector Arrow Tool */}
        <button
          onClick={() => {
            setActiveTool('connector');
            setConnectorSourceId(null);
            soundEngine.playClick();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
            activeTool === 'connector'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
          title="Connect Elements (C)"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>Connect</span>
        </button>

        {/* Doodle Pen Tool */}
        <button
          onClick={() => {
            setActiveTool('pen');
            soundEngine.playClick();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
            activeTool === 'pen'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
          title="Vector Doodle Pen (P)"
        >
          <PenTool className="h-3.5 w-3.5" />
          <span>Doodle</span>
        </button>

        {/* Eraser Tool */}
        <button
          onClick={() => {
            setActiveTool('eraser');
            soundEngine.playClick();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
            activeTool === 'eraser'
              ? 'bg-red-500 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
          title="Eraser (E)"
        >
          <Eraser className="h-3.5 w-3.5" />
          <span>Eraser</span>
        </button>

        {/* Pen Color & Width Swatches (if pen active) */}
        {activeTool === 'pen' && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <div className="flex items-center gap-1">
              {PEN_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setPenColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-4 w-4 rounded-full border border-black/30 transition-transform ${
                    penColor === c ? 'scale-125 ring-2 ring-white/80' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-0.5 pl-1 border-l border-white/10">
              {[2, 4, 8].map((w) => (
                <button
                  key={w}
                  onClick={() => setPenWidth(w)}
                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                    penWidth === w ? 'bg-white/20 text-white font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Card Color Preset Swatches (if card active) */}
        {activeTool === 'card' && (
          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            {CARD_PALETTES.map((p) => (
              <button
                key={p.name}
                onClick={() => setSelectedCardColor(p.bg)}
                style={{ backgroundColor: p.bg }}
                className={`h-4 w-4 rounded-full border border-black/30 transition-transform ${
                  selectedCardColor === p.bg ? 'scale-125 ring-2 ring-sky-400' : 'hover:scale-110'
                }`}
                title={p.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Connection Mode Helper Notification Banner */}
      {activeTool === 'connector' && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 rounded-xl border border-sky-500/40 bg-sky-950/80 px-4 py-1.5 text-xs text-sky-200 backdrop-blur-md shadow-lg animate-pulse">
          {connectorSourceId
            ? 'Click target card or shape to connect'
            : 'Click starting card or shape'}
        </div>
      )}
    </div>
  );
};

export const flowboardManifest: AppManifest = {
  id: 'flowboard',
  name: 'FlowBoard',
  description: 'Infinite vector whiteboard canvas with tactile sticky notes, shape nodes, and doodle pen.',
  category: 'productivity',
  icon: LayoutDashboard,
  defaultSize: { width: 920, height: 640 },
  constraints: { minWidth: 640, minHeight: 480, maxWidth: 1920, maxHeight: 1200 },
  allowMultipleInstances: false,
  permissions: ['vfs:write', 'notifications'],
  component: FlowBoardApp,
};
