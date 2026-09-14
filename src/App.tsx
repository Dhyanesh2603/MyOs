import React, { useEffect } from 'react';
import { initializeApplications } from '@core/process/initApps';
import { useProcessStore } from '@core/process/processStore';
import { useWindowStore } from '@core/window/windowStore';
import { Dock } from '@shell/dock/Dock';
import { WindowFrame } from '@shell/window/WindowFrame';
import {
  Layers,
  Cpu,
  Play,
  CheckCircle2,
} from 'lucide-react';

export const App: React.FC = () => {
  useEffect(() => {
    initializeApplications();
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

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-surface-canvas text-content-primary">
      {/* Background Subtle Spatial Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

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
          <span className="rounded bg-accent-muted/40 px-2 py-0.5 text-[10px] font-mono text-accent-hover">
            Phase 2 Verified
          </span>
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
    </div>
  );
};

export default App;
