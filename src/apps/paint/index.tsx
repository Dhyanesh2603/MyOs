import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Palette,
  Pen,
  Brush,
  Highlighter,
  Eraser,
  Trash2,
  Save,
  Download,
  Check,
  Undo2,
  Redo2,
  Square,
  Circle,
  Minus,
  PaintBucket,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { soundEngine } from '@core/audio/soundEngine';

type Tool = 'pen' | 'brush' | 'highlighter' | 'eraser' | 'line' | 'rect' | 'circle' | 'bucket';

const COLOR_SWATCHES = [
  '#090a0f', // black
  '#ffffff', // white
  '#6366f1', // indigo
  '#38bdf8', // sky
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#64748b', // slate
];

export const PaintApp: React.FC<AppProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<string>('#6366f1');
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Shape Preview Start Coordinates
  const startCoordRef = useRef<{ x: number; y: number } | null>(null);
  const previewSnapshotRef = useRef<ImageData | null>(null);

  const { writeFile } = useVFSStore();
  const { notify } = useNotificationStore();

  /**
   * Saves the current canvas state into the undo stack
   */
  const pushUndoState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev.slice(-25), data]);
    setRedoStack([]); // New action clears redo stack
  }, []);

  /**
   * Initializes or resizes the canvas to match container size without letterboxing
   */
  const handleResize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const newWidth = Math.max(300, Math.floor(rect.width));
    const newHeight = Math.max(200, Math.floor(rect.height));

    if (canvas.width === newWidth && canvas.height === newHeight) return;

    // Cache existing drawing pixels
    const ctx = canvas.getContext('2d');
    let existingData: ImageData | null = null;
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      try {
        existingData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch {}
    }

    // Resize canvas buffer
    canvas.width = newWidth;
    canvas.height = newHeight;

    if (ctx) {
      // Re-fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, newWidth, newHeight);

      // Restore artwork
      if (existingData) {
        ctx.putImageData(existingData, 0, 0);
      } else {
        pushUndoState();
      }
    }
  }, [pushUndoState]);

  // Set up ResizeObserver on container to fill full available page
  useEffect(() => {
    handleResize();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      handleResize();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [handleResize]);

  /**
   * Precise coordinate calculation based on canvas bounding rect & actual buffer resolution
   * Guarantees 0px cursor offset anywhere on screen.
   */
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  /**
   * Flood Fill (Bucket Tool) implementation
   */
  const floodFill = (startX: number, startY: number, fillColorHex: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const x0 = Math.floor(startX);
    const y0 = Math.floor(startY);
    if (x0 < 0 || x0 >= w || y0 < 0 || y0 >= h) return;

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Parse target hex color to RGBA
    const tempEl = document.createElement('div');
    tempEl.style.color = fillColorHex;
    document.body.appendChild(tempEl);
    const rgbStr = window.getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    const m = rgbStr.match(/\d+/g);
    if (!m) return;
    const fillR = parseInt(m[0]!, 10);
    const fillG = parseInt(m[1]!, 10);
    const fillB = parseInt(m[2]!, 10);
    const fillA = 255;

    const startIndex = (y0 * w + x0) * 4;
    const startR = data[startIndex]!;
    const startG = data[startIndex + 1]!;
    const startB = data[startIndex + 2]!;
    const startA = data[startIndex + 3]!;

    if (startR === fillR && startG === fillG && startB === fillB && startA === fillA) {
      return;
    }

    const colorMatch = (idx: number) => {
      return (
        Math.abs(data[idx]! - startR) < 25 &&
        Math.abs(data[idx + 1]! - startG) < 25 &&
        Math.abs(data[idx + 2]! - startB) < 25 &&
        Math.abs(data[idx + 3]! - startA) < 25
      );
    };

    const pixelStack: [number, number][] = [[x0, y0]];

    while (pixelStack.length > 0) {
      const [curX, curY] = pixelStack.pop()!;
      let newY = curY;
      let idx = (newY * w + curX) * 4;

      while (newY >= 0 && colorMatch(idx)) {
        newY--;
        idx -= w * 4;
      }
      idx += w * 4;
      newY++;

      let reachLeft = false;
      let reachRight = false;

      while (newY < h && colorMatch(idx)) {
        data[idx] = fillR;
        data[idx + 1] = fillG;
        data[idx + 2] = fillB;
        data[idx + 3] = fillA;

        if (curX > 0) {
          if (colorMatch(idx - 4)) {
            if (!reachLeft) {
              pixelStack.push([curX - 1, newY]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (curX < w - 1) {
          if (colorMatch(idx + 4)) {
            if (!reachRight) {
              pixelStack.push([curX + 1, newY]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        newY++;
        idx += w * 4;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    pushUndoState();
  };

  /**
   * Pointer Down - Starts stroke or shape preview
   */
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    setIsSaved(false);

    const { x, y } = getCoordinates(e);
    startCoordRef.current = { x, y };

    if (tool === 'bucket') {
      floodFill(x, y, color);
      setIsDrawing(false);
      return;
    }

    // Save snapshot for shapes preview
    previewSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 3.5;
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = `${color}44`;
      ctx.lineWidth = lineWidth * 4;
    } else if (tool === 'brush') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 2.2;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  };

  /**
   * Pointer Move - Draws freehand stroke or renders live shape preview
   */
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    // Freehand tools: pen, brush, highlighter, eraser
    if (tool === 'pen' || tool === 'brush' || tool === 'highlighter' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
      return;
    }

    // Geometric Shapes: Line, Rectangle, Circle
    if (startCoordRef.current && previewSnapshotRef.current) {
      ctx.putImageData(previewSnapshotRef.current, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const start = startCoordRef.current;

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.beginPath();
        ctx.strokeRect(start.x, start.y, x - start.x, y - start.y);
      } else if (tool === 'circle') {
        const radiusX = Math.abs(x - start.x) / 2;
        const radiusY = Math.abs(y - start.y) / 2;
        const centerX = Math.min(start.x, x) + radiusX;
        const centerY = Math.min(start.y, y) + radiusY;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  /**
   * Pointer Up / Cancel
   */
  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    startCoordRef.current = null;
    previewSnapshotRef.current = null;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    pushUndoState();
  };

  /**
   * Undo Action
   */
  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentState = undoStack[undoStack.length - 1]!;
    const previousState = undoStack[undoStack.length - 2]!;

    ctx.putImageData(previousState, 0, 0);
    setRedoStack((prev) => [...prev, currentState]);
    setUndoStack((prev) => prev.slice(0, -1));
    soundEngine.playClick();
  };

  /**
   * Redo Action
   */
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextState = redoStack[redoStack.length - 1]!;
    ctx.putImageData(nextState, 0, 0);
    setUndoStack((prev) => [...prev, nextState]);
    setRedoStack((prev) => prev.slice(0, -1));
    soundEngine.playClick();
  };

  /**
   * Clear Canvas
   */
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushUndoState();
    soundEngine.playSnap();
  };

  /**
   * Save drawing to Onyx OS VFS (/home/user/Pictures)
   */
  const handleSaveToVFS = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Painting_${timestamp}.png`;
      const path = `/home/user/Pictures/${filename}`;

      await writeFile(path, dataUrl);
      setIsSaved(true);
      soundEngine.playChime();
      notify({
        title: 'Artwork Saved to Pictures',
        message: `${filename} successfully exported to VFS.`,
        type: 'success',
      });
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      notify({
        title: 'Save Failed',
        message: 'Could not write image to VFS Pictures folder.',
        type: 'error',
      });
    }
  };

  /**
   * Download directly to user host PC
   */
  const handleDownloadPC = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `OnyxPaint_${timestamp}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    soundEngine.playClick();
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#0a0b10] text-neutral-100 select-none text-xs">
      {/* Studio Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-[#0f1118] px-3.5 py-2 gap-2 shrink-0">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setTool('pen'); soundEngine.playClick(); }}
            title="Pen Tool"
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              tool === 'pen'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Pen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pen</span>
          </button>

          <button
            onClick={() => { setTool('brush'); soundEngine.playClick(); }}
            title="Soft Brush"
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              tool === 'brush'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Brush className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Brush</span>
          </button>

          <button
            onClick={() => { setTool('highlighter'); soundEngine.playClick(); }}
            title="Highlighter"
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              tool === 'highlighter'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Highlighter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Marker</span>
          </button>

          <button
            onClick={() => { setTool('eraser'); soundEngine.playClick(); }}
            title="Eraser"
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              tool === 'eraser'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Eraser className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Shapes Tools */}
          <button
            onClick={() => { setTool('line'); soundEngine.playClick(); }}
            title="Line Tool"
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              tool === 'line'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => { setTool('rect'); soundEngine.playClick(); }}
            title="Rectangle Tool"
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              tool === 'rect'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Square className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => { setTool('circle'); soundEngine.playClick(); }}
            title="Circle Tool"
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              tool === 'circle'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Circle className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => { setTool('bucket'); soundEngine.playClick(); }}
            title="Flood Fill Bucket"
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              tool === 'bucket'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <PaintBucket className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Stroke Size Slider */}
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="font-mono text-[10px] w-7">{lineWidth}px</span>
          <input
            type="range"
            min={1}
            max={48}
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value, 10))}
            className="h-1 w-18 accent-white cursor-pointer"
          />
        </div>

        {/* Color Palette Swatches & Native Color Picker */}
        <div className="flex items-center gap-1.5">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              onClick={() => { setColor(swatch); soundEngine.playClick(); }}
              style={{ backgroundColor: swatch }}
              className={`h-4 w-4 rounded-full border transition-transform cursor-pointer ${
                color === swatch
                  ? 'border-white scale-125 ring-2 ring-white/50'
                  : 'border-white/20 hover:scale-110'
              }`}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-5 w-5 rounded cursor-pointer border-0 bg-transparent p-0"
            title="Custom Hex Color"
          />
        </div>

        {/* Actions: Undo, Redo, Clear, Download, Save */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={undoStack.length <= 1}
            title="Undo"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleClear}
            title="Clear Canvas"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleDownloadPC}
            title="Download PNG to PC"
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span className="hidden md:inline">PC</span>
          </button>

          <button
            onClick={handleSaveToVFS}
            title="Save to Pictures (/home/user/Pictures)"
            className={`flex items-center gap-1 rounded-lg border px-3 py-1 font-mono text-[10px] font-semibold transition-all shadow-sm cursor-pointer ${
              isSaved
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-white bg-white text-black hover:bg-neutral-200 active:scale-95'
            }`}
          >
            {isSaved ? <Check className="h-3 w-3 text-emerald-400" /> : <Save className="h-3 w-3 text-black" />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Full-Page Drawing Viewport */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none select-none"
        />
      </div>

      {/* Footer Status Bar */}
      <div className="flex h-6 items-center justify-between border-t border-white/[0.08] bg-[#0c0e14] px-3 font-mono text-[10px] text-neutral-400 shrink-0">
        <div className="flex items-center gap-2">
          <Palette className="h-3 w-3 text-indigo-400" />
          <span>Onyx Paint Studio</span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-500 capitalize">{tool} tool active</span>
        </div>
        <div>VFS Target: /home/user/Pictures</div>
      </div>
    </div>
  );
};

export const paintManifest: AppManifest = {
  id: 'paint',
  name: 'Onyx Paint',
  description: 'Full-page tactile drawing and sketching studio with geometric shapes, flood fill, and precision cursor tracking.',
  category: 'media',
  icon: Palette,
  defaultSize: { width: 840, height: 600 },
  constraints: { minWidth: 480, minHeight: 360, maxWidth: 1800, maxHeight: 1200 },
  allowMultipleInstances: true,
  permissions: ['vfs:read', 'vfs:write'],
  component: PaintApp,
};
