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
  Waves,
  Server,
  Zap,
} from 'lucide-react';
import { useMediaStore } from '@core/media/mediaStore';
import { usePomodoroStore } from '@core/focus/pomodoroStore';
import { useAmbientSoundStore } from '@core/audio/ambientSoundStore';
import type { AmbientTrack } from '@core/audio/ambientSoundEngine';
import { soundEngine } from '@core/audio/soundEngine';

export interface DynamicActivityCapsuleProps {
  placement?: 'top' | 'bottom';
}

export const DynamicActivityCapsule: React.FC<DynamicActivityCapsuleProps> = ({
  placement = 'bottom',
}) => {
  const { isPlaying, tracks, currentTrackIndex, togglePlay, nextTrack } = useMediaStore();
  const { isRunning: isPomoRunning, timeLeft, mode: pomoMode, toggle: togglePomo, reset: resetPomo } = usePomodoroStore();
  const currentTrack = tracks[currentTrackIndex] ?? tracks[0];

  const [isExpanded, setIsExpanded] = useState(false);
  const { currentTrack: ambientTrack, playTrack, stopTrack } = useAmbientSoundStore();
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const hasActivity = (isPlaying && !!currentTrack) || isPomoRunning || ambientTrack !== 'none';

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pomoFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const getAmbientIcon = () => {
    switch (ambientTrack) {
      case 'brown_noise':
        return <Waves className="h-3 w-3 text-amber-400 animate-pulse" />;
      case 'server_room':
        return <Server className="h-3 w-3 text-emerald-400 animate-pulse" />;
      case 'gamma_waves':
        return <Zap className="h-3 w-3 text-indigo-400 animate-pulse" />;
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
    return null;
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
        {isPlaying && currentTrack && (
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
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-cyan-300">
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-cyan-400 animate-[bounce_0.8s_infinite_50ms] h-2 rounded-full" />
              <span className="w-0.5 bg-cyan-400 animate-[bounce_0.8s_infinite_200ms] h-3 rounded-full" />
              <span className="w-0.5 bg-cyan-400 animate-[bounce_0.8s_infinite_350ms] h-1.5 rounded-full" />
              <span className="w-0.5 bg-cyan-400 animate-[bounce_0.8s_infinite_100ms] h-2.5 rounded-full" />
            </div>
            {getAmbientIcon()}
            <span className="capitalize hidden sm:inline">{ambientTrack.replace('_', ' ')}</span>
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
            className={`absolute left-1/2 -translate-x-1/2 ${
              placement === 'bottom' ? 'bottom-12' : 'top-8'
            } z-[9500] w-76 rounded-2xl border border-white/15 bg-black/95 p-3.5 text-white shadow-2xl backdrop-blur-2xl`}
          >
            {/* Now Playing section */}
            {isPlaying && currentTrack && (
              <div className="mb-3 border-b border-white/10 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent-primary">
                      <Disc3 className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-xs truncate">{currentTrack.title}</div>
                      <div className="text-[10px] text-white/50 truncate">{currentTrack.artist}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={togglePlay}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:bg-white/90"
                    >
                      <Pause className="h-3.5 w-3.5 fill-current" />
                    </button>
                    <button
                      onClick={nextTrack}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pomodoro Timer section */}
            {isPomoRunning && (
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Timer className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-bold text-emerald-400">{pomoFormatted}</div>
                    <div className="text-[9px] text-white/40 uppercase tracking-widest">{pomoMode} session</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <button
                    onClick={togglePomo}
                    className="rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-white hover:bg-white/20"
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

            {/* Ambient Soundscape Section */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">
                  Ambient Focus Audio
                </span>
                {ambientTrack !== 'none' && (
                  <button
                    onClick={stopTrack}
                    className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    Stop
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
                {[
                  { id: 'brown_noise', label: 'Brown', icon: Waves },
                  { id: 'rain', label: 'Rain', icon: CloudRain },
                  { id: 'server_room', label: 'Server', icon: Server },
                  { id: 'gamma_waves', label: '40Hz', icon: Zap },
                  { id: 'campfire', label: 'Fire', icon: Flame },
                  { id: 'white_noise', label: 'White', icon: Radio },
                  { id: 'deep_space', label: 'Space', icon: Orbit },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = ambientTrack === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        soundEngine.playClick();
                        if (isSelected) {
                          stopTrack();
                        } else {
                          playTrack(item.id as AmbientTrack);
                        }
                      }}
                      className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-1.5 transition-all ${
                        isSelected
                          ? 'border-accent-primary bg-accent-primary/20 text-accent-primary font-medium'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="truncate w-full text-[9px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[9px] text-white/40">
              <div className="flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-accent-primary" />
                <span>Live Activity Capsule</span>
              </div>
              <span>Live Activity</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
