import React from 'react';
import { FlowMenu } from './FlowMenu';
import { GamesMenu } from './GamesMenu';
import { ActiveAppMenu } from './ActiveAppMenu';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { DynamicActivityCapsule } from './DynamicActivityCapsule';
import { SystemTray } from './SystemTray';

export const TopMenuBar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[9000] flex h-8 items-center justify-between border-b border-border-subtle bg-surface-panel/85 px-3 text-xs text-content-primary shadow-sm backdrop-blur-md select-none transition-colors">
      {/* Left side: FlowOS menu, Games dropdown, and Active Application Context Menus */}
      <div className="flex items-center gap-2">
        <FlowMenu />
        <div className="h-3.5 w-px bg-border-subtle/80" />
        <GamesMenu />
        <div className="h-3.5 w-px bg-border-subtle/80" />
        <ActiveAppMenu />
      </div>

      {/* Center: Workspaces & Dynamic Island Activity Capsule */}
      <div className="flex items-center gap-3">
        <WorkspaceSwitcher />
        <DynamicActivityCapsule />
      </div>

      {/* Right side: System Tray (Battery, Wi-Fi, Volume, Clock & Calendar) */}
      <SystemTray />
    </header>
  );
};
