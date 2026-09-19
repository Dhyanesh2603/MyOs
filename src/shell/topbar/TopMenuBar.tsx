import React from 'react';
import { FlowMenu } from './FlowMenu';
import { ActiveAppMenu } from './ActiveAppMenu';
import { SystemTray } from './SystemTray';

export const TopMenuBar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[9000] flex h-8 items-center justify-between border-b border-border-subtle bg-surface-panel/85 px-3 text-xs text-content-primary shadow-sm backdrop-blur-md select-none transition-colors">
      {/* Left side: FlowOS Apple-style menu & Active Application Context Menus */}
      <div className="flex items-center gap-2">
        <FlowMenu />
        <div className="h-3.5 w-px bg-border-subtle/80" />
        <ActiveAppMenu />
      </div>

      {/* Right side: System Tray (Battery, Wi-Fi, Volume, Clock & Calendar) */}
      <SystemTray />
    </header>
  );
};
