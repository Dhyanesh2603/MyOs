import React, { useRef, useState } from 'react';
import {
  motion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import type { AppManifest } from '@contracts/app';
import type { WindowState } from '@contracts/window';
import { useWindowStore } from '@core/window/windowStore';
import { DockHoverPreview } from './DockHoverPreview';
import { IosAppIcon } from '@shell/icons/IosAppIcon';

export interface DockItemProps {
  manifest: AppManifest;
  mouseX: MotionValue<number>;
  isRunning: boolean;
  isFocused: boolean;
  onClick: () => void;
}

const BASE_SIZE = 44;
const PEAK_SIZE = 62;
const PROXIMITY_RADIUS = 130;
const EMPTY_WINDOWS: WindowState[] = [];

export const DockItem: React.FC<DockItemProps> = ({
  manifest,
  mouseX,
  isRunning,
  isFocused,
  onClick,
}) => {
  const itemRef = useRef<HTMLButtonElement>(null);
  const hoverTimerRef = useRef<number | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Optimized selective subscriptions: boolean primitive avoids React getSnapshot infinite loops
  const hasWindows = useWindowStore((state) =>
    Object.values(state.windows).some((w) => w.appId === manifest.id)
  );

  // Read app windows only when hover preview is actually displayed
  const appWindows = showPreview
    ? Object.values(useWindowStore.getState().windows).filter((w) => w.appId === manifest.id)
    : EMPTY_WINDOWS;

  // Compute horizontal distance from mouse cursor to center of this dock item
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = itemRef.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return val - (bounds.x + bounds.width / 2);
  });

  // Calculate target dimension using macOS parabolic cosine bell curve
  const widthSync = useTransform(distance, (d: number) => {
    if (Math.abs(d) > PROXIMITY_RADIUS) return BASE_SIZE;
    const cosineScale = Math.cos((d / PROXIMITY_RADIUS) * (Math.PI / 2)) ** 2;
    return BASE_SIZE + (PEAK_SIZE - BASE_SIZE) * cosineScale;
  });

  // Apply responsive spring damping with authentic Apple fluid curve
  const size = useSpring(widthSync, {
    mass: 0.12,
    stiffness: 280,
    damping: 18,
  });

  const [isBouncing, setIsBouncing] = useState(false);

  const handleClick = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 550);
    onClick();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (appWindows.length > 0) {
      hoverTimerRef.current = window.setTimeout(() => {
        setShowPreview(true);
      }, 220);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowPreview(false);
    useWindowStore.getState().setPeekWindowId(null);
  };

  const handleFocusWindow = (winId: string) => {
    const store = useWindowStore.getState();
    const target = store.windows[winId];
    if (target?.isMinimized) {
      store.restoreWindow(winId);
    }
    store.focusWindow(winId);
    setShowPreview(false);
    store.setPeekWindowId(null);
  };

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Live Miniature Hover Preview or Simple Tooltip */}
      {hasWindows ? (
        <DockHoverPreview
          manifest={manifest}
          windows={appWindows}
          isOpen={showPreview}
          onFocusWindow={handleFocusWindow}
          onCloseWindow={(id) => useWindowStore.getState().closeWindow(id)}
          onPeekWindow={(id) => useWindowStore.getState().setPeekWindowId(id)}
        />
      ) : (
        <div
          role="tooltip"
          className={`pointer-events-none absolute -top-9 z-50 rounded border border-border-subtle bg-surface-panel/95 px-2 py-0.5 text-[10px] font-mono tracking-tight text-content-primary shadow-lg backdrop-blur-md transition-all duration-150 ${
            isHovered
              ? 'opacity-100 -translate-y-1 scale-100'
              : 'opacity-0 translate-y-1 scale-95'
          }`}
        >
          {manifest.name}
        </div>
      )}

      {/* Kinetic Magnetic Icon Button with macOS Bounce Physics */}
      <motion.button
        ref={itemRef}
        style={{ width: size, height: size }}
        onClick={handleClick}
        animate={isBouncing ? { y: [0, -16, 0, -8, 0] } : { y: 0 }}
        transition={isBouncing ? { duration: 0.55, ease: [0.16, 1, 0.3, 1] } : undefined}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        whileTap={{ scale: 0.9 }}
        aria-label={`Open ${manifest.name}`}
        aria-haspopup="false"
        className="relative flex items-center justify-center p-0.5 focus-visible:outline-none"
      >
        <IosAppIcon appId={manifest.id} className="w-full h-full" />

        {/* macOS Active Indicator Pip (No glow) */}
        {isRunning && (
          <span
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 transition-all duration-200 ${
              isFocused
                ? 'h-1 w-2.5 rounded-full bg-white'
                : 'h-1 w-1 rounded-full bg-white/60'
            }`}
          />
        )}
      </motion.button>
    </div>
  );
};
