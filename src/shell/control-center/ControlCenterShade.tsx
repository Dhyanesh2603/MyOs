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
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-11 right-3 z-[9500] w-[370px] max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl border border-white/15 bg-[#0a0b10]/90 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)_inset] backdrop-blur-3xl text-white select-none space-y-3.5"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-white/70">
              Control Center
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                closeControlCenter();
                useSessionStore.getState().lock();
              }}
              className="flex items-center gap-1 text-[11px] font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
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
              className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Section 1: Tactical Connectivity Bento Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Wi-Fi Card */}
          <button
            onClick={() => {
              soundEngine.playClick();
              toggleWifi();
            }}
            className={`flex items-center gap-2.5 rounded-2xl p-2.5 border transition-all text-left cursor-pointer ${
              isWifiEnabled
                ? 'bg-blue-600/25 border-blue-500/40 text-white'
                : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isWifiEnabled ? 'bg-blue-500 text-white shadow-md' : 'bg-white/10 text-white/40'
              }`}
            >
              {isWifiEnabled ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Wi-Fi</div>
              <div className="truncate text-[10px] opacity-70">
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
            className={`flex items-center gap-2.5 rounded-2xl p-2.5 border transition-all text-left cursor-pointer ${
              isBluetoothEnabled
                ? 'bg-indigo-600/25 border-indigo-500/40 text-white'
                : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isBluetoothEnabled ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/10 text-white/40'
              }`}
            >
              <Bluetooth className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Bluetooth</div>
              <div className="truncate text-[10px] opacity-70">
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
            className={`flex items-center gap-2.5 rounded-2xl p-2.5 border transition-all text-left cursor-pointer ${
              isAirBridgeActive
                ? 'bg-emerald-600/25 border-emerald-500/40 text-white'
                : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isAirBridgeActive ? 'bg-emerald-500 text-white shadow-md' : 'bg-white/10 text-white/40'
              }`}
            >
              <UploadCloud className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Host Bridge</div>
              <div className="truncate text-[10px] opacity-70">
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
            className={`flex items-center gap-2.5 rounded-2xl p-2.5 border transition-all text-left cursor-pointer ${
              isFocusMode
                ? 'bg-purple-600/25 border-purple-500/40 text-white'
                : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isFocusMode ? 'bg-purple-500 text-white shadow-md' : 'bg-white/10 text-white/40'
              }`}
            >
              <Moon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Focus Mode</div>
              <div className="truncate text-[10px] opacity-70">
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
            className={`flex items-center gap-2.5 rounded-2xl p-2.5 border transition-all text-left cursor-pointer ${
              isStageManagerEnabled
                ? 'bg-cyan-600/25 border-cyan-500/40 text-white'
                : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isStageManagerEnabled ? 'bg-cyan-500 text-white shadow-md' : 'bg-white/10 text-white/40'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">Stage Mgr</div>
              <div className="truncate text-[10px] opacity-70">
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
            className={`flex items-center gap-2.5 rounded-2xl p-2.5 border transition-all text-left cursor-pointer ${
              isCopilotOpen
                ? 'bg-rose-600/25 border-rose-500/40 text-white'
                : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isCopilotOpen ? 'bg-rose-500 text-white shadow-md' : 'bg-white/10 text-white/40'
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-semibold">AI Copilot</div>
              <div className="truncate text-[10px] opacity-70">
                {isCopilotOpen ? 'Active (Ctrl+J)' : 'Ready'}
              </div>
            </div>
          </button>
        </div>

        {/* Section 2: Display & Sound Ergonomic Faders */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-3">
          {/* Display Brightness Fader */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-white/70 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Display Brightness</span>
              </div>
              <span className="font-mono text-[11px] text-white/50">
                {Math.round(brightness * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full"
                  style={{ width: `${brightness * 100}%` }}
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

              <button
                onClick={() => {
                  soundEngine.playClick();
                  toggleNightShift();
                }}
                className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                  isNightShift
                    ? 'border-amber-500/50 bg-amber-500/25 text-amber-300'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
                title="Night Shift Warmth Filter"
              >
                <Flame className="h-3 w-3" />
                <span>Night</span>
              </button>
            </div>
          </div>

          {/* Sound Volume Fader */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-white/70 mb-1.5">
              <div className="flex items-center gap-1.5">
                {isMuted ? (
                  <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-blue-400" />
                )}
                <span>Master Volume</span>
              </div>
              <span className="font-mono text-[11px] text-white/50">
                {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-300 rounded-full"
                  style={{ width: isMuted ? '0%' : `${volume * 100}%` }}
                />
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
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                />
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setMuted(!isMuted);
                }}
                className={`rounded-xl border px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                  isMuted
                    ? 'border-rose-500/40 bg-rose-500/20 text-rose-300'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Appearance & Window Customization Studio */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
              <Shapes className="h-3.5 w-3.5 text-cyan-400" />
              <span>Icon Shape & Window Material</span>
            </div>
            <span className="text-[10px] font-mono text-white/50 capitalize">
              {iconShape} • {windowMaterial}
            </span>
          </div>

          {/* Icon Shape Selector */}
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">
              Icon Geometry
            </div>
            <div className="grid grid-cols-4 gap-1.5">
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
                    className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-white text-black font-semibold border-white shadow-sm'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span
                      className={`h-4 w-4 border border-current ${
                        shape.id === 'squircle'
                          ? 'rounded-[22.5%]'
                          : shape.id === 'circle'
                          ? 'rounded-full'
                          : shape.id === 'rounded'
                          ? 'rounded-md'
                          : 'rounded-xl'
                      }`}
                    />
                    <span>{shape.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Window Material Selector */}
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1.5">
              Window Surface Style
            </div>
            <div className="grid grid-cols-3 gap-1.5">
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
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-medium transition-all text-center cursor-pointer ${
                      active
                        ? 'bg-white text-black font-semibold border-white shadow-sm'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
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
              <span className="font-mono text-[10px] text-white/80">
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
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-2.5">
          {/* Keyboard Acoustics */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-white/80 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Keyboard className="h-3.5 w-3.5 text-blue-400" />
                <span>Keyboard Soundscapes</span>
              </div>
              <span className="font-mono text-[10px] uppercase text-blue-400 font-semibold">
                {audioTheme}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1">
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
                    className={`rounded-xl py-1 text-center font-mono text-[10px] transition-all border cursor-pointer ${
                      active
                        ? 'border-blue-400 bg-blue-500/25 text-blue-200 font-semibold shadow-sm'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
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
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                <Headphones className="h-3.5 w-3.5 text-emerald-400" />
                <span>Lo-Fi Ambient Noise</span>
              </div>
              {ambientTrack !== 'none' && (
                <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Playing</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
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
                    className={`flex flex-col items-center gap-1 rounded-xl border py-1.5 transition-all text-center cursor-pointer ${
                      isActive
                        ? 'border-emerald-500/50 bg-emerald-500/25 text-emerald-300 font-semibold shadow-sm'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="font-mono text-[9px]">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {ambientTrack !== 'none' && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <span className="text-[10px] text-white/50">Volume</span>
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
                <span className="font-mono text-[10px] text-white/60 min-w-[28px] text-right">
                  {Math.round(ambientVol * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Now Playing Dynamic Music Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/40 border border-white/15 text-white shadow-md overflow-hidden">
              <Disc3 className={`h-5 w-5 ${isPlaying ? 'animate-spin' : 'text-white/60'}`} />
            </div>

            <div className="min-w-0 leading-tight">
              <div className="truncate text-xs font-semibold text-white">
                {currentTrack ? currentTrack.title : 'No track playing'}
              </div>
              <div className="truncate text-[10px] text-white/50 mt-0.5">
                {currentTrack ? currentTrack.artist : 'Audio queue idle'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
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
        <div className="flex items-center justify-between px-1 pt-1 text-[10px] font-mono text-white/50">
          <div className="flex items-center gap-1 text-emerald-400">
            <BatteryCharging className="h-3 w-3" />
            <span>Power: High Performance</span>
          </div>
          <span>FlowOS 2.0</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
