import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSessionStore } from '@core/session/sessionStore';
import { Lock, Unlock, ArrowRight, User } from 'lucide-react';

export const LockScreen: React.FC = () => {
  const { isLocked, userName, unlock } = useSessionStore();
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Live time ticker
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard input when locked
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        setPin((prev) => (prev.length < 4 ? prev + e.key : prev));
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setPin((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleAttemptUnlock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, pin]);

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      handleAttemptUnlock();
    }
  }, [pin]);

  const handleAttemptUnlock = () => {
    const success = unlock(pin);
    if (!success) {
      setHasError(true);
      setTimeout(() => {
        setPin('');
        setHasError(false);
      }, 700);
    } else {
      setPin('');
      setHasError(false);
    }
  };

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  if (!isLocked) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed inset-0 z-[10000] flex flex-col items-center justify-between bg-black/90 p-8 text-white backdrop-blur-2xl select-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(15, 17, 21, 0.95) 0%, rgba(5, 6, 8, 0.98) 100%)',
        }}
      >
        {/* Top Telemetry & Status Stamp */}
        <div className="flex w-full items-center justify-between text-xs font-mono text-white/50">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d71921] shadow-[0_0_8px_#d71921]" />
            <span>FLOW_OS // SECURE_ENCLAVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-white/40" />
            <span>ENCRYPTED</span>
          </div>
        </div>

        {/* Center: Clock & Auth Form */}
        <div className="flex flex-col items-center gap-6">
          {/* Ambient Minimalist Clock */}
          <div className="flex flex-col items-center text-center">
            <div className="font-mono text-7xl font-extralight tracking-tighter text-white sm:text-8xl">
              {timeStr}
            </div>
            <div className="mt-1 font-sans text-sm font-medium tracking-wide text-white/60">
              {dateStr}
            </div>
          </div>

          {/* User Profile Avatar */}
          <div className="flex flex-col items-center gap-2 mt-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
              <User className="h-8 w-8 text-white/80" />
            </div>
            <span className="font-sans text-sm font-semibold tracking-tight text-white">
              {userName}
            </span>
          </div>

          {/* PIN Dots Display */}
          <div
            className={`flex items-center gap-3 transition-transform ${
              hasError ? 'animate-bounce text-rose-500' : ''
            }`}
          >
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`h-3 w-3 rounded-full border transition-all duration-200 ${
                    isFilled
                      ? 'border-accent-primary bg-accent-primary shadow-[0_0_10px_rgba(var(--accent-primary),0.8)] scale-110'
                      : hasError
                      ? 'border-rose-500 bg-rose-500/20'
                      : 'border-white/30 bg-transparent'
                  }`}
                />
              );
            })}
          </div>

          {/* Tactile Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-56 font-mono text-sm">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigitClick(d)}
                className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-medium text-white hover:bg-white/15 active:scale-90 transition-all shadow-sm"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => unlock()}
              title="Quick Bypass"
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[11px] text-white/50 hover:bg-white/15 active:scale-90 transition-all font-sans"
            >
              Skip
            </button>
            <button
              onClick={() => handleDigitClick('0')}
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-medium text-white hover:bg-white/15 active:scale-90 transition-all shadow-sm"
            >
              0
            </button>
            <button
              onClick={() => setPin((prev) => prev.slice(0, -1))}
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs text-white/70 hover:bg-white/15 active:scale-90 transition-all font-sans"
            >
              Del
            </button>
          </div>

          <div className="font-mono text-[10px] text-white/40">
            Default PIN: 1234 • Physical Keyboard Enabled
          </div>
        </div>

        {/* Footer Unlock Button */}
        <button
          onClick={() => unlock()}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-sans text-xs font-medium text-white/80 hover:bg-white/20 active:scale-95 transition-all shadow-lg"
        >
          <Unlock className="h-3.5 w-3.5 text-accent-primary" />
          <span>Unlock FlowOS</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
