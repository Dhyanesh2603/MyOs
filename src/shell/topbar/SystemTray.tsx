import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Sun,
  Moon,
  Bell,
  Volume2,
  VolumeX,
  Calendar as CalendarIcon,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useThemeStore } from '@core/theme/themeStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { useSoundStore, soundEngine } from '@core/audio/soundEngine';
import { useControlCenterStore } from '@core/system/controlCenterStore';
import { useCopilotStore } from '@core/copilot/copilotStore';

export const SystemTray: React.FC = () => {
  const { themeId, setTheme } = useThemeStore();
  const { toggleCenter, notifications } = useNotificationStore();
  const { isMuted, setMuted } = useSoundStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);

  // Time & Date ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Web Battery API
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((battery: { level: number; charging: boolean; addEventListener: (type: string, fn: () => void) => void }) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {
        setBatteryLevel(100);
      });
    } else {
      setBatteryLevel(100);
    }
  }, []);

  // Outside click for calendar popover
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [showCalendar]);

  const toggleTheme = () => {
    setTheme(themeId === 'dark' ? 'light' : 'dark');
  };

  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentDay = now.getDate();

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Sound Volume Control */}
      <button
        onClick={() => {
          const nextMuted = !isMuted;
          setMuted(nextMuted);
          if (!nextMuted) soundEngine.playClick();
        }}
        title={isMuted ? 'Unmute System' : 'Mute System'}
        className="rounded p-1 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
      >
        {isMuted ? (
          <VolumeX className="h-3.5 w-3.5 text-rose-400" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Network Indicator */}
      <div
        title={isOnline ? 'Network Connected (Wi-Fi)' : 'Network Offline'}
        className="flex items-center text-content-secondary"
      >
        {isOnline ? (
          <Wifi className="h-3.5 w-3.5 text-content-secondary" />
        ) : (
          <WifiOff className="h-3.5 w-3.5 text-rose-400" />
        )}
      </div>

      {/* Battery Indicator */}
      <div
        title={`Battery: ${batteryLevel ?? 100}% ${isCharging ? '(Charging)' : ''}`}
        className="flex items-center gap-1 text-content-secondary"
      >
        {isCharging ? (
          <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Battery className="h-3.5 w-3.5" />
        )}
        <span className="font-mono text-[10px] hidden sm:inline">
          {batteryLevel ?? 100}%
        </span>
      </div>

      {/* Theme Quick Toggle */}
      <button
        onClick={toggleTheme}
        title={`Switch to ${themeId === 'dark' ? 'Light' : 'Dark'} Mode`}
        className="rounded p-1 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
      >
        {themeId === 'dark' ? (
          <Sun className="h-3.5 w-3.5 text-amber-400" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-indigo-400" />
        )}
      </button>

      {/* Notification Center Trigger */}
      <button
        onClick={toggleCenter}
        title="Notification Center"
        className="relative rounded p-1 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
      >
        <Bell className="h-3.5 w-3.5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-accent-primary animate-pulse" />
        )}
      </button>

      {/* AI Copilot Trigger */}
      <button
        onClick={() => {
          soundEngine.playClick();
          useCopilotStore.getState().toggleCopilot();
        }}
        title="FlowOS Copilot (Ctrl+J)"
        className="relative rounded p-1 text-content-secondary hover:bg-surface-subtle hover:text-accent-primary transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
      </button>

      {/* Control Center Trigger */}
      <button
        data-control-center-trigger
        onClick={() => {
          soundEngine.playClick();
          useControlCenterStore.getState().toggleControlCenter();
        }}
        title="Control Center"
        className="relative rounded p-1 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
      </button>

      {/* Live Date & Clock with Popover Calendar */}
      <div ref={calendarRef} className="relative">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className={`flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-xs transition-colors ${
            showCalendar
              ? 'bg-surface-subtle text-accent-primary font-medium'
              : 'text-content-primary hover:bg-surface-subtle/50'
          }`}
        >
          <span className="hidden md:inline text-content-tertiary">{dateStr}</span>
          <span className="font-medium">{timeStr}</span>
        </button>

        {showCalendar && (
          <div className="absolute right-0 top-8 z-[9500] w-64 rounded-2xl border border-border-subtle bg-surface-panel/95 p-4 text-xs text-content-primary shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-accent-primary" />
                <span className="font-semibold text-content-primary">{currentMonth}</span>
              </div>
              <span className="font-mono text-[10px] text-content-tertiary">FlowOS Calendar</span>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-content-tertiary mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Calendar Numbers Grid */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
              {Array.from({ length: 31 }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === currentDay;
                return (
                  <div
                    key={i}
                    className={`h-6 w-6 mx-auto flex items-center justify-center rounded-full transition-colors ${
                      isToday
                        ? 'bg-accent-primary text-white font-bold shadow-sm'
                        : 'text-content-secondary hover:bg-surface-subtle'
                    }`}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-2 border-t border-border-subtle/60 flex items-center justify-between font-mono text-[10px] text-content-tertiary">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Kernel Normal</span>
              </div>
              <span>UTC+5:30</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
