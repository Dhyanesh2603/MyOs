import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStatusSidebarStore } from '@core/status/statusStore';
import { useProcessStore } from '@core/process/processStore';
import { useWindowStore } from '@core/window/windowStore';
import { useWallpaperStore } from '@core/theme/wallpaperStore';
import { useCommandStore } from '@core/command/commandStore';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import {
  Bell,
  Layers,
  Cpu,
  Play,
  CheckCircle2,
  Search,
  HardDrive,
  FileText,
  X,
  ChevronRight,
  Activity,
} from 'lucide-react';

export const StatusSidebar: React.FC = () => {
  const { isOpen, open, close } = useStatusSidebarStore();
  const openNotificationCenter = useNotificationStore((state) => state.openCenter);

  const { launchApp, terminateProcess, processes } = useProcessStore();
  const {
    windows,
    focusStack,
    activeWindowId,
    focusWindow,
    getZIndex,
  } = useWindowStore();

  const { currentWallpaperId, wallpapers, setWallpaper } = useWallpaperStore();
  const openSpotlight = useCommandStore((state) => state.open);
  const vfsNodes = useVFSStore((state) => state.nodes);

  const handleLaunch = (appId: string) => {
    launchApp(appId, undefined, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  const handleCycleFocus = () => {
    if (focusStack.length <= 1) return;
    const nextId = focusStack[0];
    if (nextId) focusWindow(nextId);
  };

  const processList = Object.values(processes);

  return (
    <>
      {/* Sliding Menu Bar Edge Tab (Visible when closed to easily slide it open) */}
      {!isOpen && (
        <button
          onClick={open}
          title="Open System Status Bar & Kernel HUD"
          aria-label="Open System Status Bar"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-[40] group flex items-center gap-1.5 rounded-r-2xl border-y border-r border-white/10 bg-surface-panel/85 py-3 px-2 shadow-xl backdrop-blur-md text-content-secondary hover:text-content-primary hover:bg-surface-panel/95 hover:border-accent-primary/50 transition-all cursor-pointer select-none"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Activity className="h-4 w-4 text-accent-primary group-hover:scale-110 transition-transform" />
            <ChevronRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>
      )}

      {/* Sliding Drawer & Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click-outside Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-[9989] bg-black/40 backdrop-blur-[2px]"
            />

            {/* Slide-out Status Bar Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              className="fixed top-0 left-0 z-[9990] flex h-screen w-96 max-w-[90vw] flex-col gap-4 overflow-y-auto border-r border-white/10 bg-surface-panel/95 p-5 shadow-2xl backdrop-blur-window text-xs text-content-primary"
            >
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
                  <button
                    onClick={close}
                    aria-label="Hide Status Bar"
                    className="rounded-lg p-1 text-content-secondary hover:bg-white/10 hover:text-content-primary transition-colors ml-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
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
                  onClick={() => {
                    close();
                    openSpotlight();
                  }}
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
