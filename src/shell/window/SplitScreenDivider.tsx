import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GripVertical, X } from 'lucide-react';
import { useSplitScreenStore } from '@core/window/splitScreenStore';
import { useWindowStore } from '@core/window/windowStore';
import { soundEngine } from '@core/audio/soundEngine';

export const SplitScreenDivider: React.FC = () => {
  const { isSplitActive, leftWindowId, rightWindowId, splitRatio, updateRatio, closeSplit } =
    useSplitScreenStore();
  const windows = useWindowStore((state) => state.windows);

  const isDraggingRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-dissolve split if either window was closed or minimized
  useEffect(() => {
    if (!isSplitActive) return;
    if (!leftWindowId || !rightWindowId) {
      closeSplit();
      return;
    }
    const leftWin = windows[leftWindowId];
    const rightWin = windows[rightWindowId];
    if (!leftWin || !rightWin || leftWin.isMinimized || rightWin.isMinimized) {
      closeSplit();
    }
  }, [isSplitActive, leftWindowId, rightWindowId, windows, closeSplit]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    soundEngine.playClick();

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const ratio = moveEvent.clientX / window.innerWidth;
      updateRatio(ratio);
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      soundEngine.playSnap();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [updateRatio]);

  const handleDoubleClick = () => {
    soundEngine.playSnap();
    updateRatio(0.5);
  };

  if (!isSplitActive) return null;

  const leftPercent = Math.round(splitRatio * 100);
  const rightPercent = 100 - leftPercent;

  return (
    <AnimatePresence>
      <div
        style={{ left: `${splitRatio * 100}%` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed top-8 bottom-0 z-[600] -translate-x-1/2 flex items-center justify-center cursor-col-resize select-none"
      >
        {/* Visual 1px Divider Line */}
        <div
          className={`h-full w-px transition-colors ${
            isDragging || isHovered ? 'bg-accent-primary' : 'bg-border-subtle/80'
          }`}
        />

        {/* Floating Center Divider Grip Capsule */}
        <motion.div
          onPointerDown={handlePointerDown}
          onDoubleClick={handleDoubleClick}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`absolute flex items-center gap-1.5 rounded-full border px-2 py-1 shadow-lg backdrop-blur-xl transition-all ${
            isDragging
              ? 'border-accent-primary bg-surface-panel ring-2 ring-accent-primary/40 scale-105'
              : isHovered
              ? 'border-border-strong bg-surface-panel/95 text-content-primary'
              : 'border-border-subtle bg-surface-panel/80 text-content-secondary'
          }`}
        >
          <GripVertical className="h-3 w-3 opacity-60" />

          {/* Ratio indicator */}
          <span className="font-mono text-[10px] tracking-tight">
            {leftPercent}:{rightPercent}
          </span>

          {/* Quick Unsplit button on hover */}
          {(isHovered || isDragging) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeSplit();
              }}
              title="Close Split View"
              className="ml-0.5 rounded-full p-0.5 text-content-tertiary hover:bg-surface-subtle hover:text-rose-400 transition-colors"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </motion.div>

        {/* Quick Snap Hints (33%, 50%, 67%) visible when dragging */}
        {isDragging && (
          <div className="absolute -top-6 rounded bg-surface-panel/90 px-2 py-0.5 font-mono text-[9px] text-accent-primary shadow-sm border border-border-subtle">
            {leftPercent}% / {rightPercent}% • Double-click to reset 50/50
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
