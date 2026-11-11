import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { soundEngine } from '@core/audio/soundEngine';

type Tool = 'pen' | 'brush' | 'highlighter' | 'eraser';

const COLOR_SWATCHES = [
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ffffff', // white
  '#94a3b8', // slate
  '#090a0f', // black
];

export const PaintApp: React.FC<AppProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<string>('#6366f1');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  const { writeFile } = useVFSStore();
  const { notify } = useNotificationStore();

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill initial canvas with clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
  }, []);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), data]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHist = history.slice(0, -1);
    const previous = newHist[newHist.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
      setHistory(newHist);
      soundEngine.playClick();
    }
  };

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    setIsSaved(false);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 3;
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = `${color}55`;
      ctx.lineWidth = lineWidth * 4;
    } else if (tool === 'brush') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 2;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    saveSnapshot();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (window.confirm('Clear canvas?')) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveSnapshot();
      soundEngine.playClick();
    }
  };

  const handleSaveToVFS = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const timestamp = Date.now().toString().slice(-6);
    const targetPath = `/home/user/Pictures/sketch-${timestamp}.png`;

    try {
      await writeFile(targetPath, dataUrl);
      setIsSaved(true);
      soundEngine.playChime();
      notify({
        title: 'Drawing Saved to Pictures',
        message: `Saved as '${targetPath}' in Onyx OS VFS.`,
        type: 'success',
      });
    } catch (err) {
      notify({
        title: 'Save Failed',
        message: String(err),
        type: 'error',
      });
    }
  };

  const handleDownloadPC = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `flowpaint-${Date.now().toString().slice(-6)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    soundEngine.playChime();
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#0a0b10] text-neutral-100 select-none text-xs">
      {/* Paint Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-[#0f1118] px-3.5 py-2 gap-2">
        {/* Tool Mode Selectors */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setTool('pen'); soundEngine.playClick(); }}
            title="Pen Tool"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
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
            title="Brush Tool"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
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
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              tool === 'highlighter'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Highlighter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Highlight</span>
          </button>

          <button
            onClick={() => { setTool('eraser'); soundEngine.playClick(); }}
            title="Eraser Tool"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              tool === 'eraser'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Eraser className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Stroke Width Slider */}
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="font-mono text-[10px] w-6">{lineWidth}px</span>
            <input
              type="range"
              min={1}
              max={24}
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="h-1 w-16 accent-white cursor-pointer"
            />
          </div>
        </div>

        {/* Color Palette Swatches */}
        <div className="flex items-center gap-1.5">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              onClick={() => { setColor(swatch); soundEngine.playClick(); }}
              style={{ backgroundColor: swatch }}
              className={`h-4.5 w-4.5 rounded-full border transition-all cursor-pointer ${
                color === swatch
                  ? 'border-white scale-125 ring-2 ring-white/40'
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

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            title="Undo"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          >
            <Undo2 className="h-3.5 w-3.5" />
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
            title="Save to Onyx OS Pictures"
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

      {/* Drawing Canvas Viewport */}
      <div className="relative flex-1 overflow-hidden bg-[#07080b] p-3 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1024}
          height={768}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="h-full w-full max-w-full max-h-full rounded-xl border border-border-subtle bg-white shadow-md cursor-crosshair touch-none object-contain"
        />
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between border-t border-border-subtle bg-surface-overlay/80 px-3 py-1 font-mono text-[10px] text-content-tertiary">
        <div className="flex items-center gap-2">
          <Palette className="h-3 w-3 text-accent-primary" />
          <span>FlowPaint Canvas Studio</span>
        </div>
        <div>Destination: /home/user/Pictures</div>
      </div>
    </div>
  );
};

export const paintManifest: AppManifest = {
  id: 'paint',
  name: 'FlowPaint',
  description: 'Tactile canvas drawing and sketching studio with direct VFS picture export.',
  category: 'productivity',
  icon: Palette,
  defaultSize: { width: 720, height: 500 },
  constraints: { minWidth: 460, minHeight: 340, maxWidth: 1400, maxHeight: 1000 },
  allowMultipleInstances: true,
  permissions: ['vfs:read', 'vfs:write'],
  component: PaintApp,
};
