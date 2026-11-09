import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Sparkles,
  Layers,
  Code2,
  FolderGit2,
  PlayCircle,
  Wrench,
  Gamepad2,
  SlidersHorizontal,
} from 'lucide-react';
import { appRegistry } from '@core/process/registry';
import { useProcessStore } from '@core/process/processStore';
import { soundEngine } from '@core/audio/soundEngine';
import { IosAppIcon } from '@shell/icons/IosAppIcon';
import { useAppMenuStore, AppMenuCategory } from './appMenuStore';

const CATEGORIES: { id: AppMenuCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All Apps', icon: Layers },
  { id: 'productivity', label: 'Productivity', icon: FolderGit2 },
  { id: 'development', label: 'Developer', icon: Code2 },
  { id: 'media', label: 'Media & Creation', icon: PlayCircle },
  { id: 'games', label: 'Arcade & Games', icon: Gamepad2 },
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

  const { launchApp, isAppRunning, processes } = useProcessStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
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
          app.id.startsWith('flow-') ||
          app.id.includes('game') ||
          app.id.includes('pong') ||
          app.id.includes('snake') ||
          app.id.includes('connect') ||
          app.id.includes('2048') ||
          app.id.includes('sweeper') ||
          app.category === 'utilities' && (app.id.includes('2048') || app.id.includes('sweeper'))
        );
      }

      return app.category === selectedCategory;
    });
  }, [allApps, searchQuery, selectedCategory]);

  const runningCount = Object.keys(processes).length;

  const handleLaunch = (appId: string) => {
    soundEngine.playClick();
    launchApp(appId);
    closeAppMenu();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeAppMenu}
          className="fixed inset-0 z-[9600] flex flex-col items-center justify-between bg-black/75 backdrop-blur-2xl select-none px-4 pt-10 pb-6 overflow-hidden"
        >
          {/* Top Search & Filter Control Bar */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl flex flex-col items-center gap-3.5 z-10"
          >
            {/* Search Input Bar */}
            <div className="relative flex w-full items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 shadow-xl backdrop-blur-xl focus-within:border-white/50 focus-within:bg-white/15 transition-all">
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

            {/* Category Chips Bar (Safe Flex Scroll with No-Clipped Start) */}
            <div className="flex w-full max-w-full items-center justify-start sm:justify-center gap-1.5 overflow-x-auto px-4 py-1 scrollbar-none no-scrollbar">
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
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm'
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

          {/* Main App Grid (Mobile App Library layout) */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.05 }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 w-full max-w-4xl my-auto overflow-y-auto px-4 py-6 scrollbar-none no-scrollbar"
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

                  return (
                    <motion.button
                      key={app.id}
                      whileHover={{ scale: 1.1, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 350 }}
                      onClick={() => handleLaunch(app.id)}
                      className="group flex flex-col items-center w-24 p-1.5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer relative"
                    >
                      {/* App Icon Container */}
                      <div className="relative h-16 w-16 shrink-0 shadow-2xl group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-shadow">
                        <IosAppIcon appId={app.id} className="h-full w-full" />

                        {/* Active running pip (solid clean dot, no glow) */}
                        {running && (
                          <span
                            title="Application running"
                            className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-black"
                          />
                        )}
                      </div>

                      {/* App Name Label (clean, stark high-contrast typography) */}
                      <span className="mt-2 text-[12px] font-semibold text-white/95 text-center leading-tight truncate w-full px-1 group-hover:text-cyan-300 transition-colors drop-shadow-md">
                        {app.name}
                      </span>

                      {/* Category micro badge */}
                      <span className="text-[9px] font-mono uppercase tracking-wider text-white/50 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {app.category}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Bottom Telemetry & Quick Action Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-mono backdrop-blur-xl text-white/70"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/60" />
              <span>App Library</span>
              <span className="text-white/40">•</span>
              <span className="text-white font-semibold">{allApps.length} Apps Installed</span>
            </div>

            <div className="flex items-center gap-2">
              {runningCount > 0 && (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  {runningCount} Running
                </span>
              )}

              <button
                onClick={() => {
                  soundEngine.playClick();
                  closeAppMenu();
                  launchApp('app-store');
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-white/80 hover:text-white transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                <span>Get Apps</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
