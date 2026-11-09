import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wifi, WifiOff, BatteryCharging, Battery, Timer } from 'lucide-react';
import { useControlCenterStore } from '@core/system/controlCenterStore';
import { useMediaStore } from '@core/media/mediaStore';
import { usePomodoroStore } from '@core/focus/pomodoroStore';
import { soundEngine } from '@core/audio/soundEngine';

export const DynamicIsland: React.FC = () => {
  const toggleControlCenter = useControlCenterStore((s) => s.toggleControlCenter);
  const { isPlaying, tracks, currentTrackIndex } = useMediaStore();
  const { isRunning: isPomoRunning, timeLeft } = usePomodoroStore();
  const currentTrack = tracks[currentTrackIndex] ?? tracks[0];

  const [timeStr, setTimeStr] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);

  // Time updater
  useEffect(() => {
    const update = () => {
      setTimeStr(
        new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Online / Offline
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Battery API
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((b: any) => {
        setBatteryLevel(Math.round(b.level * 100));
        setIsCharging(b.charging);
        b.addEventListener('levelchange', () => setBatteryLevel(Math.round(b.level * 100)));
        b.addEventListener('chargingchange', () => setIsCharging(b.charging));
      }).catch(() => setBatteryLevel(100));
    } else {
      setBatteryLevel(100);
    }
  }, []);

  const hasMedia = isPlaying && !!currentTrack;
  const pomoMins = Math.floor(timeLeft / 60);
  const pomoSMax = timeLeft % 60;
  const pomoFormatted = `${String(pomoMins).padStart(2, '0')}:${String(pomoSMax).padStart(2, '0')}`;

  return (
    <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-[9000] pointer-events-auto select-none">
      <motion.button
        layout
        data-control-center-trigger="true"
        data-dynamic-island="true"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => {
          soundEngine.playClick();
          toggleControlCenter();
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
        className="flex h-7 items-center gap-2 rounded-full border border-white/15 bg-black/75 px-3 py-1 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl hover:border-white/30 hover:bg-black/85 transition-colors cursor-pointer group"
        title="Dynamic Island (Click to open Control Center)"
      >
        {/* Dynamic Activity: Media Playing or Pomodoro Timer */}
        {hasMedia ? (
          <div className="flex items-center gap-1.5 max-w-[140px] truncate">
            <div className="flex items-end gap-0.5 h-2.5 shrink-0">
              <span className="w-0.5 bg-emerald-400 animate-[bounce_1s_infinite_100ms] h-2.5 rounded-full" />
              <span className="w-0.5 bg-emerald-400 animate-[bounce_1s_infinite_300ms] h-3 rounded-full" />
              <span className="w-0.5 bg-emerald-400 animate-[bounce_1s_infinite_200ms] h-1.5 rounded-full" />
            </div>
            <span className="text-[11px] font-medium text-white truncate">
              {currentTrack.title}
            </span>
          </div>
        ) : isPomoRunning ? (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-400 font-bold">
            <Timer className="h-3 w-3 animate-spin" />
            <span>{pomoFormatted}</span>
          </div>
        ) : null}

        {/* Separator if activity is visible */}
        {(hasMedia || isPomoRunning) && (
          <div className="h-3 w-[1px] bg-white/20 shrink-0" />
        )}

        {/* Minimalist Clock */}
        <span className="font-mono text-xs font-semibold text-white/90 tracking-tight">
          {timeStr}
        </span>

        {/* Telemetry Micro Pips (Wi-Fi & Battery) */}
        <div className="flex items-center gap-1.5 text-white/70">
          {isOnline ? (
            <Wifi className="h-3 w-3 text-white/70" />
          ) : (
            <WifiOff className="h-3 w-3 text-rose-400" />
          )}

          <div className="flex items-center gap-0.5">
            {isCharging ? (
              <BatteryCharging className="h-3 w-3 text-emerald-400" />
            ) : (
              <Battery className="h-3 w-3 text-white/70" />
            )}
            <span className="font-mono text-[10px] text-white/60 hidden sm:inline">
              {batteryLevel ?? 100}%
            </span>
          </div>
        </div>
      </motion.button>
    </div>
  );
};
