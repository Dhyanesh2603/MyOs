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
import { IosAppIcon } from '@shell/icons/IosAppIcon';
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
    <div className="flex h-full w-full flex-col bg-[#08090d] text-neutral-100 select-none text-xs">
      {/* Telemetry Header HUD (High-Contrast Activity Monitor) */}
      <div className="grid grid-cols-4 gap-2.5 border-b border-white/[0.08] bg-[#0e1017] p-3">
        {/* CPU Telemetry Card */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#12141c] p-3 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">CPU Load</span>
            <Cpu className="h-3.5 w-3.5 text-neutral-300" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-white">{avgCpu}%</span>
            <span className="text-[10px] text-neutral-400 font-mono">active</span>
          </div>
          <div className="mt-2.5 flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full bg-white transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, parseFloat(avgCpu) * 8)}%` }}
            />
          </div>
        </div>

        {/* Memory Telemetry Card */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#12141c] p-3 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">Memory (RSS)</span>
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-white">{totalMem}</span>
            <span className="text-[10px] text-neutral-400 font-mono">MB</span>
          </div>
          <div className="mt-2.5 flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, (parseFloat(totalMem) / 512) * 100)}%` }}
            />
          </div>
        </div>

        {/* Storage / Inodes Card */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#12141c] p-3 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">VFS Inodes</span>
            <HardDrive className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-white">{totalInodes}</span>
            <span className="text-[10px] text-neutral-400 font-mono">nodes</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 font-mono text-[9px] text-neutral-500">
            <span>IndexedDB Backed</span>
          </div>
        </div>

        {/* Window Manager Card */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#12141c] p-3 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">Processes</span>
            <Layers className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-white">{procList.length}</span>
            <span className="text-[10px] text-neutral-400 font-mono">({totalWindows} win)</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 font-mono text-[9px] text-neutral-500">
            <span>Flow Kernel v0.2</span>
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0e1017] px-3.5 py-2">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter processes..."
              className="h-7.5 w-56 rounded-lg border border-white/10 bg-[#161824] pl-8 pr-2.5 font-mono text-xs text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
            />
          </div>
          <span className="font-mono text-[10px] text-neutral-400">
            {filteredProcs.length} active
          </span>
        </div>

        {selectedPid && (
          <button
            onClick={() => handleEndTask(selectedPid)}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-1 font-mono text-xs font-semibold text-rose-300 hover:bg-rose-500/25 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>End Task ({selectedPid.slice(-4)})</span>
          </button>
        )}
      </div>

      {/* High-Density Process Table */}
      <div className="flex-1 overflow-auto scrollbar-none no-scrollbar">
        <table className="w-full border-collapse text-left font-mono">
          <thead className="sticky top-0 border-b border-white/[0.08] bg-[#10121a] text-[10px] uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-3.5 py-2.5 font-semibold">Process Name</th>
              <th className="px-3 py-2.5 font-semibold">PID</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5 font-semibold">CPU</th>
              <th className="px-3 py-2.5 font-semibold">Memory</th>
              <th className="px-3 py-2.5 font-semibold">Windows</th>
              <th className="px-3 py-2.5 font-semibold">Uptime</th>
              <th className="px-3 py-2.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-xs">
            {filteredProcs.map((proc) => {
              const isSelected = selectedPid === proc.id;
              const isSelf = proc.id === processId;

              return (
                <tr
                  key={proc.id}
                  onClick={() => setSelectedPid(proc.id)}
                  onDoubleClick={() => {
                    if (proc.windowIds[0]) focusWindow(proc.windowIds[0]);
                  }}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-white/10 text-white font-medium'
                      : 'hover:bg-white/[0.04] text-neutral-300'
                  }`}
                >
                  <td className="px-3.5 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-5.5 w-5.5 shrink-0">
                        <IosAppIcon appId={proc.appId} className="h-full w-full" />
                      </div>
                      <span className="font-sans font-semibold text-white">{proc.name}</span>
                      {isSelf && (
                        <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] text-neutral-400 font-mono">
                          self
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-neutral-400">{proc.id.slice(-8)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[11px] text-emerald-400 capitalize font-medium">{proc.state}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-bold text-white">{proc.cpu}%</td>
                  <td className="px-3 py-2 text-neutral-200">{proc.mem} MB</td>
                  <td className="px-3 py-2 text-neutral-400">{proc.windowIds.length}</td>
                  <td className="px-3 py-2 text-neutral-400">{proc.uptimeSec}s</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEndTask(proc.id);
                      }}
                      title="Kill Process"
                      className="rounded-lg p-1 text-neutral-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
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
      <div className="flex items-center justify-between border-t border-white/[0.08] bg-[#0e1017] px-3.5 py-2 font-mono text-[10px] text-neutral-400 select-none">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-neutral-300 font-medium">Real-time Task Monitor</span>
        </div>
        <div className="text-neutral-500">Double-click row to focus primary window</div>
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
