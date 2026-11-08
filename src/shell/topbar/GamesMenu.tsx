import React, { useState, useRef, useEffect } from 'react';
import {
  Gamepad2,
  Swords,
  Flame,
  CircleDot,
  Trophy,
  ChevronDown,
  Sparkles,
  Play,
  Grid,
} from 'lucide-react';
import { useProcessStore } from '@core/process/processStore';
import { IosAppIcon } from '@shell/icons/IosAppIcon';

interface GameItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  color: string;
}

const FLOW_GAMES: GameItem[] = [
  {
    id: 'cyber-pong',
    name: 'CyberPong Arena',
    category: 'Arcade / Action',
    description: '2-Player local split-keyboard, AI bot, and AirBridge P2P sync',
    icon: Swords,
    tag: '2P Multiplayer',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    id: 'snake-arena',
    name: 'Snake Arena',
    category: 'Battle / Arcade',
    description: 'Tron lightcycle grid duel with wall & tail collision physics',
    icon: Flame,
    tag: '2P Multiplayer',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'connect-four',
    name: 'Connect 4',
    category: 'Tactical / Strategy',
    description: 'Turn-based vertical gravity grid with Minimax AI & P2P duel',
    icon: CircleDot,
    tag: '2P Tactical',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  {
    id: 'retro-2048',
    name: 'Flow 2048',
    category: 'Puzzle',
    description: 'Tactile 4x4 sliding tile numerical puzzle with procedural audio',
    icon: Grid,
    tag: 'Puzzle',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'retro-sweeper',
    name: 'FlowSweeper',
    category: 'Classic',
    description: 'Minimalist Dieter Rams tactile Minesweeper with safe first clicks',
    icon: Sparkles,
    tag: 'Classic',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
];

export const GamesMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { launchApp, isAppRunning } = useProcessStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLaunch = (appId: string) => {
    setIsOpen(false);
    launchApp(appId);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-6 items-center gap-1.5 rounded px-2 text-xs font-medium transition-all cursor-pointer ${
          isOpen
            ? 'bg-surface-subtle text-accent-primary font-semibold shadow-sm'
            : 'text-content-secondary hover:bg-surface-subtle/60 hover:text-content-primary'
        }`}
      >
        <Gamepad2 className="h-3.5 w-3.5 text-accent-primary" />
        <span>Games</span>
        <ChevronDown className={`h-3 w-3 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-7 z-[9500] w-72 rounded-2xl border border-border-subtle bg-surface-panel/95 p-1.5 text-xs text-content-primary shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border-subtle/60 mb-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-bold text-xs text-content-primary">Flow Arcade</span>
            </div>
            <span className="text-[10px] text-content-tertiary font-mono">
              {FLOW_GAMES.length} Titles
            </span>
          </div>

          {/* Game List */}
          <div className="space-y-0.5 max-h-[360px] overflow-y-auto">
            {FLOW_GAMES.map((game) => {
              const running = isAppRunning(game.id);
              return (
                <button
                  key={game.id}
                  onClick={() => handleLaunch(game.id)}
                  className="group flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-surface-subtle transition-all cursor-pointer"
                >
                  <div className="h-8 w-8 shrink-0 group-hover:scale-105 transition-transform">
                    <IosAppIcon appId={game.id} className="h-full w-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-xs text-content-primary truncate group-hover:text-accent-primary transition-colors">
                        {game.name}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider border shrink-0 ${game.color}`}
                      >
                        {game.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-content-tertiary line-clamp-1 leading-tight">
                      {game.description}
                    </p>
                  </div>

                  {running && (
                    <span
                      title="Running"
                      className="h-1.5 w-1.5 rounded-full bg-emerald-400 self-center shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick launch / footer */}
          <div className="mt-1 pt-1.5 border-t border-border-subtle/60 flex items-center justify-between px-2 text-[10px] text-content-tertiary">
            <span>Local & AirBridge P2P</span>
            <button
              onClick={() => handleLaunch('cyber-pong')}
              className="flex items-center gap-1 font-semibold text-accent-primary hover:underline cursor-pointer"
            >
              <Play className="h-2.5 w-2.5 fill-current" />
              <span>Quick Play</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
