import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Search,
  XCircle,
  Layers,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useProcessStore } from '@core/process/processStore';
import { useWindowStore } from '@core/window/windowStore';
import { useVFSStore } from '@core/vfs/vfsStore';
import { appRegistry } from '@core/process/registry';

export const TaskManagerApp: React.FC<AppProps> = ({ processId }) => {
  const { processes, terminateProcess } = useProcessStore();
  const { windows, focusWindow } = useWindowStore();
  const { nodes } = useVFSStore();

  const [filter, setFilter] = useState('');
  const [selectedPid, setSelectedPid] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Periodic heartbeat for live uptime and telemetry metrics
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const procList = useMemo(() => {
    return Object.values(processes).map((proc) => {
      const manifest = appRegistry.get(proc.appId);
      const uptimeSec = Math.max(0, Math.floor((Date.now() - proc.startedAt) / 1000));
      // Deterministic pseudo-metrics based on processId and tick
      const charCode = proc.id.charCodeAt(proc.id.length - 1) || 65;
      const cpu = ((Math.sin(tick * 0.5 + charCode) + 1) * 2.8 + 0.4).toFixed(1);
      const mem = ((charCode % 15) * 1.8 + 14.5).toFixed(1);

      return {
        ...proc,
        name: manifest?.name ?? proc.appId,
        icon: manifest?.icon ?? Activity,
        uptimeSec,
        cpu,
        mem,
      };
    });
  }, [processes, tick]);

  const filteredProcs = procList.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.id.toLowerCase().includes(filter.toLowerCase())
  );

  const totalWindows = Object.keys(windows).length;
  const totalInodes = Object.keys(nodes).length;
  const totalMem = procList.reduce((acc, p) => acc + parseFloat(p.mem), 48.0).toFixed(1);
  const avgCpu = (
    procList.reduce((acc, p) => acc + parseFloat(p.cpu), 1.2) / Math.max(1, procList.length)
  ).toFixed(1);

  const handleEndTask = (pid: string) => {
    terminateProcess(pid);
    if (selectedPid === pid) setSelectedPid(null);
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel text-content-primary select-none text-xs">
      {/* Telemetry Header HUD (Nothing OS / Apple Pro Restraint) */}
      <div className="grid grid-cols-4 gap-2 border-b border-border-subtle bg-surface-overlay/80 p-3">
        {/* CPU Telemetry Card */}
        <div className="flex flex-col rounded-lg border border-border-subtle bg-surface-panel p-2.5">
          <div className="flex items-center justify-between text-content-tertiary">
            <span className="font-mono text-[10px] uppercase tracking-wider">CPU Load</span>
            <Cpu className="h-3.5 w-3.5 text-accent-primary" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-semibold text-content-primary">{avgCpu}%</span>
            <span className="text-[10px] text-content-tertiary">active</span>
          </div>
          <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
            <div
              className="h-full bg-accent-primary transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, parseFloat(avgCpu) * 8)}%` }}
            />
          </div>
        </div>

        {/* Memory Telemetry Card */}
        <div className="flex flex-col rounded-lg border border-border-subtle bg-surface-panel p-2.5">
          <div className="flex items-center justify-between text-content-tertiary">
            <span className="font-mono text-[10px] uppercase tracking-wider">Memory (RSS)</span>
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-semibold text-content-primary">{totalMem}</span>
            <span className="text-[10px] text-content-tertiary">MB</span>
          </div>
          <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
            <div
              className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, (parseFloat(totalMem) / 512) * 100)}%` }}
            />
          </div>
        </div>

        {/* Storage / Inodes Card */}
        <div className="flex flex-col rounded-lg border border-border-subtle bg-surface-panel p-2.5">
          <div className="flex items-center justify-between text-content-tertiary">
            <span className="font-mono text-[10px] uppercase tracking-wider">VFS Nodes</span>
            <HardDrive className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-semibold text-content-primary">{totalInodes}</span>
            <span className="text-[10px] text-content-tertiary">files</span>
          </div>
          <div className="mt-2 flex items-center gap-1 font-mono text-[9px] text-content-tertiary">
            <span>IndexedDB Backed</span>
          </div>
        </div>

        {/* Window Manager Card */}
        <div className="flex flex-col rounded-lg border border-border-subtle bg-surface-panel p-2.5">
          <div className="flex items-center justify-between text-content-tertiary">
            <span className="font-mono text-[10px] uppercase tracking-wider">Processes</span>
            <Layers className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-semibold text-content-primary">{procList.length}</span>
            <span className="text-[10px] text-content-tertiary">({totalWindows} win)</span>
          </div>
          <div className="mt-2 flex items-center gap-1 font-mono text-[9px] text-content-tertiary">
            <span>FlowOS Kernel v0.2.0</span>
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-overlay/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-content-tertiary" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter processes..."
              className="h-7 w-52 rounded-md border border-border-subtle bg-surface-panel pl-8 pr-2.5 font-mono text-xs text-content-primary placeholder:text-content-tertiary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <span className="font-mono text-[10px] text-content-tertiary">
            {filteredProcs.length} active
          </span>
        </div>

        {selectedPid && (
          <button
            onClick={() => handleEndTask(selectedPid)}
            className="flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-medium text-rose-500 hover:bg-rose-500/20 active:scale-95 transition-all shadow-sm"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>End Task ({selectedPid.slice(-4)})</span>
          </button>
        )}
      </div>

      {/* High-Density Process Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-left font-mono">
          <thead className="sticky top-0 border-b border-border-subtle bg-surface-panel text-[10px] uppercase tracking-wider text-content-tertiary">
            <tr>
              <th className="px-3 py-2 font-medium">Process Name</th>
              <th className="px-3 py-2 font-medium">PID</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">CPU</th>
              <th className="px-3 py-2 font-medium">Memory</th>
              <th className="px-3 py-2 font-medium">Windows</th>
              <th className="px-3 py-2 font-medium">Uptime</th>
              <th className="px-3 py-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50 text-xs">
            {filteredProcs.map((proc) => {
              const isSelected = selectedPid === proc.id;
              const isSelf = proc.id === processId;
              const Icon = proc.icon;

              return (
                <tr
                  key={proc.id}
                  onClick={() => setSelectedPid(proc.id)}
                  onDoubleClick={() => {
                    if (proc.windowIds[0]) focusWindow(proc.windowIds[0]);
                  }}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-accent-primary/10 text-content-primary'
                      : 'hover:bg-surface-subtle/40 text-content-secondary'
                  }`}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-surface-subtle border border-border-subtle">
                        <Icon className="h-3 w-3 text-accent-primary" />
                      </div>
                      <span className="font-sans font-medium text-content-primary">{proc.name}</span>
                      {isSelf && (
                        <span className="rounded bg-surface-subtle px-1 py-0.2 text-[9px] text-content-tertiary">
                          self
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-content-tertiary">{proc.id.slice(-8)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] text-emerald-400 capitalize">{proc.state}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-semibold text-content-primary">{proc.cpu}%</td>
                  <td className="px-3 py-2 text-content-primary">{proc.mem} MB</td>
                  <td className="px-3 py-2 text-content-tertiary">{proc.windowIds.length}</td>
                  <td className="px-3 py-2 text-content-tertiary">{proc.uptimeSec}s</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEndTask(proc.id);
                      }}
                      title="Kill Process"
                      className="rounded p-1 text-content-tertiary hover:bg-rose-500/15 hover:text-rose-500 transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between border-t border-border-subtle bg-surface-overlay/80 px-3 py-1.5 font-mono text-[10px] text-content-tertiary">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Real-time POSIX Task Engine</span>
        </div>
        <div>Double-click row to focus primary window</div>
      </div>
    </div>
  );
};

export const taskManagerManifest: AppManifest = {
  id: 'task-manager',
  name: 'Activity Monitor',
  description: 'Real-time CPU, memory and process task manager with kill actions.',
  category: 'system',
  icon: Activity,
  defaultSize: { width: 620, height: 440 },
  constraints: { minWidth: 480, minHeight: 320, maxWidth: 960, maxHeight: 720 },
  allowMultipleInstances: false,
  permissions: [],
  component: TaskManagerApp,
};
