import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Layers,
  Code2,
  FolderGit2,
  PlayCircle,
  Wrench,
  Gamepad2,
  SlidersHorizontal,
  Plus,
  PlusCircle,
  Minus,
  Play,
  Trash2,
} from 'lucide-react';
import { appRegistry } from '@core/process/registry';
import { useProcessStore } from '@core/process/processStore';
import { soundEngine } from '@core/audio/soundEngine';
import { IosAppIcon } from '@shell/icons/IosAppIcon';
import { useAppMenuStore, AppMenuCategory } from './appMenuStore';
import { useContextMenuStore } from '@core/menu/contextMenuStore';
import { useDesktopStore } from '@core/desktop/desktopStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { useCustomAppStore } from '@core/packages/customAppStore';
import { usePackageStore } from '@core/packages/packageStore';

const CATEGORIES: { id: AppMenuCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All Apps', icon: Layers },
  { id: 'productivity', label: 'Productivity', icon: FolderGit2 },
  { id: 'development', label: 'Developer', icon: Code2 },
  { id: 'media', label: 'Media', icon: PlayCircle },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'utilities', label: 'Utilities', icon: Wrench },
  { id: 'system', label: 'System', icon: SlidersHorizontal },
];

export const AppMenu: React.FC = () => {
  const {
    isOpen,
    closeAppMenu,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useAppMenuStore();

  const { launchApp, isAppRunning } = useProcessStore();
  const openMenu = useContextMenuStore((s) => s.openMenu);
  const isAppOnDesktop = useDesktopStore((s) => s.isAppOnDesktop);
  const addAppShortcut = useDesktopStore((s) => s.addAppShortcut);
  const removeAppShortcut = useDesktopStore((s) => s.removeAppShortcut);
  const customApps = useCustomAppStore((s) => s.customApps);
  const deleteWebApp = useCustomAppStore((s) => s.deleteWebApp);
  const packages = usePackageStore((s) => s.packages);
  const uninstallPackage = usePackageStore((s) => s.uninstallPackage);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingApp, setIsDraggingApp] = useState(false);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setIsDraggingApp(false);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        soundEngine.playClick();
        closeAppMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAppMenu]);

  // Query all registered applications
  const allApps = useMemo(() => {
    return appRegistry.getAll();
  }, [isOpen]);

  // Filter apps by category and search
  const filteredApps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allApps.filter((app) => {
      const matchesSearch =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;

      if (selectedCategory === 'games') {
        return (
          app.category === 'games' ||
          app.id === 'cyber-pong' ||
          app.id === 'snake-arena' ||
          app.id === 'connect-four' ||
          app.id === 'retro-2048' ||
          app.id === 'retro-sweeper'
        );
      }

      // Explicitly prevent any game from appearing under productivity, utilities, or other non-game categories
      if (
        app.category === 'games' ||
        app.id === 'cyber-pong' ||
        app.id === 'snake-arena' ||
        app.id === 'connect-four' ||
        app.id === 'retro-2048' ||
        app.id === 'retro-sweeper'
      ) {
        return false;
      }

      return app.category === selectedCategory;
    });
  }, [allApps, searchQuery, selectedCategory]);

  const handleLaunch = (appId: string) => {
    soundEngine.playClick();
    launchApp(appId);
    closeAppMenu();
  };

  const handleToggleHomescreen = (appId: string, appName: string) => {
    const onHomescreen = isAppOnDesktop(appId);
    soundEngine.playClick();

    if (onHomescreen) {
      removeAppShortcut(appId);
      useNotificationStore.getState().notify({
        title: 'Removed from Homescreen',
        message: `${appName} removed from desktop.`,
        type: 'info',
      });
    } else {
      addAppShortcut(appId);
      useNotificationStore.getState().notify({
        title: 'Pinned to Homescreen',
        message: `${appName} added to desktop.`,
        type: 'success',
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, appId: string, appName: string, category: string) => {
    e.preventDefault();
    e.stopPropagation();
    soundEngine.playClick();

    const onHomescreen = isAppOnDesktop(appId);
    const isCustomPwa = customApps.some((c) => c.id === appId);
    const isCommunityPkg = packages.some((p) => p.id === appId && p.installed);

    openMenu({ x: e.clientX, y: e.clientY }, [
      {
        type: 'item',
        item: {
          id: 'toggle-homescreen',
          label: onHomescreen ? 'Remove from Homescreen' : 'Add to Homescreen',
          icon: onHomescreen ? Trash2 : PlusCircle,
          danger: onHomescreen,
          action: () => {
            handleToggleHomescreen(appId, appName);
          },
        },
      },
      {
        type: 'item',
        item: {
          id: 'launch-app',
          label: 'Launch Application',
          icon: Play,
          action: () => handleLaunch(appId),
        },
      },
      ...(isCustomPwa
        ? [
            { type: 'separator' as const, id: 'sep-pwa' },
            {
              type: 'item' as const,
              item: {
                id: 'delete-pwa',
                label: 'Delete Web App (Uninstall)',
                icon: Trash2,
                danger: true,
                action: () => {
                  deleteWebApp(appId);
                  removeAppShortcut(appId);
                  soundEngine.playClick();
                  closeAppMenu();
                },
              },
            },
          ]
        : []),
      ...(isCommunityPkg
        ? [
            { type: 'separator' as const, id: 'sep-pkg' },
            {
              type: 'item' as const,
              item: {
                id: 'uninstall-pkg',
                label: 'Uninstall Package',
                icon: Trash2,
                danger: true,
                action: () => {
                  uninstallPackage(appId);
                  removeAppShortcut(appId);
                  soundEngine.playClick();
                  closeAppMenu();
                },
              },
            },
          ]
        : []),
      { type: 'separator', id: 'sep-1' },
      {
        type: 'item',
        item: {
          id: 'app-info',
          label: `${appName} (${category})`,
          action: () => {},
          disabled: true,
        },
      },
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isDraggingApp ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          onClick={closeAppMenu}
          className={`fixed inset-0 z-[9600] flex flex-col items-center justify-between bg-black/80 backdrop-blur-xl select-none px-4 pt-10 pb-6 overflow-hidden ${
            isDraggingApp ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {/* Top Search & Filter Control Bar */}
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex flex-col items-center gap-3 z-10"
          >
            {/* Search Input Bar */}
            <div className="relative flex w-full max-w-xl items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 shadow-xl backdrop-blur-xl focus-within:border-white/50 focus-within:bg-white/15 transition-all">
              <Search className="h-5 w-5 text-neutral-300 shrink-0 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all apps, tools, and games..."
                className="w-full bg-transparent font-sans text-sm font-medium text-white placeholder-white/50 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="rounded-full p-1 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="ml-2 hidden sm:flex items-center gap-1 rounded-lg border border-white/20 bg-black/40 px-2 py-0.5 font-mono text-[10px] text-white/60">
                <span>ESC</span>
              </div>
            </div>

            {/* Category Chips Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl px-2 py-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Main App Grid */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="flex-1 w-full max-w-4xl my-auto overflow-y-auto px-4 py-4 scrollbar-none no-scrollbar [&::-webkit-scrollbar]:hidden"
          >
            {filteredApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-3xl border-2 border-white/20 bg-white/5 flex items-center justify-center text-white/40 mb-4">
                  <Search className="h-8 w-8 text-white/50" />
                </div>
                <h3 className="text-base font-bold text-white">No applications found</h3>
                <p className="text-xs text-white/60 mt-1 max-w-sm">
                  We couldn't find any app matching "{searchQuery}". Try a different name or browse by category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-4 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-y-7 gap-x-5 justify-items-center">
                {filteredApps.map((app) => {
                  const running = isAppRunning(app.id);
                  const onHomescreen = isAppOnDesktop(app.id);

                  return (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/onyx-app-id', app.id);
                        e.dataTransfer.setData('text/plain', app.id);
                        e.dataTransfer.effectAllowed = 'copy';
                        setTimeout(() => {
                          setIsDraggingApp(true);
                        }, 20);
                      }}
                      onDragEnd={() => {
                        setIsDraggingApp(false);
                      }}
                      onClick={() => handleLaunch(app.id)}
                      onContextMenu={(e) => handleContextMenu(e, app.id, app.name, app.category)}
                      className="group flex flex-col items-center w-24 p-1.5 rounded-2xl hover:bg-white/10 transition-all duration-150 ease-out hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing relative"
                    >
                      {/* App Icon Container */}
                      <div className="relative h-16 w-16 shrink-0 shadow-2xl group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-shadow">
                        <IosAppIcon appId={app.id} className="h-full w-full" />

                        {/* Active running pip */}
                        {running && (
                          <span
                            title="Application running"
                            className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-black"
                          />
                        )}

                        {/* Add / Remove from Homescreen Quick Hover Button */}
                        <button
                          type="button"
                          title={onHomescreen ? 'Remove from Homescreen' : 'Add to Homescreen'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleHomescreen(app.id, app.name);
                          }}
                          className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-md ${
                            onHomescreen
                              ? 'bg-rose-500/80 hover:bg-rose-500 text-white border border-rose-300/40'
                              : 'bg-white/25 hover:bg-white text-white hover:text-black border border-white/40'
                          }`}
                        >
                          {onHomescreen ? (
                            <Minus className="h-3 w-3 stroke-[3]" />
                          ) : (
                            <Plus className="h-3 w-3 stroke-[3]" />
                          )}
                        </button>
                      </div>

                      {/* App Name Label */}
                      <span className="mt-2 text-[12px] font-semibold text-white/95 text-center leading-tight truncate w-full px-1 group-hover:text-cyan-300 transition-colors drop-shadow-md">
                        {app.name}
                      </span>

                      {/* Category micro badge */}
                      <span className="text-[9px] font-mono uppercase tracking-wider text-white/50 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {app.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
