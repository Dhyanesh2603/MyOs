import React, { useEffect, useRef } from 'react';
import {
  Music as MusicIcon,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Disc,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { audioEngine } from './audioEngine';
import { useMediaStore } from '@core/media/mediaStore';

const MusicApp: React.FC<AppProps> = ({ windowId }) => {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    volume,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
  } = useMediaStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const currentTrack = tracks[currentTrackIndex] ?? tracks[0]!;

  const handleTogglePlay = () => {
    togglePlay();
  };

  const handleNext = () => {
    nextTrack();
  };

  const handlePrev = () => {
    prevTrack();
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
  };

  // Canvas visualizer render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const analyser = audioEngine.getAnalyser();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!analyser || !isPlaying) {
        // Flatline idle wave (neutral grey works in dark and light modes)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.25)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (canvas.width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = ((dataArray[i] ?? 0) / 255) * canvas.height * 0.85;

        // Dynamic gradient for equalizer
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0.9)');

        ctx.fillStyle = gradient;
        ctx.fillRect(
          x,
          canvas.height - barHeight,
          barWidth - 2,
          barHeight
        );

        x += barWidth;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Clean up audio when window unmounts
  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col justify-between bg-surface-panel p-5 text-content-primary select-none">
      {/* Visualizer Canvas Card */}
      <div className="relative flex flex-1 flex-col items-center justify-center rounded-2xl border border-border-subtle bg-surface-overlay/50 p-4 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={440}
          height={140}
          className="w-full h-32 rounded-xl"
        />

        {/* Ambient Disc Glyph */}
        <div className="absolute top-4 right-4 flex items-center gap-2 text-content-tertiary">
          <Disc
            className={`h-5 w-5 text-accent-primary transition-transform duration-1000 ${
              isPlaying ? 'animate-spin' : ''
            }`}
          />
        </div>
      </div>

      {/* Track Metadata */}
      <div className="mt-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-sm text-content-primary">
            {currentTrack.title}
          </h3>
          <p className="font-mono text-xs text-content-secondary">
            {currentTrack.artist}
          </p>
        </div>
        <span className="font-mono text-[10px] text-accent-hover bg-accent-primary/15 border border-accent-primary/30 px-2 py-0.5 rounded-full">
          {isPlaying ? 'Synthesizing' : 'Paused'}
        </span>
      </div>

      {/* Playback Controls & Volume */}
      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="rounded-full p-2 text-content-secondary hover:bg-surface-subtle hover:text-content-primary active:scale-95 transition-all"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary text-white shadow-md hover:bg-accent-hover active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNext}
            className="rounded-full p-2 text-content-secondary hover:bg-surface-subtle hover:text-content-primary active:scale-95 transition-all"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-content-tertiary" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-24 accent-accent-primary cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-2 text-right font-mono text-[9px] text-content-tertiary">
        win: {windowId.slice(-6)} • Web Audio API
      </div>
    </div>
  );
};

export const musicManifest: AppManifest = {
  id: 'music',
  name: 'Music',
  description: 'Procedural ambient soundscapes and real-time canvas FFT visualizer.',
  category: 'media',
  icon: MusicIcon,
  defaultSize: { width: 540, height: 400 },
  constraints: { minWidth: 420, minHeight: 320, maxWidth: 800, maxHeight: 600 },
  allowMultipleInstances: false,
  permissions: ['audio'],
  component: MusicApp,
};
