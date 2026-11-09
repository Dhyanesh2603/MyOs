import React, { useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { appRegistry } from '@core/process/registry';
import { useProcessStore } from '@core/process/processStore';
import { useWindowStore } from '@core/window/windowStore';
import { useWorkspaceStore } from '@core/workspace/workspaceStore';
import { soundEngine } from '@core/audio/soundEngine';
import { useAppMenuStore } from '@shell/menu/appMenuStore';
import { useDockStore } from './dockStore';
import { DockItem } from './DockItem';
import { DynamicActivityCapsule } from '@shell/topbar/DynamicActivityCapsule';
import { SystemTray } from '@shell/topbar/SystemTray';
import { WorkspaceSwitcher } from '@shell/topbar/WorkspaceSwitcher';
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
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);

  const hideTimerRef = useRef<number | null>(null);
  const dockRef = useRef<HTMLElement | null>(null);

  // Auto-hide active if mode is 'always', or if 'smart' and windows are open
  const hasOpenWindows = useWindowStore((state) =>
    Object.values(state.windows).some(
      (w) => !w.isMinimized && (w.workspaceId ?? 1) === activeWorkspaceId
    )
  );
  const activeAppId = useWindowStore((state) =>
    state.activeWindowId ? state.windows[state.activeWindowId]?.appId : null
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

  // Determine running apps that are not pinned, so they appear dynamically with running pip
  const unpinnedRunningAppIds = Object.values(processes)
    .map((p) => p.appId)
    .filter((id) => !pinnedAppIds.includes(id))
    .filter((id, index, arr) => arr.indexOf(id) === index);

  const handleAppClick = (appId: string) => {
    const isRunning = isAppRunning(appId);

    if (!isRunning) {
      launchApp(appId, undefined, viewportSize);
    } else {
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
        aria-label="Application Dock"
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
        className="fixed bottom-3 z-[500] flex items-end gap-1.5 rounded-2xl border border-white/20 bg-neutral-900/60 dark:bg-black/50 px-3 py-2 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.12)_inset] backdrop-blur-3xl saturate-150"
      >
        {/* Apple-style Launchpad / App Library Trigger */}
        <button
          onClick={() => {
            soundEngine.playClick();
            useAppMenuStore.getState().toggleAppMenu();
          }}
          className="relative flex flex-col items-center justify-center p-0.5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group mb-1 shrink-0"
          title="App Library (All Apps)"
        >
          <div className="h-11 w-11 rounded-[22.5%] bg-gradient-to-b from-neutral-700 via-neutral-800 to-neutral-900 border border-white/20 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <div className="grid grid-cols-3 gap-1 p-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-amber-200" />
            </div>
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

          const isRunning = isAppRunning(appId);
          const isFocused = isRunning && activeAppId === appId;

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
          <div className="mx-1 h-8 w-[1px] self-center bg-border-subtle/80" />
        )}

        {/* Dynamic Unpinned Running Apps */}
        {unpinnedRunningAppIds.map((appId) => {
          const manifest = appRegistry.get(appId);
          if (!manifest) return null;

          const isFocused = activeAppId === appId;

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

        {/* Right Status Capsule: Integrated Activity & System Controls */}
        <div className="mx-1 h-8 w-[1px] self-center bg-white/15 shrink-0" />

        <div className="flex items-center gap-1.5 shrink-0 mb-1">
          <DynamicActivityCapsule placement="bottom" />
          <div className="flex items-center gap-1 rounded-xl bg-white/[0.08] border border-white/10 px-2 py-0.5 text-white shadow-sm backdrop-blur-md">
            <WorkspaceSwitcher />
            <div className="h-3 w-[1px] bg-white/20 mx-0.5" />
            <SystemTray direction="up" />
          </div>
        </div>
      </motion.nav>
    </>
  );
};
