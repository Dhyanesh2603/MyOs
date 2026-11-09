import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Download,
  Trash2,
  Star,
  Sparkles,
  Play,
  Plus,
  Globe,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { usePackageStore } from '@core/packages/packageStore';
import { IosAppIcon } from '@shell/icons/IosAppIcon';
import { useProcessStore } from '@core/process/processStore';
import { useCustomAppStore, WEB_APP_ICONS } from '@core/packages/customAppStore';
import { soundEngine } from '@core/audio/soundEngine';

export const AppStoreApp: React.FC<AppProps> = () => {
  const { packages, installPackage, uninstallPackage } = usePackageStore();
  const { customApps, openCreateModal, deleteWebApp } = useCustomAppStore();
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
    <div className="flex h-full w-full flex-col bg-[#08090d] text-neutral-100 select-none overflow-y-auto scrollbar-none no-scrollbar">
      {/* App Store Header & Search */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-[#0e1017]/95 p-4 gap-3 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] border border-white/10 text-white shadow-sm">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Flow App Store</h1>
            <p className="text-[10px] text-neutral-400">
              Discover and install verified community apps and plugins
            </p>
          </div>
        </div>

        {/* Search Bar & Package Web App Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex items-center w-full sm:w-60">
            <Search className="absolute left-3 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#161824] py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-white/30 transition-all"
            />
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              openCreateModal();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-black shadow-md hover:bg-neutral-200 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-black" />
            <span>Package Web App</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Featured Hero Banner */}
        {featured && !searchQuery && selectedCategory === 'all' && (
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-white/[0.08] via-white/[0.03] to-transparent p-6 shadow-xl">
            <div className="relative z-10 max-w-md space-y-2.5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Featured Application</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {featured.name}
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {featured.description}
              </p>
              <div className="pt-2 flex items-center gap-3">
                {featured.installed ? (
                  <button
                    onClick={() => launchApp(featured.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-black" />
                    <span>Launch</span>
                  </button>
                ) : (
                  <button
                    onClick={() => installPackage(featured.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-black" />
                    <span>Get ({featured.sizeKb} KB)</span>
                  </button>
                )}
                <div className="flex items-center gap-1 font-mono text-xs text-amber-400 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{featured.rating}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1.5 border-b border-white/[0.08] pb-3 overflow-x-auto text-xs font-medium scrollbar-none no-scrollbar">
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
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Packaged Web Apps Section */}
        {customApps.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Custom Web Apps ({customApps.length})
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customApps.map((app) => {
                const IconComp = WEB_APP_ICONS[app.iconName] ?? Globe;
                return (
                  <div
                    key={app.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#12141c] p-4 shadow-sm hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                        style={{ backgroundColor: app.accentColor }}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="truncate text-xs font-bold text-white">
                            {app.name}
                          </h4>
                          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                            {app.category}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 font-mono text-[10px] text-neutral-400">
                          {app.url}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.08] pt-2.5">
                      <span className="font-mono text-[10px] text-emerald-400 font-medium">
                        ● Installed
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => launchApp(app.id)}
                          className="flex items-center gap-1 rounded-lg bg-white/[0.06] border border-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/15 transition-all cursor-pointer"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Open</span>
                        </button>
                        <button
                          onClick={() => deleteWebApp(app.id)}
                          title="Uninstall"
                          className="rounded-lg p-1 text-neutral-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => {
            return (
              <div
                key={pkg.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#12141c] p-4 hover:border-white/20 hover:bg-[#161824] transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 shrink-0">
                      <IosAppIcon appId={pkg.id} className="h-full w-full" />
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs text-amber-400 bg-black/40 px-2 py-0.5 rounded-lg border border-white/10">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{pkg.rating}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-white">
                      {pkg.name}
                    </h3>
                    <p className="font-mono text-[10px] text-neutral-400">
                      by {pkg.author} • v{pkg.version}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-300 line-clamp-2">
                      {pkg.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
                  <span className="font-mono text-[10px] text-neutral-400">
                    {pkg.sizeKb} KB
                  </span>

                  <div className="flex items-center gap-2">
                    {pkg.installed ? (
                      <>
                        <button
                          onClick={() => launchApp(pkg.id)}
                          className="flex items-center gap-1 rounded-lg bg-white/[0.06] border border-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition-all active:scale-95 cursor-pointer"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Open</span>
                        </button>
                        <button
                          onClick={() => uninstallPackage(pkg.id)}
                          title="Uninstall"
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => installPackage(pkg.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black shadow-sm hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
                      >
                        <Download className="h-3 w-3 text-black" />
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
