import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Moon,
  UploadCloud,
  Sun,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Disc3,
  Flame,
  BatteryCharging,
  CloudRain,
  Radio,
  Orbit,
  Headphones,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import { useControlCenterStore } from '@core/system/controlCenterStore';
import { useSoundStore, soundEngine } from '@core/audio/soundEngine';
import { useMediaStore } from '@core/media/mediaStore';
import { ambientSoundEngine, AmbientTrack } from '@core/audio/ambientSoundEngine';
import { useStageManagerStore } from '@core/stage/stageManagerStore';
import { useCopilotStore } from '@core/copilot/copilotStore';
import { useFlowDropStore } from '@core/airdrop/airdropStore';

export const ControlCenterShade: React.FC = () => {
  const {
    isOpen,
    closeControlCenter,
    brightness,
    setBrightness,
    isNightShift,
    toggleNightShift,
    isWifiEnabled,
    toggleWifi,
    isBluetoothEnabled,
    toggleBluetooth,
    isFocusMode,
    toggleFocusMode,
    isAirBridgeActive,
    toggleAirBridge,
  } = useControlCenterStore();

  const { isMuted, setMuted } = useSoundStore();
  const { tracks, currentTrackIndex, isPlaying, togglePlay, nextTrack, volume, setVolume } =
    useMediaStore();

  const isStageManagerEnabled = useStageManagerStore((s) => s.isEnabled);
  const toggleStageManager = useStageManagerStore((s) => s.toggleStageManager);
  const isCopilotOpen = useCopilotStore((s) => s.isOpen);
  const toggleCopilot = useCopilotStore((s) => s.toggleCopilot);

  const currentTrack = tracks[currentTrackIndex] ?? tracks[0]!;
  const containerRef = useRef<HTMLDivElement>(null);
  const [ambientTrack, setAmbientTrack] = useState<AmbientTrack>(ambientSoundEngine.getCurrentTrack());
  const [ambientVol, setAmbientVol] = useState(ambientSoundEngine.getVolume());

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // Ensure not clicking the tray toggle button itself
        const target = e.target as HTMLElement;
        if (!target.closest('[data-control-center-trigger]')) {
          closeControlCenter();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleOutside);
    }
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [isOpen, closeControlCenter]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeControlCenter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeControlCenter]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -6 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="fixed top-9 right-3 z-[9500] w-80 rounded-2xl border border-border-subtle/80 bg-surface-panel/92 p-3.5 shadow-2xl backdrop-blur-2xl text-content-primary select-none"
      >
        {/* Top 2x2 Tactical Switch Matrix */}
        <div className="grid grid-cols-2 gap-2">
          {/* Wi-Fi */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleWifi();
            }}
            className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all text-left ${
              isWifiEnabled
                ? 'border-accent/40 bg-accent/15 text-content-primary'
                : 'border-border-subtle bg-surface-subtle/40 text-content-tertiary'
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                isWifiEnabled ? 'bg-accent text-accent-fg' : 'bg-surface-hover text-content-tertiary'
              }`}
            >
              {isWifiEnabled ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Wi-Fi</div>
              <div className="truncate text-[10px] opacity-75">
                {isWifiEnabled ? 'FlowNet-5G' : 'Disabled'}
              </div>
            </div>
          </button>

          {/* Bluetooth */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleBluetooth();
            }}
            className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all text-left ${
              isBluetoothEnabled
                ? 'border-sky-500/40 bg-sky-500/15 text-content-primary'
                : 'border-border-subtle bg-surface-subtle/40 text-content-tertiary'
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                isBluetoothEnabled ? 'bg-sky-500 text-white' : 'bg-surface-hover text-content-tertiary'
              }`}
            >
              <Bluetooth className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Bluetooth</div>
              <div className="truncate text-[10px] opacity-75">
                {isBluetoothEnabled ? 'Connected' : 'Off'}
              </div>
            </div>
          </button>

          {/* AirBridge Host Bridge / FlowDrop */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleAirBridge();
              useFlowDropStore.getState().openFlowDrop();
              closeControlCenter();
            }}
            className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all text-left ${
              isAirBridgeActive
                ? 'border-emerald-500/40 bg-emerald-500/15 text-content-primary'
                : 'border-border-subtle bg-surface-subtle/40 text-content-tertiary'
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                isAirBridgeActive
                  ? 'bg-emerald-500 text-white'
                  : 'bg-surface-hover text-content-tertiary'
              }`}
            >
              <UploadCloud className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Host Bridge</div>
              <div className="truncate text-[10px] opacity-75">
                {isAirBridgeActive ? 'Drop Ready' : 'Paused'}
              </div>
            </div>
          </button>

          {/* Focus Mode */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleFocusMode();
            }}
            className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all text-left ${
              isFocusMode
                ? 'border-indigo-500/40 bg-indigo-500/15 text-content-primary'
                : 'border-border-subtle bg-surface-subtle/40 text-content-tertiary'
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                isFocusMode ? 'bg-indigo-500 text-white' : 'bg-surface-hover text-content-tertiary'
              }`}
            >
              <Moon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Focus</div>
              <div className="truncate text-[10px] opacity-75">
                {isFocusMode ? 'Do Not Disturb' : 'Off'}
              </div>
            </div>
          </button>

          {/* Stage Manager */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleStageManager();
            }}
            className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all text-left ${
              isStageManagerEnabled
                ? 'border-accent-primary/40 bg-accent-primary/15 text-content-primary'
                : 'border-border-subtle bg-surface-subtle/40 text-content-tertiary'
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                isStageManagerEnabled ? 'bg-accent-primary text-white' : 'bg-surface-hover text-content-tertiary'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Stage Mgr</div>
              <div className="truncate text-[10px] opacity-75">
                {isStageManagerEnabled ? 'Active (Alt+S)' : 'Off'}
              </div>
            </div>
          </button>

          {/* AI Copilot */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleCopilot();
            }}
            className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-all text-left ${
              isCopilotOpen
                ? 'border-purple-500/40 bg-purple-500/15 text-content-primary'
                : 'border-border-subtle bg-surface-subtle/40 text-content-tertiary'
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                isCopilotOpen ? 'bg-purple-500 text-white' : 'bg-surface-hover text-content-tertiary'
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">AI Copilot</div>
              <div className="truncate text-[10px] opacity-75">
                {isCopilotOpen ? 'Active (Alt+C)' : 'Ready'}
              </div>
            </div>
          </button>
        </div>

        {/* Display Brightness Slider Box */}
        <div className="mt-3 rounded-xl border border-border-subtle bg-surface-subtle/40 p-3">
          <div className="flex items-center justify-between text-xs font-medium text-content-secondary mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              <span>Display Brightness</span>
            </div>
            <span className="font-mono text-[11px] text-content-tertiary">
              {Math.round(brightness * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.35"
              max="1.0"
              step="0.01"
              value={brightness}
              onChange={(e) => {
                setBrightness(parseFloat(e.target.value));
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-hover accent-accent transition-all"
            />
            <button
              onClick={() => {
                soundEngine.playClick();
                toggleNightShift();
              }}
              className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition-all ${
                isNightShift
                  ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                  : 'border-border-subtle bg-surface-subtle text-content-tertiary hover:text-content-primary'
              }`}
              title="Night Shift Warmth Filter"
            >
              <Flame className="h-3 w-3" />
              <span>Night</span>
            </button>
          </div>
        </div>

        {/* Sound Volume Slider Box */}
        <div className="mt-2 rounded-xl border border-border-subtle bg-surface-subtle/40 p-3">
          <div className="flex items-center justify-between text-xs font-medium text-content-secondary mb-1.5">
            <div className="flex items-center gap-1.5">
              {isMuted ? (
                <VolumeX className="h-3.5 w-3.5 text-red-400" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-accent" />
              )}
              <span>Master Volume</span>
            </div>
            <span className="font-mono text-[11px] text-content-tertiary">
              {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                if (isMuted && val > 0) setMuted(false);
                soundEngine.playClick();
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-hover accent-accent transition-all"
            />
            <button
              onClick={() => {
                setMuted(!isMuted);
                soundEngine.playClick();
              }}
              className={`rounded-lg border px-2 py-1 text-[10px] font-medium transition-all ${
                isMuted
                  ? 'border-red-500/40 bg-red-500/20 text-red-300'
                  : 'border-border-subtle bg-surface-subtle text-content-tertiary hover:text-content-primary'
              }`}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>

        {/* Lo-Fi Ambient Soundscapes Card */}
        <div className="mt-2 rounded-xl border border-border-subtle bg-surface-subtle/30 p-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-content-primary">
              <Headphones className="h-3.5 w-3.5 text-accent-primary" />
              <span>Lo-Fi Ambient Noise</span>
            </div>
            {ambientTrack !== 'none' && (
              <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full border border-emerald-400/20 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Playing</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {[
              { id: 'rain', label: 'Rain', icon: CloudRain },
              { id: 'campfire', label: 'Campfire', icon: Flame },
              { id: 'white_noise', label: 'Noise', icon: Radio },
              { id: 'deep_space', label: 'Space', icon: Orbit },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = ambientTrack === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    soundEngine.playClick();
                    if (isActive) {
                      ambientSoundEngine.stop();
                      setAmbientTrack('none');
                    } else {
                      ambientSoundEngine.play(t.id as AmbientTrack);
                      setAmbientTrack(t.id as AmbientTrack);
                    }
                  }}
                  className={`flex flex-col items-center gap-1 rounded-lg border py-1.5 transition-all text-center ${
                    isActive
                      ? 'border-accent-primary bg-accent-primary/20 text-accent-primary font-semibold shadow-sm'
                      : 'border-border-subtle bg-surface-card/60 text-content-secondary hover:bg-surface-subtle hover:text-content-primary'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="font-mono text-[9px]">{t.label}</span>
                </button>
              );
            })}
          </div>

          {ambientTrack !== 'none' && (
            <div className="flex items-center gap-2 pt-1 border-t border-border-subtle/40">
              <span className="font-mono text-[9px] text-content-tertiary">Vol</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVol}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setAmbientVol(v);
                  ambientSoundEngine.setVolume(v);
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-hover accent-accent-primary"
              />
              <span className="font-mono text-[9px] text-content-tertiary min-w-[28px] text-right">
                {Math.round(ambientVol * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Now Playing Media Controller Card */}
        <div className="mt-2 flex items-center justify-between rounded-xl border border-border-subtle bg-surface-subtle/40 p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-panel border border-border-subtle text-accent">
              <Disc3 className={`h-5 w-5 ${isPlaying ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-content-primary">
                {currentTrack.title}
              </div>
              <div className="truncate text-[10px] text-content-tertiary">
                {currentTrack.artist}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePlay}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-fg shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={nextTrack}
              className="rounded p-1 text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-2.5 flex items-center justify-between border-t border-border-subtle/60 pt-2 font-mono text-[10px] text-content-tertiary">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <BatteryCharging className="h-3 w-3" />
            <span>Power: High Performance</span>
          </div>
          <span>FlowOS 0.2</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
