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
  Keyboard,
  X,
  Shapes,
  Lock,
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

  // Appearance & Personalization Customization
  const iconShape = useThemeStore((s) => s.iconShape);
  const setIconShape = useThemeStore((s) => s.setIconShape);
  const windowMaterial = useThemeStore((s) => s.windowMaterial);
  const setWindowMaterial = useThemeStore((s) => s.setWindowMaterial);
  const windowOpacity = useThemeStore((s) => s.windowOpacity);
  const setWindowOpacity = useThemeStore((s) => s.setWindowOpacity);

  const currentTrack = tracks[currentTrackIndex] ?? tracks[0];
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
        className="fixed top-11 right-3 z-[9500] w-[380px] max-h-[92vh] overflow-y-auto no-scrollbar rounded-[28px] border border-white/[0.12] bg-[#0c0e17]/85 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-3xl text-white select-none space-y-3.5"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-white/80">
              Control Center
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                closeControlCenter();
                useSessionStore.getState().lock();
              }}
              className="flex items-center gap-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-white/70 hover:text-white transition-all cursor-pointer"
              title="Lock System (Ctrl+Alt+L)"
            >
              <Lock className="h-3 w-3" />
              <span>Lock</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                closeControlCenter();
              }}
              className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Section 1: Tactile Apple Bento Grid Connectivity */}
        <div className="grid grid-cols-2 gap-2">
          {/* Wi-Fi Card */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleWifi();
            }}
            className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] ${
              isWifiEnabled
                ? 'bg-[#007AFF] text-white shadow-[0_4px_16px_rgba(0,122,255,0.35)]'
                : 'bg-white/[0.05] hover:bg-white/[0.09] text-white/70 border border-white/[0.06]'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isWifiEnabled
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              {isWifiEnabled ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Wi-Fi</div>
              <div className="truncate text-[11px] opacity-80 mt-0.5">
                {isWifiEnabled ? (navigator.onLine ? 'Connected' : 'No Internet') : 'Off'}
              </div>
            </div>
          </button>

          {/* Bluetooth Card */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleBluetooth();
            }}
            className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] ${
              isBluetoothEnabled
                ? 'bg-[#5856D6] text-white shadow-[0_4px_16px_rgba(88,86,214,0.35)]'
                : 'bg-white/[0.05] hover:bg-white/[0.09] text-white/70 border border-white/[0.06]'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isBluetoothEnabled
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              <Bluetooth className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Bluetooth</div>
              <div className="truncate text-[11px] opacity-80 mt-0.5">
                {isBluetoothEnabled ? 'Ready' : 'Off'}
              </div>
            </div>
          </button>

          {/* Host Bridge / FlowDrop */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleAirBridge();
              useFlowDropStore.getState().openFlowDrop();
              closeControlCenter();
            }}
            className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] ${
              isAirBridgeActive
                ? 'bg-[#34C759] text-white shadow-[0_4px_16px_rgba(52,199,89,0.35)]'
                : 'bg-white/[0.05] hover:bg-white/[0.09] text-white/70 border border-white/[0.06]'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isAirBridgeActive
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              <UploadCloud className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Host Bridge</div>
              <div className="truncate text-[11px] opacity-80 mt-0.5">
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
            className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] ${
              isFocusMode
                ? 'bg-[#AF52DE] text-white shadow-[0_4px_16px_rgba(175,82,222,0.35)]'
                : 'bg-white/[0.05] hover:bg-white/[0.09] text-white/70 border border-white/[0.06]'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isFocusMode
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              <Moon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Focus Mode</div>
              <div className="truncate text-[11px] opacity-80 mt-0.5">
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
            className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] ${
              isStageManagerEnabled
                ? 'bg-[#0EA5E9] text-white shadow-[0_4px_16px_rgba(14,165,233,0.35)]'
                : 'bg-white/[0.05] hover:bg-white/[0.09] text-white/70 border border-white/[0.06]'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isStageManagerEnabled
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Stage Mgr</div>
              <div className="truncate text-[11px] opacity-80 mt-0.5">
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
            className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left cursor-pointer active:scale-[0.98] ${
              isCopilotOpen
                ? 'bg-gradient-to-br from-[#FF2D55] to-[#FF375F] text-white shadow-[0_4px_16px_rgba(255,45,85,0.35)]'
                : 'bg-white/[0.05] hover:bg-white/[0.09] text-white/70 border border-white/[0.06]'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isCopilotOpen
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">AI Copilot</div>
              <div className="truncate text-[11px] opacity-80 mt-0.5">
                {isCopilotOpen ? 'Active (Ctrl+J)' : 'Ready'}
              </div>
            </div>
          </button>
        </div>

        {/* Section 2: Authentic Apple Capsule Sliders (Brightness & Sound) */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 space-y-3">
          {/* Display Brightness Capsule Slider */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 h-10 rounded-xl bg-white/[0.08] overflow-hidden flex items-center">
              {/* Fill Track */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-200 transition-all pointer-events-none rounded-xl"
                style={{ width: `${brightness * 100}%` }}
              />

              {/* Inside Content */}
              <div className="relative z-10 flex w-full items-center justify-between px-3 pointer-events-none">
                <div className="flex items-center gap-2">
                  <Sun className={`h-4 w-4 ${brightness > 0.4 ? 'text-black/80' : 'text-amber-400'}`} />
                  <span className={`text-xs font-semibold ${brightness > 0.4 ? 'text-black/90' : 'text-white/90'}`}>
                    Brightness
                  </span>
                </div>
                <span className={`font-mono text-xs font-semibold ${brightness > 0.4 ? 'text-black/80' : 'text-white/70'}`}>
                  {Math.round(brightness * 100)}%
                </span>
              </div>

              {/* Range Input Overlay */}
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.01"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
              />
            </div>

            {/* Night Shift Quick Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                toggleNightShift();
              }}
              className={`flex h-10 px-3 items-center gap-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isNightShift
                  ? 'border-amber-400/50 bg-amber-500/25 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'border-white/[0.08] bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white'
              }`}
              title="Night Shift Warmth Filter"
            >
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Night</span>
            </button>
          </div>

          {/* Sound Volume Capsule Slider */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 h-10 rounded-xl bg-white/[0.08] overflow-hidden flex items-center">
              {/* Fill Track */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-300 transition-all pointer-events-none rounded-xl"
                style={{ width: isMuted ? '0%' : `${volume * 100}%` }}
              />

              {/* Inside Content */}
              <div className="relative z-10 flex w-full items-center justify-between px-3 pointer-events-none">
                <div className="flex items-center gap-2">
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Volume2 className={`h-4 w-4 ${volume > 0.4 ? 'text-black/80' : 'text-blue-400'}`} />
                  )}
                  <span className={`text-xs font-semibold ${!isMuted && volume > 0.4 ? 'text-black/90' : 'text-white/90'}`}>
                    Volume
                  </span>
                </div>
                <span className={`font-mono text-xs font-semibold ${!isMuted && volume > 0.4 ? 'text-black/80' : 'text-white/70'}`}>
                  {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
                </span>
              </div>

              {/* Range Input Overlay */}
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
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
              />
            </div>

            {/* Mute Toggle Quick Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setMuted(!isMuted);
              }}
              className={`flex h-10 px-3 items-center justify-center rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isMuted
                  ? 'border-rose-500/50 bg-rose-500/25 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  : 'border-white/[0.08] bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white'
              }`}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>

        {/* Section 3: Appearance & Window Customization Studio */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
              <Shapes className="h-4 w-4 text-cyan-400" />
              <span>Icon Geometry & Materiality</span>
            </div>
          </div>

          {/* Icon Shape iOS Segmented Picker */}
          <div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-white/50 mb-1.5">
              Icon Geometry
            </div>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.06]">
              {(
                [
                  { id: 'squircle', label: 'Squircle' },
                  { id: 'circle', label: 'Circle' },
                  { id: 'rounded', label: 'Rounded' },
                  { id: 'smooth', label: 'Pebble' },
                ] as const
              ).map((shape) => {
                const active = iconShape === shape.id;
                return (
                  <button
                    key={shape.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setIconShape(shape.id);
                    }}
                    className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 border-2 border-current ${
                        shape.id === 'squircle'
                          ? 'rounded-[22.5%]'
                          : shape.id === 'circle'
                          ? 'rounded-full'
                          : shape.id === 'rounded'
                          ? 'rounded-sm'
                          : 'rounded-md'
                      }`}
                    />
                    <span>{shape.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Window Surface Style iOS Segmented Picker */}
          <div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-white/50 mb-1.5">
              Window Surface Style
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.06]">
              {(
                [
                  { id: 'glass', label: 'Glass Blur' },
                  { id: 'solid', label: 'Full Solid' },
                  { id: 'translucent', label: 'Translucent' },
                ] as const
              ).map((mat) => {
                const active = windowMaterial === mat.id;
                return (
                  <button
                    key={mat.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setWindowMaterial(mat.id);
                    }}
                    className={`py-1.5 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                      active
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {mat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Window Opacity Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-white/60 mb-1">
              <span>Window Opacity</span>
              <span className="font-mono text-[10px] text-white/90">
                {Math.round(windowOpacity * 100)}%
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full"
                style={{ width: `${windowOpacity * 100}%` }}
              />
              <input
                type="range"
                min="0.55"
                max="1.0"
                step="0.05"
                value={windowOpacity}
                onChange={(e) => setWindowOpacity(parseFloat(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Acoustic Soundscapes & Lo-Fi Noise */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 space-y-2.5">
          {/* Keyboard Acoustics */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-white/90 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Keyboard className="h-4 w-4 text-blue-400" />
                <span>Keyboard Soundscapes</span>
              </div>
              <span className="text-[10px] font-semibold uppercase text-blue-400">
                {audioTheme}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.06]">
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
                    className={`py-1 rounded-lg text-center text-[11px] font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-500 text-white font-semibold shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lo-Fi Ambient Soundscapes */}
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                <Headphones className="h-4 w-4 text-emerald-400" />
                <span>Lo-Fi Ambient Noise</span>
              </div>
              {ambientTrack !== 'none' && (
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Playing</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'rain', label: 'Rain', icon: CloudRain },
                { id: 'campfire', label: 'Campfire', icon: Flame },
                { id: 'white_noise', label: 'Noise', icon: Radio },
                { id: 'deep_space', label: 'Cosmos', icon: Orbit },
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
                    className={`flex flex-col items-center gap-1.5 rounded-xl border py-2 px-1 transition-all text-center cursor-pointer active:scale-95 ${
                      isActive
                        ? 'border-emerald-500/60 bg-emerald-500/25 text-emerald-300 font-semibold shadow-[0_0_16px_rgba(52,199,89,0.3)]'
                        : 'border-white/[0.06] bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {ambientTrack !== 'none' && (
              <div className="flex items-center gap-2 pt-2.5 mt-2 border-t border-white/[0.06]">
                <span className="text-[10px] text-white/60">Volume</span>
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
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-400"
                />
                <span className="font-mono text-[10px] text-white/70 min-w-[28px] text-right">
                  {Math.round(ambientVol * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Now Playing Dynamic Music Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/50 border border-white/15 text-white shadow-md overflow-hidden">
              <Disc3 className={`h-6 w-6 ${isPlaying ? 'animate-spin text-cyan-400' : 'text-white/60'}`} />
            </div>

            <div className="min-w-0 leading-tight">
              <div className="truncate text-xs font-semibold text-white">
                {currentTrack ? currentTrack.title : 'No track playing'}
              </div>
              <div className="truncate text-[11px] text-white/50 mt-0.5">
                {currentTrack ? currentTrack.artist : 'Audio queue idle'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentTrack) togglePlay();
              }}
              disabled={!currentTrack}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-30 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={() => {
                if (currentTrack) nextTrack();
              }}
              disabled={!currentTrack}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30 cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Section 6: Minimalist Status Footer */}
        <div className="flex items-center justify-between px-1 pt-0.5 text-[11px] text-white/50">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <BatteryCharging className="h-3.5 w-3.5" />
            <span>High Performance Mode</span>
          </div>
          <span className="font-semibold text-white/40">FlowOS 2.0</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
