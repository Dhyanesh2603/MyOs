import React, { useState, useEffect } from 'react';
import { useFlowOS } from '@core/sdk/useFlowOS';
import { Cpu, HardDrive, Layers, Activity } from 'lucide-react';

export const SystemStatsWidget: React.FC = () => {
  const { runningProcesses, windows, fs } = useFlowOS();
  const [uptimeSec, setUptimeSec] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const fileCount = Object.keys(fs.nodes).length;

  return (
    <div className="flex w-64 flex-col rounded-3xl border border-white/10 bg-surface-panel/50 p-4 shadow-xl backdrop-blur-md text-content-primary select-none transition-all hover:bg-surface-panel/60">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
          <Activity className="h-3.5 w-3.5 animate-pulse" />
          <span>Kernel Monitor</span>
        </div>
        <span className="font-mono text-[10px] text-content-tertiary">
          {formatUptime(uptimeSec)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="flex flex-col items-center rounded-xl bg-white/5 p-2 font-mono">
          <Cpu className="h-3.5 w-3.5 text-accent-primary opacity-70" />
          <span className="mt-1 text-sm font-semibold text-content-primary">
            {runningProcesses.length}
          </span>
          <span className="text-[9px] text-content-tertiary uppercase">Procs</span>
        </div>

        <div className="flex flex-col items-center rounded-xl bg-white/5 p-2 font-mono">
          <Layers className="h-3.5 w-3.5 text-cyan-400 opacity-70" />
          <span className="mt-1 text-sm font-semibold text-content-primary">
            {windows.length}
          </span>
          <span className="text-[9px] text-content-tertiary uppercase">Wins</span>
        </div>

        <div className="flex flex-col items-center rounded-xl bg-white/5 p-2 font-mono">
          <HardDrive className="h-3.5 w-3.5 text-amber-400 opacity-70" />
          <span className="mt-1 text-sm font-semibold text-content-primary">
            {fileCount}
          </span>
          <span className="text-[9px] text-content-tertiary uppercase">Inodes</span>
        </div>
      </div>
    </div>
  );
};
