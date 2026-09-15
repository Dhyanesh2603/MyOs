import React, { useEffect } from 'react';
import { initializeApplications } from '@core/process/initApps';
import { useProcessStore } from '@core/process/processStore';
import { useWindowStore } from '@core/window/windowStore';
import { Dock } from '@shell/dock/Dock';
import { WindowFrame } from '@shell/window/WindowFrame';
import { DesktopSurface } from '@shell/desktop/DesktopSurface';
import { useWallpaperStore } from '@core/theme/wallpaperStore';
import { ContextMenu } from '@shell/context-menu/ContextMenu';
import { CommandPalette } from '@shell/command/CommandPalette';
import { useCommandStore } from '@core/command/commandStore';
import { useVFSStore } from '@core/vfs/vfsStore';
import { NotificationToaster } from '@shell/notifications/NotificationToaster';
import { NotificationCenter } from '@shell/notifications/NotificationCenter';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { TaskSwitcher } from '@shell/switcher/TaskSwitcher';
import {
  Bell,
  Layers,
  Cpu,
  Play,
  CheckCircle2,
  Search,
  HardDrive,
  FileText,
} from 'lucide-react';

export const App: React.FC = () => {
  const openNotificationCenter = useNotificationStore((state) => state.openCenter);

  useEffect(() => {
    initializeApplications();
    useVFSStore.getState().init();

    const timer = setTimeout(() => {
      useNotificationStore.getState().notify({
        title: 'FlowOS Initialized',
        message: 'All kernel subsystems operational. Press Ctrl+K for Spotlight.',
        type: 'success',
      });
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const { launchApp, terminateProcess, processes } = useProcessStore();
  const {
    windows,
    focusStack,
    activeWindowId,
    focusWindow,
    getZIndex,
  } = useWindowStore();

  const handleLaunch = (appId: string) => {
    launchApp(appId, undefined, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  const handleCycleFocus = () => {
    if (focusStack.length <= 1) return;
    // Bring bottom-most window to front (cyclic focus)
    const nextId = focusStack[0];
    if (nextId) focusWindow(nextId);
  };

  const windowList = Object.values(windows);
  const processList = Object.values(processes);
  const { currentWallpaperId, wallpapers, setWallpaper } = useWallpaperStore();
  const openSpotlight = useCommandStore((state) => state.open);
  const vfsNodes = useVFSStore((state) => state.nodes);

  return (
    <DesktopSurface>

      {/* Real-time Headless Diagnostics HUD */}
      <aside className="absolute left-6 top-6 z-10 w-96 max-h-[92vh] flex flex-col gap-4 overflow-y-auto rounded-window border border-white/10 bg-surface-panel/85 p-5 shadow-window backdrop-blur-window text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-semibold uppercase tracking-wider text-content-secondary">
              FlowOS // Kernel HUD
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openNotificationCenter}
              title="Open Control Shade"
              className="flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-content-secondary hover:bg-white/20 transition-colors"
            >
              <Bell className="h-3 w-3 text-accent-primary" />
              Shade
            </button>
            <span className="rounded bg-accent-muted/40 px-2 py-0.5 text-[10px] font-mono text-accent-hover">
              Kernel Active
            </span>
          </div>
        </div>

        {/* Launch Control Panel */}
        <div>
          <label className="text-[11px] font-mono uppercase text-content-tertiary">
            Process Execution
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleLaunch('system-settings')}
              className="flex items-center justify-center gap-2 rounded-control border border-white/10 bg-surface-overlay/80 px-3 py-2 font-medium hover:border-accent-primary/60 hover:bg-surface-subtle transition-colors"
            >
              <Play className="h-3.5 w-3.5 text-accent-primary" />
              Settings (Single)
            </button>
            <button
              onClick={() => handleLaunch('notes')}
              className="flex items-center justify-center gap-2 rounded-control border border-white/10 bg-surface-overlay/80 px-3 py-2 font-medium hover:border-accent-primary/60 hover:bg-surface-subtle transition-colors"
            >
              <Play className="h-3.5 w-3.5 text-accent-primary" />
              Notes (Cascade)
            </button>
          </div>
          <button
            onClick={handleCycleFocus}
            disabled={focusStack.length <= 1}
            className="mt-2 w-full rounded-control border border-white/5 bg-surface-overlay/40 py-1.5 font-mono text-[11px] text-content-secondary hover:bg-surface-subtle disabled:opacity-40 transition-colors"
          >
            Cycle Focus (Alt+Tab simulation)
          </button>
          <button
            onClick={openSpotlight}
            className="mt-2 flex w-full items-center justify-between rounded-control border border-accent-primary/40 bg-accent-primary/15 px-3 py-1.5 font-mono text-[11px] text-accent-hover hover:bg-accent-primary/25 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Search className="h-3 w-3" />
              Spotlight Palette
            </span>
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-content-tertiary">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Wallpaper Engine Selector */}
        <div className="rounded-control border border-white/5 bg-surface-overlay/40 p-3">
          <label className="text-[11px] font-mono uppercase text-content-tertiary">
            Wallpaper Engine
          </label>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {wallpapers.map((w) => (
              <button
                key={w.id}
                onClick={() => setWallpaper(w.id)}
                className={`truncate rounded px-2 py-1 font-mono text-[10px] text-left transition-colors ${
                  w.id === currentWallpaperId
                    ? 'border border-accent-primary/50 bg-accent-primary/20 text-content-primary'
                    : 'bg-white/5 text-content-secondary hover:bg-white/10'
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>

        {/* Focus Stack Inspector */}
        <div className="rounded-control border border-white/5 bg-surface-overlay/40 p-3">
          <div className="flex items-center justify-between text-content-tertiary">
            <span className="flex items-center gap-1.5 font-mono">
              <Layers className="h-3.5 w-3.5" />
              Focus Stack ({focusStack.length})
            </span>
            <span className="text-[10px] text-content-tertiary">[Bottom → Top]</span>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            {focusStack.length === 0 ? (
              <span className="font-mono text-content-tertiary">No windows open</span>
            ) : (
              focusStack.map((id, index) => {
                const isTop = id === activeWindowId;
                const win = windows[id];
                return (
                  <div
                    key={id}
                    onClick={() => focusWindow(id)}
                    className={`flex items-center justify-between rounded px-2 py-1 font-mono cursor-pointer transition-colors ${
                      isTop
                        ? 'bg-accent-primary/20 text-content-primary border border-accent-primary/40'
                        : 'bg-white/5 text-content-secondary hover:bg-white/10'
                    }`}
                  >
                    <span>
                      {index}: {win?.title ?? id}
                    </span>
                    <span className="text-[10px] opacity-75">
                      z:{getZIndex(id)} {isTop ? '★ Focus' : ''}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Process Table */}
        <div className="rounded-control border border-white/5 bg-surface-overlay/40 p-3">
          <div className="flex items-center gap-1.5 font-mono text-content-tertiary">
            <Cpu className="h-3.5 w-3.5" />
            Processes ({processList.length})
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {processList.length === 0 ? (
              <span className="font-mono text-content-tertiary">0 processes</span>
            ) : (
              processList.map((proc) => (
                <div
                  key={proc.id}
                  className="flex items-center justify-between rounded bg-white/5 px-2 py-1.5 font-mono text-[11px]"
                >
                  <div>
                    <span className="text-content-primary">{proc.appId}</span>{' '}
                    <span className="text-content-tertiary">({proc.id.slice(-6)})</span>
                  </div>
                  <button
                    onClick={() => terminateProcess(proc.id)}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Kill
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Virtual File System Storage Inspector */}
        <div className="rounded-control border border-white/5 bg-surface-overlay/40 p-3">
          <div className="flex items-center justify-between text-content-tertiary">
            <span className="flex items-center gap-1.5 font-mono">
              <HardDrive className="h-3.5 w-3.5" />
              IndexedDB VFS
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Persisted</span>
          </div>
          <div className="mt-2 flex flex-col gap-1 max-h-36 overflow-y-auto">
            {Object.values(vfsNodes).length === 0 ? (
              <span className="font-mono text-[10px] text-content-tertiary">Mounting VFS...</span>
            ) : (
              Object.values(vfsNodes)
                .filter((n) => n.path.startsWith('/home/user'))
                .map((node) => (
                  <div
                    key={node.path}
                    className="flex items-center justify-between rounded bg-white/5 px-2 py-1 font-mono text-[10px]"
                  >
                    <span className="flex items-center gap-1.5 truncate text-content-secondary">
                      <FileText className="h-3 w-3 text-accent-primary shrink-0" />
                      {node.name || node.path}
                    </span>
                    <span className="text-[9px] text-content-tertiary font-mono">
                      {node.type === 'directory' ? 'DIR' : `${node.size}B`}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Architectural Notes */}
        <div className="space-y-1.5 border-t border-white/10 pt-3 text-[11px] text-content-secondary leading-normal">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Focus Stack is bounded & collision-free
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Single-instance enforced on Settings
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Automatic cascading enabled on Notes
          </div>
        </div>
      </aside>

      {/* Interactive Rendered Windows */}
      {windowList.map((win) => (
        <WindowFrame key={win.id} windowState={win} />
      ))}

      {/* Fluid Magnetic Dock */}
      <Dock />

      {/* Global Context Menu */}
      <ContextMenu />

      {/* Global Spotlight / Command Palette */}
      <CommandPalette />

      {/* Notifications & System Shade */}
      <NotificationToaster />
      <NotificationCenter />

      {/* Visual Alt+Tab Task Switcher */}
      <TaskSwitcher />
    </DesktopSurface>
  );
};

export default App;
