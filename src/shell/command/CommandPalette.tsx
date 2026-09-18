import React, { useEffect, useMemo, useRef } from 'react';
import { useCommandStore } from '@core/command/commandStore';
import { appRegistry } from '@core/process/registry';
import { useProcessStore } from '@core/process/processStore';
import { useWindowStore } from '@core/window/windowStore';
import { useWallpaperStore } from '@core/theme/wallpaperStore';
import type { CommandAction } from '@contracts/command';
import {
  Search,
  AppWindow,
  Image,
  Minus,
  X,
  Play,
  CornerDownLeft,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { isOpen, query, selectedIndex, close, toggle, setQuery, setSelectedIndex } =
    useCommandStore();

  const { launchApp } = useProcessStore();
  const { windows, focusWindow, minimizeWindow, closeWindow } = useWindowStore();
  const { wallpapers, currentWallpaperId, setWallpaper } = useWallpaperStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global hotkey: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggle, close]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  // Construct dynamic action catalogue
  const actions: CommandAction[] = useMemo(() => {
    const list: CommandAction[] = [];

    // Registered Apps
    appRegistry.getAll().forEach((app) => {
      list.push({
        id: `app-${app.id}`,
        title: `Open ${app.name}`,
        subtitle: app.description,
        category: 'apps',
        icon: app.icon,
        shortcut: '↵',
        handler: () => launchApp(app.id),
      });
    });

    // Active Windows
    Object.values(windows).forEach((win) => {
      list.push({
        id: `window-${win.id}`,
        title: `Switch to: ${win.title}`,
        subtitle: `Window ID: ${win.id.slice(-6)} • Process: ${win.processId.slice(-4)}`,
        category: 'windows',
        icon: AppWindow,
        shortcut: '↵',
        handler: () => focusWindow(win.id),
      });
    });

    // System Utilities
    const currentIdx = wallpapers.findIndex((w) => w.id === currentWallpaperId);
    const nextWallpaper = wallpapers[(currentIdx + 1) % wallpapers.length];

    list.push({
      id: 'sys-next-wallpaper',
      title: `Cycle Backdrop (${nextWallpaper?.name ?? 'Next'})`,
      subtitle: 'Switch desktop carbon theme backdrop',
      category: 'system',
      icon: Image,
      shortcut: '↵',
      handler: () => {
        if (nextWallpaper) setWallpaper(nextWallpaper.id);
      },
    });

    list.push({
      id: 'sys-minimize-all',
      title: 'Minimize All Windows',
      subtitle: 'Clear screen to desktop surface',
      category: 'system',
      icon: Minus,
      shortcut: '↵',
      handler: () => {
        Object.keys(windows).forEach((id) => minimizeWindow(id));
      },
    });

    list.push({
      id: 'sys-close-all',
      title: 'Close All Windows',
      subtitle: 'Terminate running window sessions',
      category: 'system',
      icon: X,
      shortcut: '↵',
      handler: () => {
        Object.keys(windows).forEach((id) => closeWindow(id));
      },
    });

    return list;
  }, [launchApp, windows, focusWindow, minimizeWindow, closeWindow, wallpapers, currentWallpaperId, setWallpaper]);

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions;
    const cleanQuery = query.toLowerCase().trim();
    return actions.filter(
      (a) =>
        a.title.toLowerCase().includes(cleanQuery) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(cleanQuery)) ||
        a.category.toLowerCase().includes(cleanQuery)
    );
  }, [actions, query]);

  // Handle keyboard navigation in result list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredActions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((selectedIndex + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((selectedIndex - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const action = filteredActions[selectedIndex];
      if (action) {
        action.handler();
        close();
      }
    }
  };

  if (!isOpen) return null;

  const activeAction = filteredActions[selectedIndex];

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/60 p-4 pt-24 backdrop-blur-[4px] animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-xl border border-white/[0.12] bg-[#0f1115]/95 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85)] backdrop-blur-2xl animate-in zoom-in-[0.98] duration-100"
      >
        {/* Raycast Search Input Bar */}
        <div className="relative flex items-center border-b border-white/[0.07] px-3.5 py-3">
          <Search className="h-4 w-4 text-content-tertiary mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, applications, or windows..."
            className="flex-1 bg-transparent text-sm tracking-tight text-content-primary placeholder:text-content-tertiary outline-none font-sans"
          />
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-content-tertiary">
            ESC
          </kbd>
        </div>

        {/* Action Results List */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto p-1.5 space-y-0.5">
          {filteredActions.length === 0 ? (
            <div className="py-10 text-center font-mono text-xs text-content-tertiary">
              No matching commands or apps found.
            </div>
          ) : (
            filteredActions.map((action, index) => {
              const isSelected = index === selectedIndex;
              const IconComponent = action.icon || Play;

              return (
                <div
                  key={action.id}
                  onClick={() => {
                    action.handler();
                    close();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-white/[0.08] text-content-primary border border-white/[0.08]'
                      : 'text-content-secondary hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                        isSelected
                          ? 'bg-accent-primary border-white/20 text-white'
                          : 'bg-white/[0.04] border-white/[0.06] text-content-tertiary'
                      }`}
                    >
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-medium tracking-tight text-content-primary truncate">
                        {action.title}
                      </span>
                      {action.subtitle && (
                        <span className="text-[10px] text-content-tertiary truncate">
                          {action.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-content-tertiary">
                      {action.category}
                    </span>
                    {isSelected && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-content-secondary bg-white/[0.06] px-1.5 py-0.5 rounded">
                        <span>Open</span>
                        <CornerDownLeft className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Raycast Iconic Action Bar Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.07] bg-[#0c0d10]/90 px-3 py-2 text-[10px] font-mono text-content-tertiary select-none">
          <div className="flex items-center gap-2 truncate">
            {activeAction ? (
              <>
                <span className="text-content-secondary truncate">{activeAction.title}</span>
                <span className="opacity-40">//</span>
                <span className="uppercase text-[9px] text-accent-primary">{activeAction.category}</span>
              </>
            ) : (
              <span>Navigation</span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.2">↑↓</kbd> Move
            </span>
            <span className="flex items-center gap-1 text-content-secondary">
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.2">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.2">ESC</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
