import React from 'react';
import { ClockWidget } from './ClockWidget';
import { SystemStatsWidget } from './SystemStatsWidget';

export const DesktopWidgets: React.FC = () => {
  return (
    <aside
      aria-label="Desktop Widgets"
      className="absolute top-12 right-8 z-[20] flex flex-col gap-3 pointer-events-auto select-none"
    >
      <ClockWidget />
      <SystemStatsWidget />
    </aside>
  );
};
