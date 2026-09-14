import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Sliders,
  Accessibility,
  Info,
  Sun,
  Moon,
  Eye,
  Check,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import type { ThemeId, AccentColorId } from '@contracts/theme';
import { useThemeStore, ACCENT_COLORS } from '@core/theme/themeStore';
import { useWallpaperStore } from '@core/theme/wallpaperStore';

type SettingsTab = 'appearance' | 'geometry' | 'accessibility' | 'about';

const SettingsApp: React.FC<AppProps> = ({ windowId, processId }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  const {
    themeId,
    accentColor,
    windowRadius,
    blurEnabled,
    reducedMotion,
    setTheme,
    setAccentColor,
    setWindowRadius,
    setBlurAmount,
    setReducedMotion,
  } = useThemeStore();

  const { wallpapers, currentWallpaperId, setWallpaper } = useWallpaperStore();

  return (
    <div className="flex h-full w-full bg-surface-panel text-content-primary">
      {/* Settings Navigation Rail */}
      <aside className="w-48 border-r border-white/5 bg-surface-overlay/30 p-3 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-content-secondary">
            <SettingsIcon className="h-4 w-4 text-accent-primary" />
            <span>Preferences</span>
          </div>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'appearance'
                ? 'bg-accent-primary/20 text-content-primary border border-accent-primary/30'
                : 'text-content-secondary hover:bg-white/5'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            Appearance
          </button>

          <button
            onClick={() => setActiveTab('geometry')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'geometry'
                ? 'bg-accent-primary/20 text-content-primary border border-accent-primary/30'
                : 'text-content-secondary hover:bg-white/5'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Window & Blur
          </button>

          <button
            onClick={() => setActiveTab('accessibility')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'accessibility'
                ? 'bg-accent-primary/20 text-content-primary border border-accent-primary/30'
                : 'text-content-secondary hover:bg-white/5'
            }`}
          >
            <Accessibility className="h-3.5 w-3.5" />
            Accessibility
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-accent-primary/20 text-content-primary border border-accent-primary/30'
                : 'text-content-secondary hover:bg-white/5'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            About FlowOS
          </button>
        </div>

        <div className="space-y-0.5 px-2 py-1 font-mono text-[10px] text-content-tertiary">
          <div>proc: {processId.slice(-6)}</div>
          <div>win: {windowId.slice(-6)}</div>
        </div>
      </aside>

      {/* Main Settings Content Viewport */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold">Theme Mode</h3>
              <p className="text-xs text-content-secondary mt-0.5">
                Switch the operating system color space.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {[
                  { id: 'dark', label: 'Dark Obsidian', icon: Moon },
                  { id: 'light', label: 'Light Daylight', icon: Sun },
                  { id: 'high-contrast', label: 'High Contrast', icon: Eye },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = themeId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id as ThemeId)}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs transition-all ${
                        isSelected
                          ? 'border-accent-primary bg-accent-primary/15 text-content-primary shadow-sm'
                          : 'border-white/10 bg-white/5 text-content-secondary hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/5 pt-5">
              <h3 className="text-sm font-semibold">Accent Color Spectrum</h3>
              <p className="text-xs text-content-secondary mt-0.5">
                Updates CSS variables in real time with zero React re-render delay.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                {(Object.keys(ACCENT_COLORS) as AccentColorId[]).map((key) => {
                  const def = ACCENT_COLORS[key];
                  const isSelected = accentColor === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setAccentColor(key)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-[11px] transition-all ${
                        isSelected
                          ? 'border-white/30 bg-white/10 text-content-primary'
                          : 'border-white/5 bg-white/5 text-content-tertiary hover:bg-white/10'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: `rgb(${def.primary})` }}
                        className="flex h-6 w-6 items-center justify-center rounded-full shadow-sm"
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="truncate">{def.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/5 pt-5">
              <h3 className="text-sm font-semibold">Wallpaper Backdrop</h3>
              <p className="text-xs text-content-secondary mt-0.5">
                Curated geometric and kinetic ambient backdrops.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {wallpapers.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWallpaper(w.id)}
                    style={w.style}
                    className={`h-16 rounded-xl border p-2 text-left text-[11px] font-medium transition-all ${
                      w.id === currentWallpaperId
                        ? 'border-accent-primary ring-2 ring-accent-primary/40 text-white'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="rounded bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
                      {w.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'geometry' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Window Corner Radius</h3>
                <span className="font-mono text-xs text-accent-primary">
                  {windowRadius}px
                </span>
              </div>
              <p className="text-xs text-content-secondary mt-0.5">
                Adjust window curvature globally via CSS variables.
              </p>
              <input
                type="range"
                min="8"
                max="28"
                value={windowRadius}
                onChange={(e) => setWindowRadius(Number(e.target.value))}
                className="mt-3 w-full accent-accent-primary cursor-pointer"
              />
            </div>

            <div className="border-t border-white/5 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Glass Frosted Blur Intensity</h3>
                <span className="font-mono text-xs text-accent-primary">
                  {blurEnabled ? '24px' : '0px (Disabled)'}
                </span>
              </div>
              <p className="text-xs text-content-secondary mt-0.5">
                Adjust backdrop-filter blur for low-end GPU performance.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => setBlurAmount(24)}
                  className={`rounded-lg border px-3 py-1.5 text-xs ${
                    blurEnabled
                      ? 'border-accent-primary bg-accent-primary/20 text-content-primary'
                      : 'border-white/10 bg-white/5 text-content-secondary'
                  }`}
                >
                  Enable Frosted Blur (24px)
                </button>
                <button
                  onClick={() => setBlurAmount(0)}
                  className={`rounded-lg border px-3 py-1.5 text-xs ${
                    !blurEnabled
                      ? 'border-accent-primary bg-accent-primary/20 text-content-primary'
                      : 'border-white/10 bg-white/5 text-content-secondary'
                  }`}
                >
                  Disable Blur (Max Performance)
                </button>
              </div>
            </div>

            {/* Live Token Preview Box */}
            <div className="border-t border-white/5 pt-5">
              <h4 className="text-xs font-mono uppercase text-content-tertiary">
                Live Dynamic Token Preview
              </h4>
              <div
                style={{ borderRadius: `${windowRadius}px` }}
                className="mt-3 border border-white/15 bg-surface-overlay/80 p-4 shadow-window backdrop-blur-window transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-accent-primary" />
                  <span className="text-xs font-semibold text-content-primary">
                    Real-Time Token Mutation
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-content-secondary">
                  Notice how adjusting the radius slider changes this preview and all open windows instantly without full page reloads.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold">Reduced Motion</h3>
              <p className="text-xs text-content-secondary mt-0.5">
                Disable heavy spring animations for vestibular comfort.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
                    reducedMotion
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/10 bg-white/5 text-content-secondary hover:bg-white/10'
                  }`}
                >
                  {reducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}
                </button>
              </div>
            </div>

            <div className="border-t border-white/5 pt-5">
              <h3 className="text-sm font-semibold">High Contrast Profile</h3>
              <p className="text-xs text-content-secondary mt-0.5">
                Maximum visibility mode with solid pure blacks and high-luminance borders.
              </p>
              <button
                onClick={() => setTheme('high-contrast')}
                className="mt-3 rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-xs text-content-primary hover:bg-white/10"
              >
                Activate High Contrast Theme
              </button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-4 text-xs leading-relaxed text-content-secondary">
            <div>
              <h3 className="text-sm font-semibold text-content-primary">FlowOS v0.1.0</h3>
              <p className="text-[11px] text-accent-primary font-mono mt-0.5">
                Browser-Based Desktop Operating System
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-surface-overlay/40 p-4 font-mono text-[11px] space-y-1.5">
              <div><span className="text-content-tertiary">Kernel:</span> React 19 + TypeScript + Zustand</div>
              <div><span className="text-content-tertiary">Motion Engine:</span> Motion (GPU-compositor spring values)</div>
              <div><span className="text-content-tertiary">Storage:</span> IndexedDB POSIX Virtual File System</div>
              <div><span className="text-content-tertiary">Window Geometry:</span> 8-Axis Pointer Capture Frame</div>
              <div><span className="text-content-tertiary">Focus Stack:</span> Bounded Array Stacking Engine</div>
            </div>

            <p>
              Designed and built as a long-term flagship showcase of elite frontend engineering, interaction design, performance optimization, and scalable modular architecture.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export const settingsManifest: AppManifest = {
  id: 'system-settings',
  name: 'Settings',
  description: 'Customize FlowOS preferences, appearance, window physics, and accessibility.',
  category: 'system',
  icon: SettingsIcon,
  defaultSize: { width: 660, height: 490 },
  constraints: { minWidth: 520, minHeight: 380, maxWidth: 960, maxHeight: 760 },
  allowMultipleInstances: false,
  permissions: ['notifications'],
  component: SettingsApp,
};
