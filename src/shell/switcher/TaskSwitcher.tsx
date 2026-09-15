import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWindowStore } from '@core/window/windowStore';
import { appRegistry } from '@core/process/registry';
import { AppWindow } from 'lucide-react';

export const TaskSwitcher: React.FC = () => {
  const { windows, focusStack, focusWindow } = useWindowStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter windows in focusStack order (reversed so most recent is first)
  const windowOrder = [...focusStack].reverse();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger with Alt+Tab or Ctrl+Tab
      if ((e.altKey || e.ctrlKey) && e.key === 'Tab') {
        e.preventDefault();

        if (!isOpen) {
          if (windowOrder.length <= 1) return;
          setIsOpen(true);
          setSelectedIndex(1); // Select next window in stack
        } else {
          setSelectedIndex((prev) => {
            const next = e.shiftKey
              ? (prev - 1 + windowOrder.length) % windowOrder.length
              : (prev + 1) % windowOrder.length;
            return next;
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.key === 'Alt' || e.key === 'Control') && isOpen) {
        setIsOpen(false);
        const targetId = windowOrder[selectedIndex];
        if (targetId) {
          focusWindow(targetId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, windowOrder, selectedIndex, focusWindow]);

  if (!isOpen || windowOrder.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-100">
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          className="flex max-w-4xl flex-col items-center rounded-3xl border border-white/15 bg-surface-panel/95 p-5 shadow-2xl backdrop-blur-window"
        >
          <div className="flex items-center gap-3 overflow-x-auto p-2">
            {windowOrder.map((winId, index) => {
              const win = windows[winId];
              if (!win) return null;

              const manifest = appRegistry.get(win.appId);
              const IconComponent = manifest?.icon || AppWindow;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={winId}
                  onClick={() => {
                    focusWindow(winId);
                    setIsOpen(false);
                  }}
                  className={`flex h-36 w-32 flex-col items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'border-accent-primary bg-accent-primary/20 scale-105 shadow-glow'
                      : 'border-white/5 bg-white/5 opacity-70 hover:opacity-90'
                  }`}
                >
                  <div className="flex flex-1 items-center justify-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        isSelected
                          ? 'bg-accent-primary text-white shadow-md'
                          : 'bg-white/10 text-content-secondary'
                      }`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="w-full text-center">
                    <div className="truncate text-xs font-semibold text-content-primary">
                      {win.title}
                    </div>
                    <div className="font-mono text-[9px] text-content-tertiary">
                      z:{win.zIndex}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 font-mono text-[10px] text-content-tertiary">
            Release Alt to switch • Tab / Shift+Tab to navigate
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
