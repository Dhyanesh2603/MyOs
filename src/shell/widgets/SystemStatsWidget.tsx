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
    <div className="flex w-60 flex-col rounded-xl border border-white/[0.08] bg-[#0c0e12]/85 p-3.5 shadow-xl backdrop-blur-md text-content-primary select-none transition-all hover:border-white/[0.14]">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-content-secondary">
          <Activity className="h-3 w-3 text-emerald-400" />
          <span>KERNEL TELEMETRY</span>
        </div>
        <span className="font-mono text-[9px] text-content-tertiary">
          {formatUptime(uptimeSec)}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
        <div className="flex flex-col items-center rounded-lg border border-white/[0.05] bg-white/[0.02] p-1.5 font-mono">
          <Cpu className="h-3 w-3 text-content-tertiary" />
          <span className="mt-0.5 text-xs font-semibold text-content-primary">
            {runningProcesses.length}
          </span>
          <span className="text-[8px] text-content-tertiary uppercase tracking-wider">Procs</span>
        </div>

        <div className="flex flex-col items-center rounded-lg border border-white/[0.05] bg-white/[0.02] p-1.5 font-mono">
          <Layers className="h-3 w-3 text-content-tertiary" />
          <span className="mt-0.5 text-xs font-semibold text-content-primary">
            {windows.length}
          </span>
          <span className="text-[8px] text-content-tertiary uppercase tracking-wider">Wins</span>
        </div>

        <div className="flex flex-col items-center rounded-lg border border-white/[0.05] bg-white/[0.02] p-1.5 font-mono">
          <HardDrive className="h-3 w-3 text-content-tertiary" />
          <span className="mt-0.5 text-xs font-semibold text-content-primary">
            {fileCount}
          </span>
          <span className="text-[8px] text-content-tertiary uppercase tracking-wider">Inodes</span>
        </div>
      </div>
    </div>
  );
};
