import React, { useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { appRegistry } from '@core/process/registry';
import { useProcessStore } from '@core/process/processStore';
import { useWindowStore } from '@core/window/windowStore';
import { useWorkspaceStore } from '@core/workspace/workspaceStore';
import { soundEngine } from '@core/audio/soundEngine';
import { useAppMenuStore } from '@shell/menu/appMenuStore';
import { useDockStore } from './dockStore';
import { DockItem } from './DockItem';
import { IosLaunchpadIcon } from '@shell/icons/IosAppIcon';
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

  const launchApp = useProcessStore((s) => s.launchApp);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);

  const hideTimerRef = useRef<number | null>(null);
  const dockRef = useRef<HTMLElement | null>(null);

  // Auto-hide active if mode is 'always', or if 'smart' and windows are open
  const hasOpenWindows = useWindowStore((state) =>
    Object.values(state.windows).some(
      (w) => !w.isMinimized && (w.workspaceId ?? 1) === activeWorkspaceId
    )
  );
  const isAutoHideActive =
    autoHideMode === 'always' || (autoHideMode === 'smart' && hasOpenWindows);
  const isVisible = !isAutoHideActive || isDockRevealed;

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // macOS-style Instant Bottom Hot-Edge Hit Detection:
  // When cursor hits the bottom edge (within 8px of bottom), reveal dock immediately.
  // When cursor moves away, hide dock smoothly after a 280ms grace period.
  useEffect(() => {
    if (!isAutoHideActive) {
      clearHideTimer();
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      const isAtBottomEdge = e.clientY >= window.innerHeight - 8;
      const isOverDock = dockRef.current?.contains(e.target as Node) ?? false;

      if (isAtBottomEdge || isOverDock) {
        clearHideTimer();
        if (!isDockRevealed) {
          setIsDockRevealed(true);
        }
      } else {
        if (isDockRevealed && hideTimerRef.current === null) {
          hideTimerRef.current = window.setTimeout(() => {
            setIsDockRevealed(false);
            hideTimerRef.current = null;
          }, 280);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      clearHideTimer();
    };
  }, [isAutoHideActive, isDockRevealed, clearHideTimer, setIsDockRevealed]);

  const handleDockMouseEnter = () => {
    clearHideTimer();
    setIsDockRevealed(true);
  };

  const handleDockMouseLeave = () => {
    if (isAutoHideActive && hideTimerRef.current === null) {
      hideTimerRef.current = window.setTimeout(() => {
        setIsDockRevealed(false);
        hideTimerRef.current = null;
      }, 280);
    }
  };

  // List of unique app IDs for all currently open windows (array of primitive strings)
  // useShallow on primitive string array guarantees 100% stable reference checks!
  const openAppIds = useWindowStore(
    useShallow((state) => {
      const ids: string[] = [];
      for (const win of Object.values(state.windows)) {
        if (!ids.includes(win.appId)) {
          ids.push(win.appId);
        }
      }
      return ids;
    })
  );

  // Unpinned apps appear in dock ONLY when they have open or minimized windows
  const unpinnedRunningAppIds = openAppIds.filter(
    (appId) => !pinnedAppIds.includes(appId)
  );



  const handleAppClick = (appId: string) => {
    const winStore = useWindowStore.getState();
    const appWindows = Object.values(winStore.windows).filter((w) => w.appId === appId);

    if (appWindows.length === 0) {
      launchApp(appId, undefined, viewportSize);
    } else {
      const primaryWin = appWindows[0];
      if (primaryWin) {
        if (primaryWin.isMinimized) {
          winStore.restoreWindow(primaryWin.id);
        } else if (primaryWin.isFocused) {
          winStore.minimizeWindow(primaryWin.id);
        } else {
          winStore.focusWindow(primaryWin.id);
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
      {/* Invisible Bottom Hot-Edge Trigger Strip spanning full screen width */}
      {isAutoHideActive && (
        <div
          data-dock-trigger="true"
          className="fixed bottom-0 left-0 right-0 h-2.5 z-[490] pointer-events-auto cursor-default"
          onMouseEnter={() => {
            clearHideTimer();
            setIsDockRevealed(true);
          }}
        />
      )}

      {/* Fluid Magnetic Dock with Spring Physics Slide-up/down (Centered horizontally) */}
      <motion.nav
        ref={dockRef}
        data-dock="true"
        role="navigation"
        aria-label="Application Dock"
        onPointerDown={(e) => e.stopPropagation()}
        initial={{
          x: '-50%',
          y: isVisible ? 0 : 90,
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          x: '-50%',
          y: isVisible ? 0 : 90,
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.94,
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
        style={{
          left: '50%',
        }}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 28,
          mass: 0.7,
        }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => {
          mouseX.set(Infinity);
          handleDockMouseLeave();
        }}
        onMouseEnter={handleDockMouseEnter}
        className="fixed bottom-3 left-1/2 z-[500] flex items-end gap-1.5 rounded-2xl border border-white/20 bg-neutral-900/60 dark:bg-black/50 px-3 py-2 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-3xl saturate-150"
      >
        {/* Nothing OS Pure Monochrome Dot-Matrix Launchpad / App Library Trigger */}
        <button
          onClick={() => {
            soundEngine.playClick();
            useAppMenuStore.getState().toggleAppMenu();
          }}
          className="relative flex flex-col items-center justify-center p-0.5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group mb-1 shrink-0"
          title="App Library (All Apps)"
        >
          <div className="h-11 w-11 group-hover:scale-105 transition-transform flex items-center justify-center">
            <IosLaunchpadIcon className="w-full h-full" />
          </div>
          <span className="text-[10px] font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 whitespace-nowrap bg-black/75 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md shadow-lg pointer-events-none">
            Launchpad
          </span>
        </button>

        <div className="mx-1 h-8 w-[1px] self-center bg-white/15 shrink-0" />

        {/* Pinned Applications */}
        {pinnedAppIds.map((appId) => {
          const manifest = appRegistry.get(appId);
          if (!manifest) return null;

          return (
            <DockItem
              key={appId}
              manifest={manifest}
              mouseX={mouseX}
              onClick={() => handleAppClick(appId)}
            />
          );
        })}

        {/* Separator if unpinned apps are running */}
        {unpinnedRunningAppIds.length > 0 && (
          <div className="mx-1 h-8 w-[1px] self-center bg-white/15 shrink-0" />
        )}

        {/* Dynamic Unpinned Running Apps (Disappear completely when closed) */}
        {unpinnedRunningAppIds.map((appId) => {
          const manifest = appRegistry.get(appId);
          if (!manifest) return null;

          return (
            <DockItem
              key={appId}
              manifest={manifest}
              mouseX={mouseX}
              onClick={() => handleAppClick(appId)}
            />
          );
        })}
      </motion.nav>
    </>
  );
};
