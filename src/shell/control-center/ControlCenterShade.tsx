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
  CloudRain,
  Radio,
  Orbit,
  Headphones,
  LayoutGrid,
  Sparkles,
  Keyboard,
  X,
  Lock,
  BatteryCharging,
} from 'lucide-react';
import { useControlCenterStore } from '@core/system/controlCenterStore';
import { useSoundStore, soundEngine } from '@core/audio/soundEngine';
import { useMediaStore } from '@core/media/mediaStore';
import { ambientSoundEngine, AmbientTrack } from '@core/audio/ambientSoundEngine';
import { useStageManagerStore } from '@core/stage/stageManagerStore';
import { useCopilotStore } from '@core/copilot/copilotStore';
import { useFlowDropStore } from '@core/airdrop/airdropStore';
import { useSessionStore } from '@core/session/sessionStore';
import { useThemeStore } from '@core/theme/themeStore';

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

  const { isMuted, setMuted, audioTheme, setAudioTheme } = useSoundStore();
  const { tracks, currentTrackIndex, isPlaying, togglePlay, nextTrack, volume, setVolume } =
    useMediaStore();

  const isStageManagerEnabled = useStageManagerStore((s) => s.isEnabled);
  const toggleStageManager = useStageManagerStore((s) => s.toggleStageManager);
  const isCopilotOpen = useCopilotStore((s) => s.isOpen);
  const toggleCopilot = useCopilotStore((s) => s.toggleCopilot);

  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);

  const currentTrack = tracks[currentTrackIndex] ?? tracks[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const [ambientTrack, setAmbientTrack] = useState<AmbientTrack>(ambientSoundEngine.getCurrentTrack());

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
        initial={{ opacity: 0, scale: 0.95, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-11 right-3 z-[9500] w-[370px] max-h-[92vh] overflow-y-auto no-scrollbar rounded-[26px] border border-white/[0.16] bg-[#101117] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)_inset] text-white select-none space-y-3"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/90 font-bold">
              Control Center
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Lock Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                closeControlCenter();
                useSessionStore.getState().lock();
              }}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#1a1c26] hover:bg-[#252836] px-3 py-1 text-[11px] font-medium text-white transition-all cursor-pointer"
              title="Lock System"
            >
              <Lock className="h-3 w-3" />
              <span>Lock</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                closeControlCenter();
              }}
              className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Section 1: Solid Tactile Monochrome Connectivity Matrix (2x2) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Wi-Fi Card */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleWifi();
            }}
            className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] border ${
              isWifiEnabled
                ? 'bg-white text-black font-semibold border-white shadow-md'
                : 'bg-[#181922] hover:bg-[#20222e] text-white/70 border-white/[0.08]'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isWifiEnabled
                  ? 'bg-black/10 text-black'
                  : 'bg-[#252736] text-white/60'
              }`}
            >
              {isWifiEnabled ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Wi-Fi</div>
              <div className="truncate text-[10px] opacity-80 mt-0.5 font-mono">
                {isWifiEnabled ? (navigator.onLine ? 'Connected' : 'Offline') : 'Off'}
              </div>
            </div>
          </button>

          {/* Bluetooth Card */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleBluetooth();
            }}
            className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] border ${
              isBluetoothEnabled
                ? 'bg-white text-black font-semibold border-white shadow-md'
                : 'bg-[#181922] hover:bg-[#20222e] text-white/70 border-white/[0.08]'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isBluetoothEnabled
                  ? 'bg-black/10 text-black'
                  : 'bg-[#252736] text-white/60'
              }`}
            >
              <Bluetooth className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Bluetooth</div>
              <div className="truncate text-[10px] opacity-80 mt-0.5 font-mono">
                {isBluetoothEnabled ? 'Ready' : 'Off'}
              </div>
            </div>
          </button>

          {/* Host Bridge / FlowDrop Card */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleAirBridge();
              useFlowDropStore.getState().openFlowDrop();
              closeControlCenter();
            }}
            className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] border ${
              isAirBridgeActive
                ? 'bg-white text-black font-semibold border-white shadow-md'
                : 'bg-[#181922] hover:bg-[#20222e] text-white/70 border-white/[0.08]'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isAirBridgeActive
                  ? 'bg-black/10 text-black'
                  : 'bg-[#252736] text-white/60'
              }`}
            >
              <UploadCloud className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Host Bridge</div>
              <div className="truncate text-[10px] opacity-80 mt-0.5 font-mono">
                {isAirBridgeActive ? 'Drop Ready' : 'Paused'}
              </div>
            </div>
          </button>

          {/* Focus / Do Not Disturb Card */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleFocusMode();
            }}
            className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] border ${
              isFocusMode
                ? 'bg-white text-black font-semibold border-white shadow-md'
                : 'bg-[#181922] hover:bg-[#20222e] text-white/70 border-white/[0.08]'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isFocusMode
                  ? 'bg-black/10 text-black'
                  : 'bg-[#252736] text-white/60'
              }`}
            >
              <Moon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Focus</div>
              <div className="truncate text-[10px] opacity-80 mt-0.5 font-mono">
                {isFocusMode ? 'Do Not Disturb' : 'Off'}
              </div>
            </div>
          </button>
        </div>

        {/* Section 2: Solid Hardware Sliders (Crisp High-Contrast) */}
        <div className="space-y-2">
          {/* Display Brightness Slider */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#181922] p-3">
            <Sun className="h-4 w-4 shrink-0 text-white/80 ml-0.5" />
            <div className="relative flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-center text-[10px] font-mono text-white/80 mb-1.5 font-medium">
                <span>Display Brightness</span>
                <span className="font-bold text-white">{Math.round(brightness * 100)}%</span>
              </div>
              <div className="relative h-2.5 w-full rounded-full bg-[#282a36] overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-75 shadow-sm"
                  style={{ width: `${Math.round(brightness * 100)}%` }}
                />
                <input
                  type="range"
                  min="0.35"
                  max="1.0"
                  step="0.01"
                  value={brightness}
                  onChange={(e) => setBrightness(parseFloat(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                />
              </div>
            </div>

            {/* Night Shift Quick Pill */}
            <button
              onClick={() => {
                soundEngine.playClick();
                toggleNightShift();
              }}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-medium border transition-all cursor-pointer shrink-0 ${
                isNightShift
                  ? 'bg-white text-black border-white font-semibold shadow-sm'
                  : 'bg-[#252736] text-white/80 border-white/10 hover:bg-[#303344] hover:text-white'
              }`}
              title="Warm color temperature"
            >
              <Moon className="h-3 w-3" />
              <span>Night</span>
            </button>
          </div>

          {/* Master Volume Slider */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#181922] p-3">
            {isMuted ? (
              <VolumeX className="h-4 w-4 shrink-0 text-white/40 ml-0.5" />
            ) : (
              <Volume2 className="h-4 w-4 shrink-0 text-white/80 ml-0.5" />
            )}
            <div className="relative flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-center text-[10px] font-mono text-white/80 mb-1.5 font-medium">
                <span>Master Volume</span>
                <span className="font-bold text-white">{isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}</span>
              </div>
              <div className="relative h-2.5 w-full rounded-full bg-[#282a36] overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-75 shadow-sm"
                  style={{ width: `${isMuted ? 0 : Math.round(volume * 100)}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (isMuted && val > 0) setMuted(false);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                />
              </div>
            </div>

            {/* Mute Quick Pill */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setMuted(!isMuted);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-medium border transition-all cursor-pointer shrink-0 ${
                isMuted
                  ? 'bg-white text-black border-white font-semibold shadow-sm'
                  : 'bg-[#252736] text-white/80 border-white/10 hover:bg-[#303344] hover:text-white'
              }`}
              title="Mute system sound"
            >
              <VolumeX className="h-3 w-3" />
              <span>Mute</span>
            </button>
          </div>
        </div>

        {/* Section 3: High-Frequency Quick Utilities (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Stage Manager Toggle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleStageManager();
            }}
            className={`flex items-center gap-2.5 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] border ${
              isStageManagerEnabled
                ? 'bg-white text-black font-semibold border-white shadow-md'
                : 'bg-[#181922] hover:bg-[#20222e] text-white/70 border-white/[0.08]'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isStageManagerEnabled
                  ? 'bg-black/10 text-black'
                  : 'bg-[#252736] text-white/60'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Stage Mgr</div>
              <div className="truncate text-[10px] opacity-80 mt-0.5 font-mono">
                {isStageManagerEnabled ? 'Active' : 'Off'}
              </div>
            </div>
          </button>

          {/* AI Copilot Toggle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleCopilot();
              closeControlCenter();
            }}
            className={`flex items-center gap-2.5 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] border ${
              isCopilotOpen
                ? 'bg-white text-black font-semibold border-white shadow-md'
                : 'bg-[#181922] hover:bg-[#20222e] text-white/70 border-white/[0.08]'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isCopilotOpen
                  ? 'bg-black/10 text-black'
                  : 'bg-[#252736] text-white/60'
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">AI Copilot</div>
              <div className="truncate text-[10px] opacity-80 mt-0.5 font-mono">
                {isCopilotOpen ? 'Open' : 'Ready'}
              </div>
            </div>
          </button>

          {/* Theme Quick Toggle (Dark / Light) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setTheme(themeId === 'dark' ? 'light' : 'dark');
            }}
            className="flex items-center gap-2.5 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] bg-[#181922] hover:bg-[#20222e] text-white/70 border border-white/[0.08]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#252736] text-white/70">
              {themeId === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Appearance</div>
              <div className="truncate text-[10px] opacity-80 mt-0.5 font-mono capitalize">
                {themeId}
              </div>
            </div>
          </button>

          {/* Power / Performance Mode */}
          <button
            onClick={() => {
              soundEngine.playClick();
            }}
            className="flex items-center gap-2.5 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] bg-[#181922] hover:bg-[#20222e] text-white/70 border border-white/[0.08]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#252736] text-white/70">
              <BatteryCharging className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Power Mode</div>
              <div className="truncate text-[10px] opacity-80 mt-0.5 font-mono">
                Max Performance
              </div>
            </div>
          </button>
        </div>

        {/* Section 4: Now Playing Media Controller */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#181922] p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#252736] text-white border border-white/10">
            <Disc3 className={`h-5 w-5 ${isPlaying ? 'animate-spin' : ''}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-white">
              {currentTrack?.title || 'No track playing'}
            </div>
            <div className="truncate text-[10px] text-white/60 font-mono">
              {currentTrack?.artist || 'Onyx Audio Engine'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                soundEngine.playClick();
                togglePlay();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform cursor-pointer shadow-sm"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 fill-black" /> : <Play className="h-3.5 w-3.5 fill-black ml-0.5" />}
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                nextTrack();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#252736] hover:bg-[#323546] text-white transition-colors cursor-pointer border border-white/10"
              title="Next Track"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Section 5: Acoustic Soundscapes & Lo-Fi Noise */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#181922] p-3 space-y-2.5">
          {/* Keyboard Soundscapes */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-white mb-1.5">
              <div className="flex items-center gap-1.5">
                <Keyboard className="h-4 w-4 text-white/70" />
                <span>Keyboard Acoustics</span>
              </div>
              <span className="text-[10px] font-mono text-white/70 uppercase">
                {audioTheme}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#101117] border border-white/[0.06]">
              {(
                [
                  { id: 'mechanical', label: 'Mechanical' },
                  { id: 'nothing', label: 'Nothing' },
                  { id: 'retro', label: 'Retro' },
                  { id: 'silent', label: 'Mute' },
                ] as const
              ).map((t) => {
                const active = audioTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setAudioTheme(t.id);
                      if (t.id !== 'silent') {
                        setTimeout(() => soundEngine.playKeypress('a'), 20);
                      }
                    }}
                    className={`py-1 rounded-lg text-center text-[10px] font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lo-Fi Ambient Noise */}
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs font-semibold text-white mb-1.5">
              <div className="flex items-center gap-1.5">
                <Headphones className="h-4 w-4 text-white/70" />
                <span>Lo-Fi Ambient Noise</span>
              </div>
              <span className="text-[10px] font-mono text-white/70 uppercase">
                {ambientTrack}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: 'rain', label: 'Rain', icon: CloudRain },
                  { id: 'campfire', label: 'Campfire', icon: Flame },
                  { id: 'white_noise', label: 'Noise', icon: Radio },
                  { id: 'deep_space', label: 'Space', icon: Orbit },
                ] as const
              ).map((preset) => {
                const Icon = preset.icon;
                const active = ambientTrack === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      soundEngine.playClick();
                      if (active) {
                        ambientSoundEngine.stop();
                        setAmbientTrack('none');
                      } else {
                        ambientSoundEngine.play(preset.id);
                        setAmbientTrack(preset.id);
                      }
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      active
                        ? 'bg-white text-black border-white shadow-sm font-semibold'
                        : 'bg-[#12131a] text-white/70 border-white/[0.06] hover:bg-[#20222e] hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[10px]">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Build Info */}
        <div className="flex items-center justify-between px-1 font-mono text-[9px] text-white/40 pt-0.5">
          <span>Onyx OS 2.0 • Solid Slate</span>
          <span>Kernel Active</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
