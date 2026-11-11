import React, { useState, useEffect } from 'react';

export const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex w-60 flex-col rounded-xl border border-border-subtle bg-surface-panel/85 p-3.5 shadow-lg backdrop-blur-md text-content-primary select-none transition-all hover:border-border-strong">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-content-secondary">
            ONYX TIME
          </span>
        </div>
        <span className="font-mono text-[9px] text-content-tertiary">
          UTC{time.getTimezoneOffset() > 0 ? '-' : '+'}{Math.abs(time.getTimezoneOffset() / 60)}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1 font-mono">
        <span className="text-3xl font-light tracking-tight text-content-primary">
          {hours}:{minutes}
        </span>
        <span className="text-xs text-content-tertiary">
          :{seconds}
        </span>
      </div>

      <div className="mt-1 font-mono text-[11px] text-content-secondary">
        {dateStr}
      </div>
    </div>
  );
};
