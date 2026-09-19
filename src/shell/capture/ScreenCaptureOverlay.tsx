import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Camera, Maximize, X } from 'lucide-react';
import { useCaptureStore } from './captureStore';
import { useProcessStore } from '@core/process/processStore';

export const ScreenCaptureOverlay: React.FC = () => {
  const { isCapturing, cancelCapture, finishCapture } = useCaptureStore();
  const { launchApp } = useProcessStore();

  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!isCapturing) {
      setStartPos(null);
      setCurrentPos(null);
      isDraggingRef.current = false;
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelCapture();
      } else if (e.code === 'Space') {
        e.preventDefault();
        captureFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCapturing, cancelCapture]);

  if (!isCapturing) return null;

  const captureCanvasArea = (rect: { x: number; y: number; width: number; height: number }) => {
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(100, rect.width * dpr);
    canvas.height = Math.max(80, rect.height * dpr);
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.scale(dpr, dpr);
      // Create clean high-tech OS gradient snapshot
      const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      grad.addColorStop(0, '#0a0d14');
      grad.addColorStop(0.5, '#121620');
      grad.addColorStop(1, '#080a0f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Grid dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let x = 0; x < rect.width; x += 24) {
        for (let y = 0; y < rect.height; y += 24) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Snapshot stamp
      ctx.fillStyle = '#00f0ff';
      ctx.font = '12px monospace';
      ctx.fillText(`FLOWSHOT CAPTURE • ${Math.round(rect.width)}x${Math.round(rect.height)}`, 16, 28);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px monospace';
      ctx.fillText(new Date().toLocaleString(), 16, 44);
    }

    const dataUrl = canvas.toDataURL('image/png');
    finishCapture(dataUrl);
    launchApp('flowshot');
  };

  const captureFullscreen = () => {
    captureCanvasArea({
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    const pos = { x: e.clientX, y: e.clientY };
    setStartPos(pos);
    setCurrentPos(pos);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || !startPos || !currentPos) {
      isDraggingRef.current = false;
      return;
    }
    isDraggingRef.current = false;

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    if (width > 20 && height > 20) {
      captureCanvasArea({ x, y, width, height });
    } else {
      setStartPos(null);
      setCurrentPos(null);
    }
  };

  let box = null;
  if (startPos && currentPos) {
    const left = Math.min(startPos.x, currentPos.x);
    const top = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    box = { left, top, width, height };
  }

  return (
    <AnimatePresence>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="fixed inset-0 z-[9900] cursor-crosshair select-none bg-black/40 backdrop-blur-[1px]"
      >
        {/* Top Control Notification Bar */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full border border-border-subtle bg-surface-panel/95 px-4 py-2 shadow-2xl backdrop-blur-xl text-content-primary">
          <div className="flex items-center gap-2 font-mono text-xs">
            <Camera className="h-4 w-4 text-accent animate-pulse" />
            <span className="font-semibold">FlowShot</span>
            <span className="text-content-tertiary">|</span>
            <span className="text-content-secondary">
              Drag to select area, or press <kbd className="rounded bg-surface-subtle px-1.5 py-0.5 font-bold">Space</kbd> for fullscreen
            </span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-border-subtle pl-2">
            <button
              onClick={captureFullscreen}
              className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold text-accent-fg hover:scale-105 transition-all"
            >
              <Maximize className="h-3 w-3" />
              <span>Fullscreen</span>
            </button>
            <button
              onClick={cancelCapture}
              className="rounded-full p-1 text-content-tertiary hover:bg-surface-hover hover:text-content-primary transition-colors"
              title="Cancel (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Selection Crop Marquee Box */}
        {box && box.width > 2 && box.height > 2 && (
          <div
            style={{
              position: 'absolute',
              left: `${box.left}px`,
              top: `${box.top}px`,
              width: `${box.width}px`,
              height: `${box.height}px`,
            }}
            className="border-2 border-accent bg-accent/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] pointer-events-none"
          >
            {/* Dimension Badge */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded bg-black/90 px-2 py-0.5 font-mono text-[10px] text-white shadow-md">
              {Math.round(box.width)} × {Math.round(box.height)} px
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
