import React from 'react';
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
    <header className="fixed top-0 left-0 right-0 z-[9000] flex h-7 items-center justify-between border-b border-white/[0.08] bg-black/40 px-3 text-xs text-white/90 shadow-sm backdrop-blur-2xl select-none transition-colors">
      {/* Left side: System App Library launcher, Games menu, Active App title & menus */}
      <div className="flex items-center gap-1.5">
        {/* Modern Minimalist App Library Launcher */}
        <button
          onClick={() => {
            soundEngine.playClick();
            toggleAppMenu();
          }}
          className="flex h-5 w-6 items-center justify-center rounded px-1 text-white/90 hover:bg-white/15 transition-all cursor-pointer"
          title="App Library & Applications"
        >
          <div className="grid grid-cols-2 gap-0.5 p-0.5">
            <span className="h-1.5 w-1.5 rounded-sm bg-white/90" />
            <span className="h-1.5 w-1.5 rounded-sm bg-white/90" />
            <span className="h-1.5 w-1.5 rounded-sm bg-white/90" />
            <span className="h-1.5 w-1.5 rounded-sm bg-white/90" />
          </div>
        </button>

        <div className="h-3 w-[1px] bg-white/10" />
        <GamesMenu />
        <div className="h-3 w-[1px] bg-white/10" />
        <ActiveAppMenu />
      </div>

      {/* Center: Dynamic Island Activity Capsule */}
      <div className="flex items-center gap-2">
        <DynamicActivityCapsule />
      </div>

      {/* Right side: Workspace Switcher and System Tray */}
      <div className="flex items-center gap-2">
        <WorkspaceSwitcher />
        <SystemTray />
      </div>
    </header>
  );
};
