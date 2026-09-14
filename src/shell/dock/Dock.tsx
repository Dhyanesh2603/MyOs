import React from 'react';
import { useMotionValue } from 'motion/react';
import { appRegistry } from '@core/process/registry';
import { useProcessStore } from '@core/process/processStore';
import { useWindowStore } from '@core/window/windowStore';
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
  const { processes, launchApp, isAppRunning } = useProcessStore();
  const { windows, activeWindowId, focusWindow, minimizeWindow, restoreWindow } =
    useWindowStore();

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
      return;
    }

    // Find windows belonging to this app
    const appWindows = Object.values(windows).filter((w) => w.appId === appId);
    if (appWindows.length === 0) {
      launchApp(appId, undefined, viewportSize);
      return;
    }

    // Single or primary window interaction logic
    const primaryWin = appWindows[0];
    if (!primaryWin) return;

    if (primaryWin.isMinimized) {
      restoreWindow(primaryWin.id);
    } else if (primaryWin.isFocused) {
      minimizeWindow(primaryWin.id);
    } else {
      focusWindow(primaryWin.id);
    }
  };

  return (
    <nav
      aria-label="Application Dock"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[500] flex items-end gap-2.5 rounded-dock border border-white/10 bg-surface-panel/70 px-3 py-2 shadow-dock backdrop-blur-dock"
      style={{
        boxShadow:
          '0 20px 40px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      }}
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
        <div className="mx-1 h-8 w-[1px] self-center bg-white/10" />
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
    </nav>
  );
};
