import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  RotateCcw,
  Sparkles,
  Download,
  Clock,
  Check,
  Film,
  Zap,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { soundEngine } from '@core/audio/soundEngine';

export type FilterShader = 'normal' | 'matrix' | 'gameboy' | 'crt' | 'cyberpunk' | 'sepia';

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
];

export const FlowCamApp: React.FC<AppProps> = () => {
  const writeFile = useVFSStore((s) => s.writeFile);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterShader>('normal');
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 5>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
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
            setHasCamera(true);
          }
        } else {
          setHasCamera(false);
        }
      } catch (err) {
        console.warn('Webcam not accessible, using retro simulation card:', err);
        setHasCamera(false);
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
        // Draw mirrored camera feed
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        ctx.restore();
      } else {
        // Fallback procedural retro studio test card if no hardware webcam
        fallbackTick++;
        ctx.fillStyle = '#0a0b0d';
        ctx.fillRect(0, 0, w, h);

        // Animated grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        const offset = (fallbackTick * 0.5) % 30;
        for (let x = offset; x < w; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = offset; y < h; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Concentric radar circles
        ctx.strokeStyle = 'rgba(215, 25, 33, 0.35)';
        ctx.lineWidth = 1.5;
        const pulse = Math.sin(fallbackTick * 0.05) * 20;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 60 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FLOWCAM STUDIO // SENSOR READY', w / 2, h / 2 - 12);
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('ALLOW CAMERA PERMISSION OR SNAP SIMULATION', w / 2, h / 2 + 14);
      }

      // Apply real-time canvas post-processing shaders
      if (activeFilter !== 'normal') {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        if (activeFilter === 'matrix') {
          // Nothing OS Dot Matrix Rasterizer
          ctx.fillStyle = '#050505';
          ctx.fillRect(0, 0, w, h);
          const step = 6;
          for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
              const idx = (y * w + x) * 4;
              const r = data[idx] ?? 0;
              const g = data[idx + 1] ?? 0;
              const b = data[idx + 2] ?? 0;
              const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

              if (brightness > 0.15) {
                const radius = (brightness * step) / 2.2;
                ctx.beginPath();
                ctx.arc(x + step / 2, y + step / 2, radius, 0, Math.PI * 2);
                if (brightness > 0.8) {
                  ctx.fillStyle = '#d71921'; // Nothing signature red
                } else {
                  const val = Math.floor(brightness * 255);
                  ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
                }
                ctx.fill();
              }
            }
          }
          return;
        }

        if (activeFilter === 'gameboy') {
          // Game Boy 4-Color Green Phosphor Dithering
          for (let i = 0; i < data.length; i += 4) {
            const avg = ((data[i] ?? 0) * 0.299 + (data[i + 1] ?? 0) * 0.587 + (data[i + 2] ?? 0) * 0.114);
            if (avg < 64) {
              data[i] = 15; data[i + 1] = 56; data[i + 2] = 15;
            } else if (avg < 128) {
              data[i] = 48; data[i + 1] = 98; data[i + 2] = 48;
            } else if (avg < 192) {
              data[i] = 139; data[i + 1] = 172; data[i + 2] = 15;
            } else {
              data[i] = 155; data[i + 1] = 188; data[i + 2] = 15;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (activeFilter === 'cyberpunk') {
          // Cyberpunk Emerald Phosphor Terminal
          for (let i = 0; i < data.length; i += 4) {
            const avg = ((data[i] ?? 0) * 0.299 + (data[i + 1] ?? 0) * 0.587 + (data[i + 2] ?? 0) * 0.114);
            data[i] = 0;
            data[i + 1] = Math.min(255, Math.floor(avg * 1.35));
            data[i + 2] = Math.floor(avg * 0.4);
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (activeFilter === 'sepia') {
          // Warm 35mm Analog Sepia Film
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i] ?? 0;
            const g = data[i + 1] ?? 0;
            const b = data[i + 2] ?? 0;
            data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (activeFilter === 'crt') {
          // Scanlines
          ctx.putImageData(imgData, 0, 0);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          for (let y = 0; y < h; y += 3) {
            ctx.fillRect(0, y, w, 1);
          }
        }
      }
    };

    processFrame();
    return () => cancelAnimationFrame(animId);
  }, [streamActive, activeFilter]);

  // Execute snapshot capture
  const takeSnapshot = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundEngine.playClick();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const dataUrl = canvas.toDataURL('image/png');
    const filename = `FlowCam_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    const vfsPath = `/home/user/Pictures/${filename}`;

    try {
      await writeFile(vfsPath, dataUrl);
      setJustSaved(filename);
      setTimeout(() => setJustSaved(null), 3000);
    } catch (e) {
      console.warn('VFS direct save failed, kept in local session:', e);
    }

    setCapturedPhotos((prev) => [
      { id: filename, dataUrl, timestamp: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  }, []);

  // Handle countdown trigger
  const handleShutter = () => {
    if (countdown !== null) return;

    if (timerDuration === 0) {
      takeSnapshot();
    } else {
      let count = timerDuration;
      setCountdown(count);
      soundEngine.playClick();

      const timer = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
          soundEngine.playClick();
        } else {
          clearInterval(timer);
          setCountdown(null);
          takeSnapshot();
        }
      }, 1000);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#121316] text-neutral-200 select-none overflow-hidden font-sans">
      {/* Hidden raw video element */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-[#17181d]">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#d71921] text-white">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-bold tracking-wider text-white">
            FLOWCAM STUDIO
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-neutral-400">
            {hasCamera ? 'SENSOR: HD WEBCAM' : 'SENSOR: SYNTHETIC TESTCARD'}
          </span>
        </div>

        {/* Timer toggle */}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-neutral-400 mr-1" />
          {([0, 3, 5] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                soundEngine.playClick();
                setTimerDuration(t);
              }}
              className={`rounded px-2 py-0.5 font-mono text-[10px] transition-colors ${
                timerDuration === t
                  ? 'bg-white text-black font-bold'
                  : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              {t === 0 ? 'OFF' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden p-3">
        {/* Processed Viewport Canvas */}
        <div className="relative aspect-[4/3] max-h-full max-w-full overflow-hidden rounded-xl border border-white/15 bg-[#0a0a0d] shadow-2xl">
          <canvas ref={canvasRef} width={640} height={480} className="h-full w-full object-contain" />

          {/* Flash Effect */}
          <AnimatePresence>
            {isFlashing && (
              <motion.div
                initial={{ opacity: 0.95 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 bg-white pointer-events-none z-30"
              />
            )}
          </AnimatePresence>

          {/* Countdown Ring Display */}
          <AnimatePresence>
            {countdown !== null && (
              <motion.div
                key={countdown}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20 pointer-events-none"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#d71921] bg-black/75 shadow-2xl">
                  <span className="font-mono text-5xl font-black text-white">{countdown}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast alert on save */}
          <AnimatePresence>
            {justSaved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-3 py-1 font-mono text-[10px] text-emerald-300 backdrop-blur-md shadow-lg"
              >
                <Check className="h-3 w-3 text-emerald-400" />
                <span>Saved to Pictures/{justSaved}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Shader Filter Selection Ribbon */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 border-t border-white/10 bg-[#16171c]">
        {SHADER_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => {
              soundEngine.playClick();
              setActiveFilter(filter.id);
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-all text-xs font-medium ${
              activeFilter === filter.id
                ? 'border-[#d71921] bg-[#d71921]/15 text-white shadow-sm'
                : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className={`h-3 w-3 ${activeFilter === filter.id ? 'text-[#d71921]' : 'text-neutral-500'}`} />
            <span>{filter.name}</span>
            <span className="rounded bg-white/10 px-1 py-0.2 font-mono text-[8px] text-neutral-400">
              {filter.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom Shutter Strip & Photo Filmstrip */}
      <div className="flex items-center justify-between border-t border-white/10 bg-[#121316] px-4 py-3">
        {/* Filmstrip of session captures */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-[50%] py-1">
          {capturedPhotos.length === 0 ? (
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500">
              <Film className="h-3.5 w-3.5" />
              <span>NO CAPTURES YET</span>
            </div>
          ) : (
            capturedPhotos.slice(0, 4).map((photo) => (
              <a
                key={photo.id}
                href={photo.dataUrl}
                download={photo.id}
                title={`Click to download ${photo.id}`}
                className="group relative h-10 w-12 shrink-0 overflow-hidden rounded border border-white/20 bg-black cursor-pointer hover:border-[#d71921] transition-colors"
              >
                <img src={photo.dataUrl} alt="Capture" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Download className="h-3 w-3 text-white" />
                </div>
              </a>
            ))
          )}
        </div>

        {/* Big Tactile Shutter Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleShutter}
            disabled={countdown !== null}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/40 bg-neutral-900 p-1 shadow-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
          >
            <div className="h-full w-full rounded-full bg-[#d71921] shadow-[0_0_12px_rgba(215,25,33,0.6)] group-hover:bg-[#ff242d] transition-colors flex items-center justify-center">
              <Zap className="h-4 w-4 text-white fill-current" />
            </div>
          </button>
        </div>

        {/* Clear / Reset photos */}
        <div className="flex items-center justify-end max-w-[20%]">
          {capturedPhotos.length > 0 && (
            <button
              onClick={() => setCapturedPhotos([])}
              className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-neutral-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>CLEAR</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const flowcamManifest: AppManifest = {
  id: 'flowcam',
  name: 'FlowCam',
  description: 'Retro photo booth & camera studio with Nothing Dot-Matrix, CRT, Game Boy, and Cyberpunk shaders.',
  category: 'media',
  icon: Camera,
  defaultSize: { width: 720, height: 560 },
  constraints: { minWidth: 520, minHeight: 440, maxWidth: 1080, maxHeight: 800 },
  allowMultipleInstances: false,
  permissions: ['vfs:write'],
  component: FlowCamApp,
};
