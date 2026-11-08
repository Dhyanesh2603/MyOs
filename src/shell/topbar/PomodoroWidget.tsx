import React, { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Sparkles } from 'lucide-react';
import { usePomodoroStore, PomodoroMode } from '@core/focus/pomodoroStore';
import { soundEngine } from '@core/audio/soundEngine';

export const PomodoroWidget: React.FC = () => {
  const {
    mode,
    timeLeft,
    isRunning,
    cyclesCompleted,
    showPopover,
    toggle,
    reset,
    setMode,
    togglePopover,
    setShowPopover,
    tick,
  } = usePomodoroStore();

  const popoverRef = useRef<HTMLDivElement>(null);

  // 1-second ticker
  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // Click outside to close popover
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    if (showPopover) {
      window.addEventListener('mousedown', handleOutside);
    }
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [showPopover, setShowPopover]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const modeLabels: Record<PomodoroMode, string> = {
    focus: 'Focus',
    break: 'Break',
    long_break: 'Rest',
  };

  return (
    <div ref={popoverRef} className="relative flex items-center">
      {/* Top Bar Trigger Button */}
      <button
        onClick={() => {
          soundEngine.playClick();
          togglePopover();
        }}
        title="Pomodoro Focus Timer"
        className={`flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-xs transition-colors ${
          showPopover
            ? 'bg-surface-subtle text-accent-primary font-medium'
            : isRunning
              ? 'bg-surface-subtle/80 text-emerald-400 font-medium'
              : 'text-content-secondary hover:bg-surface-subtle hover:text-content-primary'
        }`}
      >
        <Timer className={`h-3 w-3 ${isRunning ? 'animate-pulse text-emerald-400' : 'text-accent-primary'}`} />
        <span className="hidden sm:inline text-[10px] text-content-tertiary">[{modeLabels[mode]}]</span>
        <span className="tracking-tight">{formattedTime}</span>
        {isRunning && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
      </button>

      {/* Popover Card */}
      {showPopover && (
        <div className="absolute top-8 right-0 z-[9500] w-64 rounded-2xl border border-border-subtle bg-surface-panel/95 p-4 text-xs text-content-primary shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-3">
            <div className="flex items-center gap-1.5 font-semibold text-content-primary">
              <Timer className="h-4 w-4 text-accent-primary" />
              <span>Pomodoro Focus</span>
            </div>
            <span className="font-mono text-[10px] text-content-tertiary">
              {cyclesCompleted} {cyclesCompleted === 1 ? 'cycle' : 'cycles'}
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-card p-1 border border-border-subtle mb-4">
            {(['focus', 'break', 'long_break'] as PomodoroMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  soundEngine.playClick();
                  setMode(m);
                }}
                className={`rounded-lg py-1 text-[10px] font-medium transition-colors ${
                  mode === m
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-content-tertiary hover:text-content-primary'
                }`}
              >
                {modeLabels[m]}
              </button>
            ))}
          </div>

          {/* Big Time Display */}
          <div className="my-2 text-center">
            <div className="font-mono text-3xl font-bold tracking-tight text-content-primary">
              {formattedTime}
            </div>
            <div className="mt-1 flex items-center justify-center gap-1 font-mono text-[10px] text-content-tertiary">
              <Sparkles className="h-3 w-3 text-accent-primary" />
              <span>{isRunning ? 'Deep Work in progress' : 'Paused'}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                toggle();
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 font-medium text-xs shadow-sm transition-opacity ${
                isRunning
                  ? 'bg-surface-subtle text-content-primary hover:bg-surface-subtle/80 border border-border-subtle'
                  : 'bg-accent-primary text-white hover:opacity-90'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                reset();
              }}
              title="Reset Timer"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-surface-card text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
