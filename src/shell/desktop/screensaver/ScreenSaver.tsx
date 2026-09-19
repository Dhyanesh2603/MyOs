import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useScreenSaverStore } from './screenSaverStore';

export const ScreenSaver: React.FC = () => {
  const { isActive, deactivate, activate } = useScreenSaverStore();
  const [time, setTime] = useState(new Date());

  // Clock ticker
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Idle detector (activates after 3.5 minutes of no mouse/keyboard interaction)
  useEffect(() => {
    let idleTimer: number;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        activate();
      }, 1000 * 60 * 3.5); // 3.5 minutes
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [activate]);

  // Dismiss on any input
  useEffect(() => {
    if (!isActive) return;

    const handleDismiss = () => {
      deactivate();
    };

    window.addEventListener('mousemove', handleDismiss);
    window.addEventListener('mousedown', handleDismiss);
    window.addEventListener('keydown', handleDismiss);

    return () => {
      window.removeEventListener('mousemove', handleDismiss);
      window.removeEventListener('mousedown', handleDismiss);
      window.removeEventListener('keydown', handleDismiss);
    };
  }, [isActive, deactivate]);

  if (!isActive) return null;

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  const dateStr = time.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9800] flex flex-col items-center justify-center bg-black/95 text-white select-none backdrop-blur-3xl cursor-none"
      >
        {/* Subtle breathing ambient glow */}
        <div className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px] animate-pulse" />

        <div className="relative flex flex-col items-center space-y-4">
          {/* Typographic Large Time */}
          <div className="flex items-baseline font-mono text-8xl sm:text-9xl font-extralight tracking-tighter text-white">
            <span>{hours}</span>
            <span className="text-accent animate-pulse mx-1">:</span>
            <span>{minutes}</span>
            <span className="text-3xl sm:text-4xl text-white/40 ml-2 font-light">
              {seconds}
            </span>
          </div>

          {/* Date & Nothing OS Red Dot */}
          <div className="flex items-center gap-3 font-mono text-sm sm:text-base tracking-widest uppercase text-white/70">
            <span className="h-2 w-2 rounded-full bg-[#d71921] animate-ping" />
            <span>{dateStr}</span>
          </div>

          <div className="pt-8 text-[11px] font-mono text-white/30 tracking-widest uppercase">
            Press any key to wake
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
