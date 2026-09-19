import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Download,
  Trash2,
  Star,
  Sparkles,
  Play,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { usePackageStore } from '@core/packages/packageStore';
import { useProcessStore } from '@core/process/processStore';

export const AppStoreApp: React.FC<AppProps> = () => {
  const { packages, installPackage, uninstallPackage } = usePackageStore();
  const { launchApp } = useProcessStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'installed'
          ? pkg.installed
          : pkg.category === selectedCategory;

      const matchesSearch =
        !searchQuery.trim() ||
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [packages, selectedCategory, searchQuery]);

  const featured = packages[0];

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel text-content-primary select-none overflow-y-auto">
      {/* App Store Header & Search */}
      <div className="flex flex-wrap items-center justify-between border-b border-border-subtle bg-surface-overlay/80 p-4 gap-3 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-fg shadow-sm">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Flow App Store</h1>
            <p className="text-[10px] text-content-tertiary">
              Discover and install verified community apps and plugins
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center w-full sm:w-64">
          <Search className="absolute left-3 h-3.5 w-3.5 text-content-tertiary" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border-subtle bg-surface-subtle/60 py-1.5 pl-9 pr-3 text-xs text-content-primary placeholder-content-tertiary outline-none focus:border-accent transition-all"
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Featured Hero Banner */}
        {featured && !searchQuery && selectedCategory === 'all' && (
          <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/20 via-surface-subtle to-surface-panel p-6 shadow-xl">
            <div className="relative z-10 max-w-md space-y-2">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-accent font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Featured Application</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-content-primary">
                {featured.name}
              </h2>
              <p className="text-xs text-content-secondary leading-relaxed">
                {featured.description}
              </p>
              <div className="pt-2 flex items-center gap-3">
                {featured.installed ? (
                  <button
                    onClick={() => launchApp(featured.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg shadow-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Launch</span>
                  </button>
                ) : (
                  <button
                    onClick={() => installPackage(featured.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-fg shadow-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Get ({featured.sizeKb} KB)</span>
                  </button>
                )}
                <div className="flex items-center gap-1 font-mono text-xs text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{featured.rating}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1.5 border-b border-border-subtle pb-3 overflow-x-auto text-xs font-medium">
          {[
            { id: 'all', label: 'All Packages' },
            { id: 'developer', label: 'Developer' },
            { id: 'productivity', label: 'Productivity' },
            { id: 'fun', label: 'Fun & Utilities' },
            { id: 'installed', label: 'Installed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                selectedCategory === tab.id
                  ? 'bg-surface-subtle text-accent border border-border-subtle font-semibold shadow-xs'
                  : 'text-content-tertiary hover:bg-surface-hover hover:text-content-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => {
            const Icon = pkg.manifest.icon;

            return (
              <div
                key={pkg.id}
                className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-subtle/30 p-4 hover:border-border-strong hover:bg-surface-subtle/60 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface-panel text-accent shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs text-amber-400 bg-surface-panel/80 px-2 py-0.5 rounded-lg border border-border-subtle">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{pkg.rating}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-content-primary">
                      {pkg.name}
                    </h3>
                    <p className="font-mono text-[10px] text-content-tertiary">
                      by {pkg.author} • v{pkg.version}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-content-secondary line-clamp-2">
                      {pkg.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border-subtle/60 pt-3">
                  <span className="font-mono text-[10px] text-content-tertiary">
                    {pkg.sizeKb} KB
                  </span>

                  <div className="flex items-center gap-2">
                    {pkg.installed ? (
                      <>
                        <button
                          onClick={() => launchApp(pkg.id)}
                          className="flex items-center gap-1 rounded-lg bg-surface-panel border border-border-subtle px-3 py-1.5 text-xs font-semibold text-content-primary hover:bg-accent hover:text-accent-fg hover:border-accent transition-all active:scale-95"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Open</span>
                        </button>
                        <button
                          onClick={() => uninstallPackage(pkg.id)}
                          title="Uninstall"
                          className="rounded-lg p-1.5 text-content-tertiary hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => installPackage(pkg.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg shadow-xs hover:opacity-90 active:scale-95 transition-all"
                      >
                        <Download className="h-3 w-3" />
                        <span>Install</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const appStoreManifest: AppManifest = {
  id: 'app-store',
  name: 'App Store',
  description: 'Discover and install verified community applications and developer extensions.',
  category: 'utilities',
  icon: ShoppingBag,
  defaultSize: { width: 800, height: 560 },
  constraints: { minWidth: 540, minHeight: 400, maxWidth: 1400, maxHeight: 1000 },
  allowMultipleInstances: false,
  permissions: ['vfs:read', 'vfs:write'],
  component: AppStoreApp,
};
