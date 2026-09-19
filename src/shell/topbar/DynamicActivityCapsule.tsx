import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Disc3,
  Pause,
  SkipForward,
  Timer,
  RotateCcw,
  CloudRain,
  Flame,
  Radio,
  Orbit,
  Sparkles,
} from 'lucide-react';
import { useMediaStore } from '@core/media/mediaStore';
import { usePomodoroStore } from '@core/focus/pomodoroStore';
import { ambientSoundEngine, AmbientTrack } from '@core/audio/ambientSoundEngine';
import { soundEngine } from '@core/audio/soundEngine';

export const DynamicActivityCapsule: React.FC = () => {
  const { isPlaying, tracks, currentTrackIndex, togglePlay, nextTrack } = useMediaStore();
  const { isRunning: isPomoRunning, timeLeft, mode: pomoMode, toggle: togglePomo, reset: resetPomo } = usePomodoroStore();
  const currentTrack = tracks[currentTrackIndex] ?? tracks[0]!;

  const [isExpanded, setIsExpanded] = useState(false);
  const [ambientTrack, setAmbientTrack] = useState<AmbientTrack>(ambientSoundEngine.getCurrentTrack());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Poll ambient track status
  useEffect(() => {
    const interval = setInterval(() => {
      const cur = ambientSoundEngine.getCurrentTrack();
      if (cur !== ambientTrack) setAmbientTrack(cur);
    }, 500);
    return () => clearInterval(interval);
  }, [ambientTrack]);

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const hasActivity = isPlaying || isPomoRunning || ambientTrack !== 'none';

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pomoFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const getAmbientIcon = () => {
    switch (ambientTrack) {
      case 'rain':
        return <CloudRain className="h-3 w-3 text-cyan-400 animate-pulse" />;
      case 'campfire':
        return <Flame className="h-3 w-3 text-amber-400 animate-pulse" />;
      case 'white_noise':
        return <Radio className="h-3 w-3 text-indigo-400 animate-pulse" />;
      case 'deep_space':
        return <Orbit className="h-3 w-3 text-purple-400 animate-pulse" />;
      default:
        return null;
    }
  };

  if (!hasActivity) {
    return (
      <div className="hidden lg:flex items-center gap-1 font-mono text-[10px] text-content-tertiary/70 select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d71921]" />
        <span>Ready</span>
      </div>
    );
  }

  return (
    <div ref={popoverRef} className="relative select-none">
      {/* Morphing Capsule Pill */}
      <motion.button
        layout
        onClick={() => {
          soundEngine.playClick();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-black/90 px-2.5 py-0.5 text-xs text-white shadow-md backdrop-blur-xl hover:border-accent-primary/60 transition-colors"
      >
        {/* Media state */}
        {isPlaying && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-accent-primary animate-[bounce_1s_infinite_100ms] h-2.5 rounded-full" />
              <span className="w-0.5 bg-accent-primary animate-[bounce_1s_infinite_300ms] h-3 rounded-full" />
              <span className="w-0.5 bg-accent-primary animate-[bounce_1s_infinite_200ms] h-1.5 rounded-full" />
            </div>
            <span className="max-w-[80px] sm:max-w-[110px] truncate font-medium text-[11px]">
              {currentTrack.title}
            </span>
          </div>
        )}

        {/* Pomodoro state */}
        {isPomoRunning && (
          <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
            <Timer className="h-3 w-3 animate-spin" />
            <span>{pomoFormatted}</span>
          </div>
        )}

        {/* Ambient Noise state */}
        {ambientTrack !== 'none' && !isPlaying && (
          <div className="flex items-center gap-1 font-mono text-[10px] text-cyan-300">
            {getAmbientIcon()}
            <span className="capitalize">{ambientTrack.replace('_', ' ')}</span>
          </div>
        )}
      </motion.button>

      {/* Expanded Dynamic Island HUD */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ type: 'spring', damping: 24, stiffness: 350 }}
            className="absolute left-1/2 -translate-x-1/2 top-8 z-[9500] w-72 rounded-2xl border border-white/15 bg-black/95 p-3.5 text-white shadow-2xl backdrop-blur-2xl"
          >
            {/* Now Playing section */}
            {isPlaying && (
              <div className="mb-3 border-b border-white/10 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent-primary">
                      <Disc3 className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold">{currentTrack.title}</div>
                      <div className="truncate text-[10px] text-white/60">{currentTrack.artist}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={togglePlay}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-primary text-white shadow-sm"
                    >
                      <Pause className="h-3 w-3 fill-current" />
                    </button>
                    <button
                      onClick={nextTrack}
                      className="rounded p-1 text-white/70 hover:text-white"
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pomodoro Timer section */}
            {isPomoRunning && (
              <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="font-mono text-sm font-bold text-emerald-400">{pomoFormatted}</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/50">{pomoMode} block</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={togglePomo}
                    className="rounded-lg bg-white/10 px-2 py-1 font-mono text-[10px] hover:bg-white/20"
                  >
                    Pause
                  </button>
                  <button
                    onClick={resetPomo}
                    className="rounded-lg p-1 text-white/60 hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Ambient Sound section */}
            {ambientTrack !== 'none' && (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  {getAmbientIcon()}
                  <span className="font-mono text-[11px] capitalize text-white/80">
                    {ambientTrack.replace('_', ' ')} Soundscape
                  </span>
                </div>
                <button
                  onClick={() => {
                    ambientSoundEngine.stop();
                    setAmbientTrack('none');
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-white/70 hover:bg-white/10 hover:text-white"
                >
                  Stop
                </button>
              </div>
            )}

            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[9px] text-white/40">
              <div className="flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-accent-primary" />
                <span>Live Activity Capsule</span>
              </div>
              <span>FlowOS</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
