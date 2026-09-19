import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  PenTool,
  Square,
  ArrowUpRight,
  Highlighter,
  Type,
  EyeOff,
  Save,
  Copy,
  Download,
  RotateCcw,
  Check,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useCaptureStore } from '@shell/capture/captureStore';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { soundEngine } from '@core/audio/soundEngine';

type Tool = 'pen' | 'arrow' | 'rect' | 'highlighter' | 'text' | 'blur';

const PALETTE = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Cyan', hex: '#00f0ff' },
  { name: 'Violet', hex: '#a855f7' },
  { name: 'White', hex: '#ffffff' },
];

export const FlowShotApp: React.FC<AppProps> = () => {
  const { capturedImageDataUrl, startCapture } = useCaptureStore();
  const { writeFile } = useVFSStore();

  const [activeTool, setActiveTool] = useState<Tool>('arrow');
  const [activeColor, setActiveColor] = useState('#00f0ff');
  const [lineWidth, setLineWidth] = useState(3);
  const [isSaved, setIsSaved] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const startCoordRef = useRef<{ x: number; y: number } | null>(null);
  const snapshotDataRef = useRef<ImageData | null>(null);
  const historyRef = useRef<ImageData[]>([]);

  // Load initial captured image or placeholder
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current = [initialSnapshot];
    };

    if (capturedImageDataUrl) {
      img.src = capturedImageDataUrl;
    } else {
      // Default sample canvas
      canvas.width = 640;
      canvas.height = 400;
      const grad = ctx.createLinearGradient(0, 0, 640, 400);
      grad.addColorStop(0, '#0c1017');
      grad.addColorStop(1, '#1a202c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 400);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '16px monospace';
      ctx.fillText('FLOWSHOT MARKUP STUDIO', 40, 60);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px monospace';
      ctx.fillText('Take a screenshot to begin annotation, or draw right here.', 40, 90);

      const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current = [initialSnapshot];
    }
  }, [capturedImageDataUrl]);

  const saveCanvasHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(current);
    if (historyRef.current.length > 20) historyRef.current.shift();
    setIsSaved(false);
  };

  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const prev = historyRef.current[historyRef.current.length - 1];
    const canvas = canvasRef.current;
    if (!canvas || !prev) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(prev, 0, 0);
    soundEngine.playSnap();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    isDrawingRef.current = true;
    startCoordRef.current = { x, y };
    snapshotDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = activeTool === 'highlighter' ? `${activeColor}80` : activeColor;
      ctx.lineWidth = activeTool === 'highlighter' ? lineWidth * 3 : lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (activeTool === 'text') {
      const text = window.prompt('Enter callout text:');
      if (text && text.trim()) {
        ctx.fillStyle = activeColor;
        ctx.font = 'bold 16px monospace';
        ctx.fillText(text.trim(), x, y);
        saveCanvasHistory();
      }
      isDrawingRef.current = false;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !startCoordRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const curX = (e.clientX - rect.left) * scaleX;
    const curY = (e.clientY - rect.top) * scaleY;
    const startX = startCoordRef.current.x;
    const startY = startCoordRef.current.y;

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      ctx.lineTo(curX, curY);
      ctx.stroke();
    } else if (snapshotDataRef.current) {
      // Restore previous state for live preview
      ctx.putImageData(snapshotDataRef.current, 0, 0);

      ctx.strokeStyle = activeColor;
      ctx.fillStyle = activeColor;
      ctx.lineWidth = lineWidth;

      if (activeTool === 'rect') {
        ctx.strokeRect(startX, startY, curX - startX, curY - startY);
      } else if (activeTool === 'arrow') {
        // Draw directional arrow
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        const angle = Math.atan2(curY - startY, curX - startX);
        const headlen = 14;
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(
          curX - headlen * Math.cos(angle - Math.PI / 6),
          curY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          curX - headlen * Math.cos(angle + Math.PI / 6),
          curY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      } else if (activeTool === 'blur') {
        // Blur / censor box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(startX, startY, curX - startX, curY - startY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(startX, startY, curX - startX, curY - startY);
        ctx.setLineDash([]);
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    saveCanvasHistory();
  };

  // Export actions
  const handleSaveToPictures = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const filename = `/home/user/Pictures/flowshot-${Date.now()}.png`;
    await writeFile(filename, dataUrl);
    setIsSaved(true);
    soundEngine.playSnap();
    useNotificationStore.getState().notify({
      title: 'Saved to Pictures',
      message: filename,
      type: 'success',
    });
  };

  const handleCopyToClipboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        try {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          soundEngine.playSnap();
          useNotificationStore.getState().notify({
            title: 'Image Copied',
            message: 'Screenshot copied to system clipboard.',
            type: 'success',
          });
        } catch {
          // Fallback
          const dataUrl = canvas.toDataURL('image/png');
          navigator.clipboard.writeText(dataUrl);
        }
      }
    });
  };

  const handleDownloadToPC = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `flowshot-${Date.now()}.png`;
    a.click();
    soundEngine.playSnap();
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface-canvas text-content-primary select-none">
      {/* Markup Studio Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border-subtle bg-surface-panel/95 p-2 text-xs backdrop-blur-md gap-2">
        {/* Tool Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-subtle/50 p-1">
          {[
            { id: 'arrow', label: 'Arrow', icon: ArrowUpRight },
            { id: 'rect', label: 'Box', icon: Square },
            { id: 'pen', label: 'Pen', icon: PenTool },
            { id: 'highlighter', label: 'Highlighter', icon: Highlighter },
            { id: 'text', label: 'Text Callout', icon: Type },
            { id: 'blur', label: 'Censor Blur', icon: EyeOff },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTool === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTool(item.id as Tool);
                }}
                className={`flex items-center gap-1 rounded px-2 py-1 transition-all ${
                  isActive
                    ? 'bg-accent text-accent-fg shadow-xs'
                    : 'text-content-tertiary hover:bg-surface-hover hover:text-content-primary'
                }`}
                title={item.label}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline font-mono text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Color Swatches */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-subtle/50 p-1">
          {PALETTE.map((c) => (
            <button
              key={c.hex}
              onClick={() => setActiveColor(c.hex)}
              className={`h-5 w-5 rounded-full transition-transform ${
                activeColor === c.hex ? 'scale-110 ring-2 ring-white ring-offset-1 ring-offset-black' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-subtle/50 p-1 font-mono text-[10px]">
          {[2, 4, 8].map((w) => (
            <button
              key={w}
              onClick={() => setLineWidth(w)}
              className={`rounded px-1.5 py-0.5 ${
                lineWidth === w ? 'bg-surface-panel font-bold text-accent' : 'text-content-tertiary'
              }`}
            >
              {w}px
            </button>
          ))}
        </div>

        {/* Undo & New Capture */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
            className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle/50 px-2 py-1 text-[11px] text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={startCapture}
            title="New Screenshot"
            className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle/50 px-2 py-1 text-[11px] text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
          >
            <Camera className="h-3 w-3 text-accent" />
            <span className="hidden sm:inline">Capture</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-4 bg-[#080a0f]">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="max-h-full max-w-full rounded-xl border border-border-subtle shadow-2xl cursor-crosshair object-contain"
        />
      </div>

      {/* Footer Export Action Strip */}
      <div className="flex items-center justify-between border-t border-border-subtle bg-surface-panel/95 px-4 py-2 text-xs">
        <div className="flex items-center gap-2 font-mono text-[10px] text-content-tertiary">
          <span>FlowShot v0.2</span>
          <span>•</span>
          <span>Tool: {activeTool.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-subtle px-3 py-1 text-xs font-medium text-content-primary hover:bg-surface-hover transition-all active:scale-95"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </button>

          <button
            onClick={handleDownloadToPC}
            className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-subtle px-3 py-1 text-xs font-medium text-content-primary hover:bg-surface-hover transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={handleSaveToPictures}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold shadow-sm transition-all active:scale-95 ${
              isSaved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-accent text-accent-fg hover:opacity-90'
            }`}
          >
            {isSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span>{isSaved ? 'Saved to Pictures' : 'Save to Pictures'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const flowshotManifest: AppManifest = {
  id: 'flowshot',
  name: 'FlowShot',
  description: 'Screen capture, crop markup studio, and annotation tools.',
  category: 'utilities',
  icon: Camera,
  defaultSize: { width: 760, height: 540 },
  constraints: { minWidth: 500, minHeight: 380, maxWidth: 1400, maxHeight: 950 },
  allowMultipleInstances: false,
  permissions: ['vfs:read', 'vfs:write'],
  component: FlowShotApp,
};
