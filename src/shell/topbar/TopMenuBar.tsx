import React from 'react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { DynamicActivityCapsule } from './DynamicActivityCapsule';
import { SystemTray } from './SystemTray';
import { useAppMenuStore } from '@shell/menu/appMenuStore';
import { soundEngine } from '@core/audio/soundEngine';

export const TopMenuBar: React.FC = () => {
  const toggleAppMenu = useAppMenuStore((s) => s.toggleAppMenu);

  return (
    <div className="fixed top-2.5 left-4 right-4 z-[9000] flex items-center justify-between pointer-events-none select-none text-xs text-white/90">
      {/* Left: Floating App Launcher Capsule */}
      <div className="flex items-center gap-1.5 pointer-events-auto">
        <button
          onClick={() => {
            soundEngine.playClick();
            toggleAppMenu();
          }}
          className="flex h-7 items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1 shadow-lg backdrop-blur-2xl hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer group"
          title="App Library (All installed apps)"
        >
          <div className="grid grid-cols-2 gap-0.5">
            <span className="h-1 w-1 rounded-sm bg-white/90" />
            <span className="h-1 w-1 rounded-sm bg-white/90" />
            <span className="h-1 w-1 rounded-sm bg-white/90" />
            <span className="h-1 w-1 rounded-sm bg-white/90" />
          </div>
          <span className="text-[11px] font-medium tracking-tight text-white/90">Apps</span>
        </button>
      </div>

      {/* Center: Dynamic Island Activity Capsule */}
      <div className="pointer-events-auto">
        <DynamicActivityCapsule />
      </div>

      {/* Right: Floating Glass Status Capsule */}
      <div className="flex items-center gap-2 pointer-events-auto rounded-full border border-white/15 bg-black/60 px-3 py-0.5 shadow-lg backdrop-blur-2xl">
        <WorkspaceSwitcher />
        <div className="h-3 w-[1px] bg-white/15" />
        <SystemTray />
      </div>
    </div>
  );
};
