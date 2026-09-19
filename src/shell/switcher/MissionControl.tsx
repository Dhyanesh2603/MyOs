import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  AppWindow,
  ArrowRightLeft,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useWorkspaceStore } from '@core/workspace/workspaceStore';
import { useWindowStore } from '@core/window/windowStore';
import { appRegistry } from '@core/process/registry';
import { soundEngine } from '@core/audio/soundEngine';

export const MissionControl: React.FC = () => {
  const {
    isMissionControlOpen,
    closeMissionControl,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    addWorkspace,
  } = useWorkspaceStore();

  const { windows, focusWindow, closeWindow, setWindowWorkspace } = useWindowStore();
  const windowList = Object.values(windows).filter((w) => !w.isMinimized);

  // Filter windows in the currently selected space
  const currentSpaceWindows = windowList.filter(
    (w) => (w.workspaceId ?? 1) === activeWorkspaceId
  );

  // Keyboard navigation: Escape closes, Ctrl+1..4 switches
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMissionControlOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeMissionControl();
      }

      if ((e.ctrlKey || e.metaKey) && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        const spaceId = parseInt(e.key, 10);
        setActiveWorkspace(spaceId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMissionControlOpen, closeMissionControl, setActiveWorkspace]);

  if (!isMissionControlOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeMissionControl();
          }
        }}
        className="fixed inset-0 z-[9600] flex flex-col bg-black/75 backdrop-blur-2xl p-6 select-none"
      >
        {/* Top Header & Spaces Ribbon */}
        <div className="flex flex-col items-center">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-content-primary">
              <Layers className="h-5 w-5 text-accent" />
              <span className="font-semibold text-sm tracking-wide">
                Mission Control
              </span>
              <span className="rounded bg-surface-panel/80 px-2 py-0.5 font-mono text-[10px] text-content-tertiary border border-border-subtle">
                Ctrl + Up
              </span>
            </div>

            <button
              onClick={closeMissionControl}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-panel/80 border border-border-subtle text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
              title="Close Mission Control (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Spaces Horizontal Carousel */}
          <div className="mt-4 flex items-center gap-3 overflow-x-auto p-2">
            {workspaces.map((space) => {
              const isActive = space.id === activeWorkspaceId;
              const spaceWins = windowList.filter(
                (w) => (w.workspaceId ?? 1) === space.id
              );

              return (
                <button
                  key={space.id}
                  onClick={() => setActiveWorkspace(space.id)}
                  className={`group relative flex h-24 w-40 flex-col justify-between rounded-xl border p-2.5 transition-all text-left ${
                    isActive
                      ? 'border-accent bg-accent/15 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] ring-2 ring-accent'
                      : 'border-border-subtle bg-surface-panel/60 hover:border-border-strong hover:bg-surface-panel/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold ${
                        isActive ? 'text-accent' : 'text-content-primary'
                      }`}
                    >
                      {space.name}
                    </span>
                    <span className="font-mono text-[10px] text-content-tertiary">
                      {spaceWins.length} win{spaceWins.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {/* Miniature representations of windows inside space */}
                  <div className="relative flex h-10 w-full items-center justify-center rounded-lg bg-surface-canvas/60 border border-border-subtle/40 overflow-hidden">
                    {spaceWins.length === 0 ? (
                      <span className="font-mono text-[9px] text-content-tertiary opacity-60">
                        Empty Space
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        {spaceWins.slice(0, 4).map((w) => {
                          const m = appRegistry.get(w.appId);
                          const Icon = m?.icon ?? AppWindow;
                          return (
                            <div
                              key={w.id}
                              className="flex h-6 w-6 items-center justify-center rounded bg-surface-panel border border-border-subtle text-accent shadow-xs"
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {workspaces.length < 6 && (
              <button
                onClick={addWorkspace}
                className="flex h-24 w-28 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface-panel/30 text-content-tertiary hover:border-accent hover:text-content-primary transition-all"
                title="Create New Desktop Space"
              >
                <Plus className="h-5 w-5 mb-1 text-accent" />
                <span className="font-mono text-[10px]">Add Space</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Grid: Active Space Window Gallery */}
        <div className="mt-8 flex-1 overflow-y-auto px-4">
          <div className="mb-3 flex items-center justify-between border-b border-border-subtle/50 pb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-content-secondary">
              Windows on {workspaces.find((w) => w.id === activeWorkspaceId)?.name}
            </span>
            <span className="font-mono text-xs text-content-tertiary">
              Click any window to focus and fly in
            </span>
          </div>

          {currentSpaceWindows.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-content-tertiary">
              <Sparkles className="h-10 w-10 text-accent/50 mb-2" />
              <p className="text-sm font-medium text-content-secondary">
                No open windows in this space
              </p>
              <p className="text-xs text-content-tertiary mt-1">
                Launch apps from the Dock or switch spaces from the top ribbon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {currentSpaceWindows.map((win) => {
                const manifest = appRegistry.get(win.appId);
                const Icon = manifest?.icon ?? AppWindow;

                return (
                  <motion.div
                    key={win.id}
                    layoutId={`mc-win-${win.id}`}
                    whileHover={{ scale: 1.03, y: -4 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    onClick={() => {
                      soundEngine.playSnap();
                      focusWindow(win.id);
                      closeMissionControl();
                    }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-panel/85 shadow-2xl backdrop-blur-md cursor-pointer hover:border-accent hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.35)] transition-all"
                  >
                    {/* Window Card Titlebar */}
                    <div className="flex items-center justify-between border-b border-border-subtle bg-surface-subtle/60 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-surface-panel text-accent">
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="truncate text-xs font-semibold text-content-primary">
                          {win.title}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.playClick();
                          closeWindow(win.id);
                        }}
                        className="rounded p-1 text-content-tertiary hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title="Close Window"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Window Visual Body Preview */}
                    <div className="relative flex h-44 w-full flex-col items-center justify-center bg-surface-canvas/50 p-4">
                      <Icon className="h-12 w-12 text-content-tertiary/40 group-hover:text-accent transition-colors" />
                      <span className="mt-2 font-mono text-[10px] text-content-tertiary uppercase tracking-wider">
                        {win.appId} • {win.size.width}x{win.size.height}
                      </span>

                      {/* Space Migration Dropdown Pill */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-panel/90 px-2 py-1 text-[10px] font-mono text-content-secondary"
                      >
                        <ArrowRightLeft className="h-3 w-3 text-accent" />
                        <span>Move to:</span>
                        <select
                          value={win.workspaceId ?? 1}
                          onChange={(e) => {
                            const newSpaceId = parseInt(e.target.value, 10);
                            setWindowWorkspace(win.id, newSpaceId);
                            soundEngine.playSnap();
                          }}
                          className="bg-transparent font-medium text-accent outline-none cursor-pointer"
                        >
                          {workspaces.map((s) => (
                            <option key={s.id} value={s.id} className="bg-surface-panel text-content-primary">
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
