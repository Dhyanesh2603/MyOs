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
  ArrowRight,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { isOpen, query, selectedIndex, close, toggle, setQuery, setSelectedIndex } =
    useCommandStore();

  const { launchApp } = useProcessStore();
  const { windows, focusWindow, minimizeWindow, closeWindow } = useWindowStore();
  const { wallpapers, currentWallpaperId, setWallpaper } = useWallpaperStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Hotkey (Cmd+K / Ctrl+K)
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
      setTimeout(() => inputRef.current?.focus(), 50);
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
        subtitle: `Window ID: ${win.id.slice(-6)} • Process: ${win.processId.slice(-6)}`,
        category: 'windows',
        icon: AppWindow,
        handler: () => focusWindow(win.id),
      });
    });

    // System Utilities
    const currentIdx = wallpapers.findIndex((w) => w.id === currentWallpaperId);
    const nextWallpaper = wallpapers[(currentIdx + 1) % wallpapers.length];

    list.push({
      id: 'sys-next-wallpaper',
      title: `Cycle Wallpaper (${nextWallpaper?.name ?? 'Next'})`,
      subtitle: 'Change desktop aesthetic backdrop',
      category: 'appearance',
      icon: Image,
      handler: () => {
        if (nextWallpaper) setWallpaper(nextWallpaper.id);
      },
    });

    list.push({
      id: 'sys-minimize-all',
      title: 'Minimize All Windows',
      subtitle: 'Show clean desktop surface',
      category: 'system',
      icon: Minus,
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
      setSelectedIndex(
        (selectedIndex - 1 + filteredActions.length) % filteredActions.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedAction = filteredActions[selectedIndex];
      if (selectedAction) {
        selectedAction.handler();
        close();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-surface-panel/95 shadow-2xl backdrop-blur-window animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-white/10 px-4 py-3">
          <Search className="h-5 w-5 text-content-tertiary mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search apps..."
            className="flex-1 bg-transparent text-sm text-content-primary placeholder:text-content-tertiary outline-none"
          />
          <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-content-tertiary">
            ESC
          </kbd>
        </div>

        {/* Action Results List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-xs text-content-tertiary">
              No matching commands found.
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
                  className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-accent-primary/20 border border-accent-primary/40 text-content-primary'
                      : 'text-content-secondary hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? 'bg-accent-primary text-white'
                          : 'bg-white/5 text-content-tertiary'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-medium text-content-primary truncate">
                        {action.title}
                      </span>
                      {action.subtitle && (
                        <span className="text-[11px] text-content-tertiary truncate">
                          {action.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-content-tertiary">
                      {action.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="h-3.5 w-3.5 text-accent-primary" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between border-t border-white/5 bg-surface-overlay/50 px-4 py-2 text-[10px] font-mono text-content-tertiary">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>FlowOS Spotlight</span>
        </div>
      </div>
    </div>
  );
};
