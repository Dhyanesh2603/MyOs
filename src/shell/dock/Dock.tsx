import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { appRegistry } from '@core/process/registry';
import { useProcessStore } from '@core/process/processStore';
import { useWindowStore } from '@core/window/windowStore';
import { useWorkspaceStore } from '@core/workspace/workspaceStore';
import { useDockStore } from './dockStore';
import { DockItem } from './DockItem';
import type { WindowSize } from '@contracts/window';

export interface DockProps {
  viewportSize?: WindowSize;
}

export const Dock: React.FC<DockProps> = ({
  viewportSize = { width: window.innerWidth, height: window.innerHeight },
}) => {
  const mouseX = useMotionValue(Infinity);

  const pinnedAppIds = useDockStore((state) => state.pinnedAppIds);
  const autoHideMode = useDockStore((state) => state.autoHideMode);
  const isDockRevealed = useDockStore((state) => state.isDockRevealed);
  const setIsDockRevealed = useDockStore((state) => state.setIsDockRevealed);

  const { processes, launchApp, isAppRunning } = useProcessStore();
  const { windows, activeWindowId, focusWindow, minimizeWindow, restoreWindow } =
    useWindowStore();
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);

  const [isHoveringBottom, setIsHoveringBottom] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const dockRef = useRef<HTMLElement | null>(null);

  // Auto-hide is engaged when in 'always' mode or when 'smart' and windows are active in current workspace
  const hasOpenWindows = Object.values(windows).some(
    (w) => !w.isMinimized && (w.workspaceId ?? 1) === activeWorkspaceId
  );
  const isAutoHideActive =
    autoHideMode === 'always' || (autoHideMode === 'smart' && hasOpenWindows);
  const isVisible = !isAutoHideActive || isDockRevealed;

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // 2-Second Bottom Hover Intent Tracking:
  // Starts a 2000ms timer whenever cursor enters the bottom 16px of the screen.
  // Only reveals dock if cursor remains at the bottom edge for at least 2 full seconds.
  useEffect(() => {
    if (!isAutoHideActive) {
      clearHoverTimer();
      clearHideTimer();
      setIsHoveringBottom(false);
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      const isAtBottomEdge = e.clientY >= window.innerHeight - 16;
      const isOverDock = dockRef.current?.contains(e.target as Node) ?? false;

      if (isAtBottomEdge) {
        clearHideTimer();
        if (!isDockRevealed && hoverTimerRef.current === null) {
          setIsHoveringBottom(true);
          hoverTimerRef.current = window.setTimeout(() => {
            setIsDockRevealed(true);
            setIsHoveringBottom(false);
            hoverTimerRef.current = null;
          }, 2000); // Strict 2-second hover intent
        }
      } else {
        // Pointer left bottom edge zone
        if (hoverTimerRef.current !== null) {
          clearHoverTimer();
          setIsHoveringBottom(false);
        }

        // If dock is currently revealed and pointer moves away from dock area
        if (isDockRevealed && !isOverDock && hideTimerRef.current === null) {
          hideTimerRef.current = window.setTimeout(() => {
            setIsDockRevealed(false);
            hideTimerRef.current = null;
          }, 600); // 600ms grace period to prevent accidental flickering
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      clearHoverTimer();
      clearHideTimer();
    };
  }, [isAutoHideActive, isDockRevealed, clearHoverTimer, clearHideTimer, setIsDockRevealed]);

  const handleDockMouseEnter = () => {
    clearHideTimer();
    clearHoverTimer();
  };

  const handleDockMouseLeave = () => {
    if (isAutoHideActive && hideTimerRef.current === null) {
      hideTimerRef.current = window.setTimeout(() => {
        setIsDockRevealed(false);
        hideTimerRef.current = null;
      }, 600);
    }
  };

  // Determine running apps that are not pinned, so they also appear dynamically
  const unpinnedRunningAppIds = Object.values(processes)
    .map((p) => p.appId)
    .filter((id) => !pinnedAppIds.includes(id))
    .filter((id, index, arr) => arr.indexOf(id) === index); // unique

  const activeWindow = activeWindowId ? windows[activeWindowId] : undefined;

  const handleAppClick = (appId: string) => {
    const isRunning = isAppRunning(appId);

    if (!isRunning) {
      launchApp(appId, undefined, viewportSize);
    } else {
      // Find windows belonging to this app
      const appWindows = Object.values(windows).filter((w) => w.appId === appId);
      if (appWindows.length === 0) {
        launchApp(appId, undefined, viewportSize);
      } else {
        const primaryWin = appWindows[0];
        if (primaryWin) {
          if (primaryWin.isMinimized) {
            restoreWindow(primaryWin.id);
          } else if (primaryWin.isFocused) {
            minimizeWindow(primaryWin.id);
          } else {
            focusWindow(primaryWin.id);
          }
        }
      }
    }

    // Auto-hide the dock after clicking an app to let the window take over the screen
    if (isAutoHideActive) {
      window.setTimeout(() => {
        setIsDockRevealed(false);
      }, 350);
    }
  };

  return (
    <>
      {/* Invisible Bottom Hover Trigger Strip spanning full screen width */}
      {isAutoHideActive && (
        <div
          data-dock-trigger="true"
          className="fixed bottom-0 left-0 right-0 h-4 z-[490] pointer-events-auto cursor-default"
          onMouseEnter={() => {
            clearHideTimer();
            if (!isDockRevealed && hoverTimerRef.current === null) {
              setIsHoveringBottom(true);
              hoverTimerRef.current = window.setTimeout(() => {
                setIsDockRevealed(true);
                setIsHoveringBottom(false);
                hoverTimerRef.current = null;
              }, 2000);
            }
          }}
          onMouseLeave={() => {
            clearHoverTimer();
            setIsHoveringBottom(false);
          }}
        />
      )}

      {/* Minimalist Bottom Indicator Pill: expands and glows over 2s to indicate hover intent */}
      {isAutoHideActive && !isVisible && (
        <div
          data-dock-indicator="true"
          onClick={() => setIsDockRevealed(true)}
          className="fixed bottom-1 left-1/2 -translate-x-1/2 z-[495] flex items-center justify-center cursor-pointer select-none"
          title="Hover at bottom edge for 2 seconds to reveal Dock"
        >
          <div
            className={`h-1 rounded-full transition-all ${
              isHoveringBottom
                ? 'w-24 bg-accent-primary shadow-[0_0_12px_rgba(var(--accent-primary),0.8)]'
                : 'w-12 bg-white/20 hover:bg-white/40'
            }`}
            style={{
              transitionDuration: isHoveringBottom ? '2000ms' : '200ms',
              transitionTimingFunction: isHoveringBottom ? 'linear' : 'ease-out',
            }}
          />
        </div>
      )}

      {/* Fluid Magnetic Dock with Spring Physics Slide-up/down */}
      <motion.nav
        ref={dockRef}
        aria-label="Application Dock"
        initial={false}
        animate={{
          y: isVisible ? 0 : 80,
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.96,
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 28,
        }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => {
          mouseX.set(Infinity);
          handleDockMouseLeave();
        }}
        onMouseEnter={handleDockMouseEnter}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[500] flex items-end gap-2 rounded-dock border border-border-subtle bg-surface-panel/90 px-2.5 py-1.5 shadow-dock backdrop-blur-dock"
      >
        {/* Pinned Applications */}
        {pinnedAppIds.map((appId) => {
          const manifest = appRegistry.get(appId);
          if (!manifest) return null;

          const isRunning = isAppRunning(appId);
          const isFocused = isRunning && activeWindow?.appId === appId;

          return (
            <DockItem
              key={appId}
              manifest={manifest}
              mouseX={mouseX}
              isRunning={isRunning}
              isFocused={Boolean(isFocused)}
              onClick={() => handleAppClick(appId)}
            />
          );
        })}

        {/* Separator if unpinned apps are running */}
        {unpinnedRunningAppIds.length > 0 && (
          <div className="mx-1 h-8 w-[1px] self-center bg-border-subtle" />
        )}

        {/* Dynamic Unpinned Running Apps */}
        {unpinnedRunningAppIds.map((appId) => {
          const manifest = appRegistry.get(appId);
          if (!manifest) return null;

          const isFocused = activeWindow?.appId === appId;

          return (
            <DockItem
              key={appId}
              manifest={manifest}
              mouseX={mouseX}
              isRunning={true}
              isFocused={Boolean(isFocused)}
              onClick={() => handleAppClick(appId)}
            />
          );
        })}
      </motion.nav>
    </>
  );
};
