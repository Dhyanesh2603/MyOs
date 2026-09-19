import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCommandStore } from '@core/command/commandStore';
import { appRegistry } from '@core/process/registry';
import { useProcessStore } from '@core/process/processStore';
import { useWindowStore } from '@core/window/windowStore';
import { useWallpaperStore } from '@core/theme/wallpaperStore';
import { searchVFSContent } from '@core/vfs/searchIndexer';
import type { CommandAction } from '@contracts/command';
import {
  Search,
  AppWindow,
  Image,
  Minus,
  X,
  Play,
  CornerDownLeft,
  FileText,
  FileCode,
  Calculator,
  Compass,
  Zap,
  Network,
  GraduationCap,
} from 'lucide-react';
import { soundEngine } from '@core/audio/soundEngine';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { usePersonalOsStore, PersonalOsTab } from '@core/personal-os/personalOsStore';

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

    // Flow Personal OS Quick Navigation
    const openPersonalOsTab = (tab: PersonalOsTab) => {
      usePersonalOsStore.getState().setActiveTab(tab);
      launchApp('personal-os');
    };

    list.push({
      id: 'pos-momentum',
      title: 'Personal OS: What should I work on next?',
      subtitle: 'Momentum intelligence engine recommendation',
      category: 'apps',
      icon: Compass,
      shortcut: '↵',
      handler: () => openPersonalOsTab('home'),
    });

    list.push({
      id: 'pos-missions',
      title: 'Personal OS: Engineering Missions',
      subtitle: 'Long-term strategic campaigns and objectives',
      category: 'apps',
      icon: Compass,
      shortcut: '↵',
      handler: () => openPersonalOsTab('missions'),
    });

    list.push({
      id: 'pos-dsa',
      title: 'Personal OS: DSA Workspace',
      subtitle: 'LeetCode patterns, difficulty spread, and mistake notebook',
      category: 'apps',
      icon: Zap,
      shortcut: '↵',
      handler: () => openPersonalOsTab('learning'),
    });

    list.push({
      id: 'pos-academics',
      title: 'Personal OS: Academic & Attendance Health',
      subtitle: 'Coursework, CAT/FAT prep, and >=75% compliance',
      category: 'apps',
      icon: GraduationCap,
      shortcut: '↵',
      handler: () => openPersonalOsTab('academics'),
    });

    list.push({
      id: 'pos-graph',
      title: 'Personal OS: Relational Knowledge Graph',
      subtitle: 'Visual brain connecting projects, skills, and coursework',
      category: 'apps',
      icon: Network,
      shortcut: '↵',
      handler: () => openPersonalOsTab('graph'),
    });

    list.push({
      id: 'pos-focus',
      title: 'Personal OS: Start 25m Deep Focus Block',
      subtitle: 'Distraction-free fullscreen HUD with timer',
      category: 'system',
      icon: Zap,
      shortcut: '↵',
      handler: () => usePersonalOsStore.getState().startFocusMode('Deep Engineering Focus Block', 25),
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

  const [fileActions, setFileActions] = useState<CommandAction[]>([]);

  // Deep VFS full-text search indexer query
  useEffect(() => {
    if (!query.trim()) {
      setFileActions([]);
      return;
    }

    let isMounted = true;
    searchVFSContent(query).then((matches) => {
      if (!isMounted) return;
      const acts: CommandAction[] = matches.map((m) => {
        const ext = m.name.split('.').pop()?.toLowerCase() || '';
        let icon = FileText;
        let appId = 'notes';

        if (['js', 'ts', 'jsx', 'tsx', 'json', 'css', 'html', 'sh'].includes(ext)) {
          icon = FileCode;
          appId = 'code-editor';
        } else if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) {
          icon = Image;
          appId = 'gallery';
        }

        return {
          id: `file-${m.path}`,
          title: m.isNameMatch ? m.name : `${m.name} (Line ${m.lineNumber})`,
          subtitle: m.snippet ? `“${m.snippet}”` : m.path,
          category: 'files',
          icon,
          shortcut: '↵',
          handler: () => {
            launchApp(appId, { filePath: m.path });
          },
        };
      });
      setFileActions(acts);
    });

    return () => {
      isMounted = false;
    };
  }, [query, launchApp]);

function tryEvaluateMath(raw: string): string | null {
  const q = raw.trim();
  if (!q) return null;

  // Percentage pattern: "20% of 150"
  const percentMatch = q.match(/^([\d\.]+)\s*%\s*of\s*([\d\.]+)$/i);
  if (percentMatch && percentMatch[1] && percentMatch[2]) {
    const p = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    if (!isNaN(p) && !isNaN(total)) {
      return String((p / 100) * total);
    }
  }

  let expr = q.replace(/\^/g, '**');
  expr = expr.replace(/sqrt\(/gi, 'Math.sqrt(');
  expr = expr.replace(/sin\(/gi, 'Math.sin(');
  expr = expr.replace(/cos\(/gi, 'Math.cos(');
  expr = expr.replace(/tan\(/gi, 'Math.tan(');
  expr = expr.replace(/log\(/gi, 'Math.log10(');
  expr = expr.replace(/ln\(/gi, 'Math.log(');
  expr = expr.replace(/pi\b/gi, 'Math.PI');
  expr = expr.replace(/e\b/gi, 'Math.E');

  if (!/^[\d\s\+\-\*\/\.\(\)\,\%]|Math\.(sqrt|sin|cos|tan|log10|log|PI|E)/.test(expr)) {
    return null;
  }
  const sanitized = expr.replace(/Math\.(sqrt|sin|cos|tan|log10|log|PI|E)/g, '');
  if (/[a-zA-Z_$]/.test(sanitized)) {
    return null;
  }
  if (!/[\+\-\*\/\%]|Math\./.test(expr)) {
    return null;
  }

  try {
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${expr});`)();
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return Number.isInteger(val) ? String(val) : String(parseFloat(val.toFixed(6)));
    }
  } catch {
    return null;
  }
  return null;
}

  // Filter actions based on query and append deep full-text matches
  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions;
    const cleanQuery = query.toLowerCase().trim();

    const mathResult = tryEvaluateMath(query);
    const mathActions: CommandAction[] = [];
    if (mathResult !== null) {
      mathActions.push({
        id: 'math-calc-result',
        title: `= ${mathResult}`,
        subtitle: `Calculation: ${query} (Press Enter to copy result)`,
        category: 'calc',
        icon: Calculator,
        shortcut: '↵ Copy',
        handler: () => {
          navigator.clipboard.writeText(mathResult);
          soundEngine.playClick();
          useNotificationStore.getState().notify({
            title: 'Calculation Copied',
            message: `${mathResult} copied to clipboard`,
            type: 'info',
          });
        },
      });
    }

    const appAndWinMatches = actions.filter(
      (a) =>
        a.title.toLowerCase().includes(cleanQuery) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(cleanQuery)) ||
        a.category.toLowerCase().includes(cleanQuery)
    );
    return [...mathActions, ...appAndWinMatches, ...fileActions];
  }, [actions, query, fileActions]);

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
        className="w-full max-w-xl overflow-hidden rounded-xl border border-border-subtle bg-surface-panel/95 shadow-2xl backdrop-blur-2xl animate-in zoom-in-[0.98] duration-100"
      >
        {/* Raycast Search Input Bar */}
        <div className="relative flex items-center border-b border-border-subtle px-3.5 py-3">
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
          <kbd className="rounded border border-border-subtle bg-surface-subtle/60 px-1.5 py-0.5 font-mono text-[9px] text-content-tertiary">
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
                      ? 'bg-surface-subtle text-content-primary border border-border-subtle'
                      : 'text-content-secondary hover:bg-surface-subtle/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                        isSelected
                          ? 'bg-accent-primary border-accent-primary text-white'
                          : 'bg-surface-subtle/60 border-border-subtle text-content-tertiary'
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
                    <span className="rounded bg-surface-subtle/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-content-tertiary">
                      {action.category}
                    </span>
                    {isSelected && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-content-secondary bg-surface-subtle px-1.5 py-0.5 rounded border border-border-subtle">
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
        <div className="flex items-center justify-between border-t border-border-subtle bg-surface-overlay/90 px-3 py-2 text-[10px] font-mono text-content-tertiary select-none">
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
              <kbd className="rounded border border-border-subtle bg-surface-subtle px-1 py-0.2">↑↓</kbd> Move
            </span>
            <span className="flex items-center gap-1 text-content-secondary">
              <kbd className="rounded border border-border-subtle bg-surface-subtle px-1 py-0.2">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border-subtle bg-surface-subtle px-1 py-0.2">ESC</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
