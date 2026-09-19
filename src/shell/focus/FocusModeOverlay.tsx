import React, { useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import { soundEngine } from '@core/audio/soundEngine';

export const FocusModeOverlay: React.FC = () => {
  const { focusMode, stopFocusMode, tickFocusTimer } = usePersonalOsStore();

  // Timer interval
  useEffect(() => {
    if (!focusMode.isActive || !focusMode.isTimerRunning) return;
    const interval = setInterval(() => {
      tickFocusTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [focusMode.isActive, focusMode.isTimerRunning, tickFocusTimer]);

  // Escape key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusMode.isActive) {
        soundEngine.playClick();
        stopFocusMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode.isActive, stopFocusMode]);

  if (!focusMode.isActive) return null;

  const minutes = Math.floor(focusMode.timerRemainingSeconds / 60);
  const seconds = focusMode.timerRemainingSeconds % 60;
  const progressPct = Math.max(
    0,
    Math.min(
      100,
      100 - (focusMode.timerRemainingSeconds / (focusMode.targetMinutes * 60)) * 100
    )
  );

  return (
    <div className="fixed inset-0 z-[8800] flex flex-col items-center justify-between bg-[#07090e]/95 p-8 text-neutral-200 backdrop-blur-2xl select-none font-sans animate-fade-in">
      {/* Top Bar */}
      <div className="flex w-full max-w-4xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            Flow OS • Deep Focus Mode
          </span>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            stopFocusMode();
          }}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-3.5 w-3.5" />
          <span>Exit Focus (Esc)</span>
        </button>
      </div>

      {/* Center Focus Area */}
      <div className="flex flex-col items-center text-center max-w-2xl">
        <span className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-neutral-300 mb-6">
          Singular Objective
        </span>

        <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight">
          {focusMode.activeTaskTitle}
        </h1>

        {/* Large Minimal Countdown Timer */}
        <div className="mt-8 font-mono text-7xl sm:text-8xl font-bold tracking-tight text-white tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-72 max-w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center gap-3 font-mono text-xs">
          <button
            onClick={() => {
              soundEngine.playClick();
              stopFocusMode();
            }}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-black hover:bg-neutral-200 transition-all shadow-lg active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Complete Objective</span>
          </button>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="flex items-center gap-6 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{focusMode.targetMinutes}m Sprint Session</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          <span>All system distractions muted</span>
        </div>
      </div>
    </div>
  );
};
