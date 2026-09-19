import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AppWindow, Sparkles } from 'lucide-react';
import { useStageManagerStore } from '@core/stage/stageManagerStore';
import { useWindowStore } from '@core/window/windowStore';
import { useWorkspaceStore } from '@core/workspace/workspaceStore';
import { appRegistry } from '@core/process/registry';
import { soundEngine } from '@core/audio/soundEngine';

export const StageManagerStrip: React.FC = () => {
  const isEnabled = useStageManagerStore((s) => s.isEnabled);
  const { windows, activeWindowId, focusWindow, closeWindow } = useWindowStore();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  if (!isEnabled) return null;

  // Filter windows in current workspace that are not active and not minimized
  const stagedWindows = Object.values(windows).filter(
    (w) =>
      w.id !== activeWindowId &&
      !w.isMinimized &&
      (w.workspaceId ?? 1) === activeWorkspaceId
  );

  if (stagedWindows.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-12 left-3 z-[8500] flex flex-col gap-3 select-none"
      >
        {stagedWindows.map((win) => {
          const app = appRegistry.get(win.processId.split('-')[0] || '') ||
            appRegistry.getAll().find((a) => win.title.toLowerCase().includes(a.name.toLowerCase()));
          const IconComp = app?.icon || AppWindow;

          return (
            <motion.div
              key={win.id}
              whileHover={{ scale: 1.05, x: 4 }}
              onClick={() => {
                soundEngine.playClick();
                focusWindow(win.id);
              }}
              className="group relative flex h-20 w-28 flex-col justify-between overflow-hidden rounded-xl border border-white/20 bg-surface-panel/85 p-2 shadow-xl backdrop-blur-xl cursor-pointer hover:border-accent-primary/60 hover:shadow-2xl transition-all"
            >
              {/* Top micro bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-accent-primary">
                    <IconComp className="h-3 w-3" />
                  </div>
                  <span className="truncate font-sans text-[10px] font-semibold text-content-primary">
                    {win.title}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playClick();
                    closeWindow(win.id);
                  }}
                  title="Close window"
                  className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-content-tertiary hover:bg-rose-500/20 hover:text-rose-400 transition-all"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* Simulated window body miniature */}
              <div className="h-8 w-full rounded-lg border border-border-subtle/40 bg-surface-canvas/60 p-1 flex flex-col gap-1 overflow-hidden">
                <div className="h-1 w-3/4 rounded-full bg-border-subtle/80" />
                <div className="h-1 w-1/2 rounded-full bg-border-subtle/50" />
                <div className="h-1 w-2/3 rounded-full bg-border-subtle/30" />
              </div>

              {/* Hover indicator */}
              <div className="absolute inset-0 rounded-xl pointer-events-none ring-1 ring-inset ring-transparent group-hover:ring-accent-primary/40 transition-colors" />
            </motion.div>
          );
        })}

        <div className="flex items-center justify-center pt-1 font-mono text-[9px] text-content-tertiary/70">
          <Sparkles className="h-2.5 w-2.5 mr-1 text-accent-primary" />
          <span>Stage Strip</span>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
