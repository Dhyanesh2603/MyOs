import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { FlowMenu } from './FlowMenu';
import { GamesMenu } from './GamesMenu';
import { ActiveAppMenu } from './ActiveAppMenu';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { DynamicActivityCapsule } from './DynamicActivityCapsule';
import { SystemTray } from './SystemTray';
import { useAppMenuStore } from '@shell/menu/appMenuStore';
import { soundEngine } from '@core/audio/soundEngine';

export const TopMenuBar: React.FC = () => {
  const toggleAppMenu = useAppMenuStore((s) => s.toggleAppMenu);

  return (
    <header className="fixed top-0 left-0 right-0 z-[9000] flex h-8 items-center justify-between border-b border-border-subtle bg-surface-panel/85 px-3 text-xs text-content-primary shadow-sm backdrop-blur-md select-none transition-colors">
      {/* Left side: FlowOS menu, Mobile App Drawer trigger, Games dropdown, and Active Application Context Menus */}
      <div className="flex items-center gap-2">
        <FlowMenu />

        {/* Mobile App Menu Launcher Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            toggleAppMenu();
          }}
          className="flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-semibold tracking-tight text-white hover:bg-white/15 transition-all cursor-pointer shadow-sm border border-white/15"
          title="App Library (All installed apps & games)"
        >
          <LayoutGrid className="h-3.5 w-3.5 text-cyan-400" />
          <span>Apps</span>
        </button>

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
