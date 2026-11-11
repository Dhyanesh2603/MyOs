import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  RotateCcw,
  Download,
  Check,
  Grid,
  FlipHorizontal,
  Layers,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { soundEngine } from '@core/audio/soundEngine';

export type FilterShader = 'normal' | 'matrix' | 'gameboy' | 'crt' | 'cyberpunk' | 'sepia' | 'thermal';

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: string;
}

const SHADER_FILTERS: { id: FilterShader; name: string; badge: string }[] = [
  { id: 'normal', name: 'Studio', badge: 'RAW' },
  { id: 'matrix', name: 'Nothing Dot', badge: 'LED' },
  { id: 'gameboy', name: 'Game Boy', badge: '8-BIT' },
  { id: 'crt', name: 'Retro CRT', badge: 'SCAN' },
  { id: 'cyberpunk', name: 'Cyberpunk', badge: 'NEON' },
  { id: 'sepia', name: 'Analog 35mm', badge: 'FILM' },
  { id: 'thermal', name: 'Thermal Heat', badge: 'FLIR' },
];

export const FlowCamApp: React.FC<AppProps> = () => {
  const writeFile = useVFSStore((s) => s.writeFile);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterShader>('normal');
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 5 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [isBurstMode, setIsBurstMode] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<CapturedPhoto | null>(null);
  const [justSaved, setJustSaved] = useState<string | null>(null);

  // Initialize camera stream or fallback generator
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setStreamActive(true);
          }
        }
      } catch (err) {
        console.warn('Webcam not accessible, using retro simulation card:', err);
      }
    }

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Continuous Canvas Processing with Shaders
  useEffect(() => {
    let animId: number;
    let fallbackTick = 0;

    const processFrame = () => {
      animId = requestAnimationFrame(processFrame);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      if (streamActive && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        if (isMirrored) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        ctx.restore();
      } else {
        // Procedural synthetic Cyberpunk avatar card
        fallbackTick += 0.03;
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 1;
        const gridSize = 32;
        for (let x = 0; x < w; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Radar circle & scanline
        const cx = w / 2;
        const cy = h / 2;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 70, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 110, 0, Math.PI * 2);
        ctx.stroke();

        // Biometric Target Reticle
        const scanY = (Math.sin(fallbackTick) * 0.5 + 0.5) * h;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(w, scanY);
        ctx.stroke();

        // Status Card Text
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ONYX CAMERA SYNTHETIC FEED', cx, cy - 20);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText('Hardware camera inactive • Procedural sensor ready', cx, cy + 10);
      }

      // Apply Shader Filter post-processing
      if (activeFilter !== 'normal') {
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        if (activeFilter === 'matrix') {
          // Nothing OS Dot-Matrix LED effect
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, w, h);
          const dotStep = 7;
          for (let y = 0; y < h; y += dotStep) {
            for (let x = 0; x < w; x += dotStep) {
              const i = (y * w + x) * 4;
              const brightness = ((d[i]! + d[i + 1]! + d[i + 2]!) / 3) / 255;
              if (brightness > 0.15) {
                const radius = (dotStep / 2) * brightness;
                ctx.fillStyle = brightness > 0.7 ? '#ffffff' : '#94a3b8';
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        } else if (activeFilter === 'gameboy') {
          // Nintendo 4-shade olive green
          for (let i = 0; i < d.length; i += 4) {
            const gray = (d[i]! * 0.3 + d[i + 1]! * 0.59 + d[i + 2]! * 0.11);
            if (gray < 64) {
              d[i] = 15; d[i + 1] = 56; d[i + 2] = 15;
            } else if (gray < 128) {
              d[i] = 48; d[i + 1] = 98; d[i + 2] = 48;
            } else if (gray < 192) {
              d[i] = 139; d[i + 1] = 172; d[i + 2] = 15;
            } else {
              d[i] = 155; d[i + 1] = 188; d[i + 2] = 15;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (activeFilter === 'crt') {
          // Retro CRT scanlines
          for (let i = 0; i < d.length; i += 4) {
            const y = Math.floor((i / 4) / w);
            if (y % 3 === 0) {
              d[i] = d[i]! * 0.6;
              d[i + 1] = d[i + 1]! * 0.6;
              d[i + 2] = d[i + 2]! * 0.6;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (activeFilter === 'cyberpunk') {
          // High-contrast Cyan & Neon Magenta
          for (let i = 0; i < d.length; i += 4) {
            d[i] = Math.min(255, d[i]! * 1.5 + 40);
            d[i + 1] = Math.min(255, d[i + 1]! * 0.5);
            d[i + 2] = Math.min(255, d[i + 2]! * 1.8 + 60);
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (activeFilter === 'sepia') {
          // Warm 35mm film
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i]!;
            const g = d[i + 1]!;
            const b = d[i + 2]!;
            d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
            d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (activeFilter === 'thermal') {
          // FLIR Infrared Heatmap
          for (let i = 0; i < d.length; i += 4) {
            const gray = (d[i]! + d[i + 1]! + d[i + 2]!) / 3;
            if (gray < 64) {
              d[i] = 0; d[i + 1] = 0; d[i + 2] = gray * 4;
            } else if (gray < 128) {
              d[i] = (gray - 64) * 4; d[i + 1] = 0; d[i + 2] = 255;
            } else if (gray < 192) {
              d[i] = 255; d[i + 1] = (gray - 128) * 4; d[i + 2] = 0;
            } else {
              d[i] = 255; d[i + 1] = 255; d[i + 2] = (gray - 192) * 4;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }
      }

      // Draw Rule of Thirds Grid if toggled
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h);
        ctx.moveTo((w * 2) / 3, 0); ctx.lineTo((w * 2) / 3, h);
        ctx.moveTo(0, h / 3); ctx.lineTo(w, h / 3);
        ctx.moveTo(0, (h * 2) / 3); ctx.lineTo(w, (h * 2) / 3);
        ctx.stroke();
      }
    };

    processFrame();
    return () => cancelAnimationFrame(animId);
  }, [streamActive, activeFilter, isMirrored, showGrid]);

  /**
   * Captures snapshot from canvas
   */
  const captureSnapshot = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundEngine.playSnap();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 120);

    const dataUrl = canvas.toDataURL('image/png');
    const photoId = `photo_${Date.now()}`;
    const newPhoto: CapturedPhoto = {
      id: photoId,
      dataUrl,
      timestamp: new Date().toLocaleTimeString(),
    };

    setCapturedPhotos((prev) => [newPhoto, ...prev.slice(0, 15)]);

    // Write to Onyx OS VFS /home/user/Pictures
    try {
      const filename = `OnyxCam_${Date.now()}.png`;
      await writeFile(`/home/user/Pictures/${filename}`, dataUrl);
      setJustSaved(filename);
      setTimeout(() => setJustSaved(null), 3000);
    } catch {}
  }, [writeFile]);

  /**
   * Handle Shutter trigger with countdown or burst
   */
  const handleShutter = () => {
    soundEngine.playClick();

    if (timerDuration > 0) {
      setCountdown(timerDuration);
      let remaining = timerDuration;
      const interval = setInterval(() => {
        remaining -= 1;
        if (remaining > 0) {
          setCountdown(remaining);
          soundEngine.playClick();
        } else {
          clearInterval(interval);
          setCountdown(null);
          if (isBurstMode) {
            runBurst();
          } else {
            captureSnapshot();
          }
        }
      }, 1000);
    } else {
      if (isBurstMode) {
        runBurst();
      } else {
        captureSnapshot();
      }
    }
  };

  const runBurst = () => {
    captureSnapshot();
    setTimeout(() => captureSnapshot(), 350);
    setTimeout(() => captureSnapshot(), 700);
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[#07080b] text-neutral-100 select-none overflow-hidden font-sans">
      <video ref={videoRef} playsInline muted className="hidden" />

      {/* Top Filter Bar */}
      <div className="z-20 flex h-11 items-center justify-between border-b border-white/[0.08] bg-[#0c0d12]/90 px-3.5 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar">
          {SHADER_FILTERS.map((f) => {
            const isSelected = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveFilter(f.id);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span>{f.name}</span>
                <span className="font-mono text-[9px] opacity-75">{f.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Toggles: Grid, Mirror, Burst, Timer */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Mirror Toggle */}
          <button
            onClick={() => { setIsMirrored(!isMirrored); soundEngine.playClick(); }}
            title="Mirror Camera Feed"
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              isMirrored ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FlipHorizontal className="h-3.5 w-3.5" />
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => { setShowGrid(!showGrid); soundEngine.playClick(); }}
            title="Rule of Thirds Grid"
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              showGrid ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
          </button>

          {/* Burst Mode Toggle */}
          <button
            onClick={() => { setIsBurstMode(!isBurstMode); soundEngine.playClick(); }}
            title="Burst Capture (3 Shots)"
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              isBurstMode ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
          </button>

          {/* Timer Selector */}
          {([0, 3, 5] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTimerDuration(t); soundEngine.playClick(); }}
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] cursor-pointer ${
                timerDuration === t
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t === 0 ? 'OFF' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Camera Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} width={640} height={480} className="h-full w-full object-contain" />

        {/* Screen Flash Shutter Effect */}
        <AnimatePresence>
          {isFlashing && (
            <motion.div
              initial={{ opacity: 0.95 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-40 bg-white"
            />
          )}
        </AnimatePresence>

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="font-mono text-7xl font-black text-amber-400 drop-shadow-[0_0_24px_rgba(245,158,11,0.8)] animate-ping">
              {countdown}
            </span>
          </div>
        )}

        {/* Saved Alert Toast */}
        {justSaved && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-black shadow-lg">
            <Check className="h-3.5 w-3.5" />
            <span>Saved to /home/user/Pictures</span>
          </div>
        )}
      </div>

      {/* Filmstrip & Shutter Controls Bar */}
      <div className="z-20 flex h-20 items-center justify-between border-t border-white/[0.08] bg-[#0c0d12] px-4 shrink-0">
        {/* Recent Captured Photos Filmstrip */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-[40%] scrollbar-none no-scrollbar">
          {capturedPhotos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setPreviewPhoto(photo)}
              className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-white/20 hover:border-amber-400 transition-all cursor-pointer"
            >
              <img src={photo.dataUrl} alt="Captured" className="h-full w-full object-cover" />
            </button>
          ))}
          {capturedPhotos.length === 0 && (
            <span className="font-mono text-[10px] text-neutral-500">Filmstrip Empty</span>
          )}
        </div>

        {/* Big Shutter Trigger Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleShutter}
            disabled={countdown !== null}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/40 bg-neutral-900 p-1 shadow-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
          >
            <div className="h-full w-full rounded-full bg-amber-400 group-hover:bg-amber-300 transition-colors flex items-center justify-center">
              <Camera className="h-5 w-5 text-neutral-950" />
            </div>
          </button>
        </div>

        {/* Clear / Reset photos */}
        <div className="flex items-center justify-end max-w-[20%]">
          {capturedPhotos.length > 0 && (
            <button
              onClick={() => { setCapturedPhotos([]); soundEngine.playClick(); }}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* High-Res Photo Zoom Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6 backdrop-blur-md"
        >
          <div className="relative max-h-[80vh] max-w-[80vw] overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
            <img src={previewPhoto.dataUrl} alt="Preview" className="h-full w-full object-contain" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={previewPhoto.dataUrl}
              download={`OnyxCam_${Date.now()}.png`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black shadow-lg hover:bg-amber-300 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download to PC</span>
            </a>
            <button
              onClick={() => setPreviewPhoto(null)}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const flowcamManifest: AppManifest = {
  id: 'flowcam',
  name: 'OnyxCam',
  description: 'Retro photo booth & camera studio with Nothing Dot-Matrix, CRT, Game Boy, and Thermal Infrared shaders.',
  category: 'media',
  icon: Camera,
  defaultSize: { width: 760, height: 580 },
  constraints: { minWidth: 520, minHeight: 440, maxWidth: 1100, maxHeight: 840 },
  allowMultipleInstances: false,
  permissions: ['vfs:write'],
  component: FlowCamApp,
};
