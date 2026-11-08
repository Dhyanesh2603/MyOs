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
      {/* Left side: Apple system glyph (App Library trigger), Games menu, Active App title & menus */}
      <div className="flex items-center gap-1.5">
        {/* Apple System Glyph / App Menu Trigger */}
        <button
          onClick={() => {
            soundEngine.playClick();
            toggleAppMenu();
          }}
          className="flex h-5 w-6 items-center justify-center rounded px-1 text-white/90 hover:bg-white/15 transition-all cursor-pointer"
          title="App Library & System Launcher"
        >
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.71-11.71-14.01-6.19-9.5-11.04-20.2-14.54-32.08-3.5-11.89-5.25-23.36-5.25-34.42 0-14.58 3.73-26.79 11.19-36.63 7.45-9.84 17.06-14.86 28.82-15.06 4.91 0 10.45 1.34 16.63 4.02 6.18 2.68 10.14 4.07 11.88 4.18 1.48 0 5.64-1.4 12.48-4.18 6.84-2.79 12.63-4.04 17.38-3.76 13.37.74 23.63 5.43 30.77 14.08-11.75 7.15-17.5 17.02-17.26 29.62.24 9.94 4.12 18.25 11.64 24.94 7.52 6.69 16.6 10.36 27.24 11.02-2.32 7.02-5.34 14.28-9.06 21.78zM119.22 31.84c0-7.39 2.66-14.38 7.97-20.97 5.32-6.58 11.96-10.57 19.94-11.97.21 1.27.32 2.43.32 3.49 0 7.39-2.79 14.65-8.38 21.78-5.59 7.14-12.39 11.23-20.4 12.28-.11-1.37-.16-2.52-.16-3.44l.71-1.17z"/>
          </svg>
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
