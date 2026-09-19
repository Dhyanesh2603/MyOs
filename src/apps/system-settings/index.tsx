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
    fontFamily,
    setFontFamily,
    uiScale,
    setUiScale,
  } = useThemeStore();

  const { wallpapers, currentWallpaperId, setWallpaper } = useWallpaperStore();

  return (
    <div className="flex h-full w-full bg-surface-panel text-content-primary">
      {/* Linear-Style Left Navigation Rail */}
      <aside className="w-44 border-r border-border-subtle bg-surface-overlay/80 p-2.5 flex flex-col justify-between select-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-content-primary">
            <SettingsIcon className="h-3.5 w-3.5 text-accent-primary" />
            <span>Preferences</span>
          </div>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'appearance'
                ? 'bg-surface-subtle text-content-primary font-semibold shadow-sm'
                : 'text-content-secondary hover:bg-surface-subtle/50'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            Appearance
          </button>

          <button
            onClick={() => setActiveTab('geometry')}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'geometry'
                ? 'bg-surface-subtle text-content-primary font-semibold shadow-sm'
                : 'text-content-secondary hover:bg-surface-subtle/50'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Geometry & Blur
          </button>

          <button
            onClick={() => setActiveTab('accessibility')}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'accessibility'
                ? 'bg-surface-subtle text-content-primary font-semibold shadow-sm'
                : 'text-content-secondary hover:bg-surface-subtle/50'
            }`}
          >
            <Accessibility className="h-3.5 w-3.5" />
            Accessibility
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-surface-subtle text-content-primary font-semibold shadow-sm'
                : 'text-content-secondary hover:bg-surface-subtle/50'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            About FlowOS
          </button>
        </div>

        <div className="space-y-0.5 px-2 py-1 font-mono text-[9px] text-content-tertiary">
          <div>proc: {processId.slice(-4)}</div>
          <div>win: {windowId.slice(-4)}</div>
        </div>
      </aside>

      {/* Main Settings Content Viewport */}
      <main className="flex-1 overflow-y-auto p-5 space-y-5 bg-surface-panel">
        {activeTab === 'appearance' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold tracking-tight text-content-primary">Theme Mode</h3>
              <p className="text-[11px] text-content-secondary mt-0.5">
                Switch between high-contrast, paper daylight, and natural dark architectures.
              </p>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
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
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs transition-all ${
                        isSelected
                          ? 'border-accent-primary bg-accent-primary/10 text-content-primary shadow-sm ring-1 ring-accent-primary/30'
                          : 'border-border-subtle bg-surface-subtle/40 text-content-secondary hover:bg-surface-subtle/80'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border-subtle pt-4">
              <h3 className="text-xs font-semibold tracking-tight text-content-primary">Accent Color Spectrum</h3>
              <p className="text-[11px] text-content-secondary mt-0.5">
                Real-time DOM CSS variable injection with zero React re-renders.
              </p>
              <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {(Object.keys(ACCENT_COLORS) as AccentColorId[]).map((key) => {
                  const def = ACCENT_COLORS[key];
                  const isSelected = accentColor === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setAccentColor(key)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-[10px] font-mono transition-all ${
                        isSelected
                          ? 'border-accent-primary/60 bg-accent-primary/10 text-content-primary'
                          : 'border-border-subtle bg-surface-subtle/40 text-content-tertiary hover:bg-surface-subtle/80'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: `rgb(${def.primary})` }}
                        className="flex h-5 w-5 items-center justify-center rounded-full shadow-sm"
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className="truncate">{def.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border-subtle pt-4">
              <h3 className="text-xs font-semibold tracking-tight text-content-primary">Architectural Backdrops</h3>
              <p className="text-[11px] text-content-secondary mt-0.5">
                Minimalist carbon lattices and Apple Pro gradient tones.
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {wallpapers.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWallpaper(w.id)}
                    style={w.style}
                    className={`h-14 rounded-lg border p-2 text-left text-[10px] font-mono transition-all ${
                      w.id === currentWallpaperId
                        ? 'border-accent-primary ring-1 ring-accent-primary text-content-primary'
                        : 'border-border-subtle opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="rounded bg-surface-panel/85 text-content-primary border border-border-subtle px-1.5 py-0.5 backdrop-blur-sm">
                      {w.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* System Typography Selector */}
            <div className="border-t border-border-subtle pt-4">
              <h3 className="text-xs font-semibold tracking-tight text-content-primary">System Typography Engine</h3>
              <p className="text-[11px] text-content-secondary mt-0.5">
                Switch operating system font hierarchy on the fly.
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { id: 'inter', label: 'Apple Inter', desc: 'Crisp & Clean' },
                  { id: 'ndot', label: 'Nothing NDOT', desc: 'Space Grotesk' },
                  { id: 'jetbrains', label: 'JetBrains Mono', desc: 'Hacker Terminal' },
                  { id: 'serif', label: 'Editorial Serif', desc: 'Classic Reading' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={`flex flex-col rounded-lg border p-2.5 text-left transition-all ${
                      fontFamily === f.id
                        ? 'border-accent-primary bg-accent-primary/10 ring-1 ring-accent-primary text-content-primary'
                        : 'border-border-subtle bg-surface-subtle/40 text-content-secondary hover:bg-surface-subtle'
                    }`}
                  >
                    <span className="font-semibold text-xs text-content-primary">{f.label}</span>
                    <span className="font-mono text-[9px] text-content-tertiary mt-0.5">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Global UI Density Scale */}
            <div className="border-t border-border-subtle pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-tight text-content-primary">Global UI Density Scale</h3>
                <span className="font-mono text-[11px] text-accent-primary">
                  {Math.round(uiScale * 100)}%
                </span>
              </div>
              <p className="text-[11px] text-content-secondary mt-0.5">
                Scale interface elements, dock icons, and typography proportionally.
              </p>
              <div className="mt-2.5 flex items-center gap-3">
                <span className="font-mono text-[10px] text-content-tertiary">85% Compact</span>
                <input
                  type="range"
                  min="0.85"
                  max="1.15"
                  step="0.05"
                  value={uiScale}
                  onChange={(e) => setUiScale(parseFloat(e.target.value))}
                  className="w-full accent-accent-primary cursor-pointer"
                />
                <span className="font-mono text-[10px] text-content-tertiary">115% Large</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'geometry' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-tight text-content-primary">Window Corner Radius</h3>
                <span className="font-mono text-[11px] text-accent-primary">
                  {windowRadius}px
                </span>
              </div>
              <p className="text-[11px] text-content-secondary mt-0.5">
                Adjust window curvature globally via CSS variables.
              </p>
              <input
                type="range"
                min="6"
                max="24"
                value={windowRadius}
                onChange={(e) => setWindowRadius(Number(e.target.value))}
                className="mt-3 w-full accent-accent-primary cursor-pointer"
              />
            </div>

            <div className="border-t border-border-subtle pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-tight text-content-primary">Glass Blur Materiality</h3>
                <span className="font-mono text-[11px] text-accent-primary">
                  {blurEnabled ? '16px' : '0px (Disabled)'}
                </span>
              </div>
              <p className="text-[11px] text-content-secondary mt-0.5">
                Backdrop-filter blur for low-end GPU performance.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => setBlurAmount(16)}
                  className={`rounded border px-3 py-1 text-xs font-mono transition-colors ${
                    blurEnabled
                      ? 'border-accent-primary/60 bg-accent-primary/10 text-content-primary'
                      : 'border-border-subtle bg-surface-subtle/40 text-content-tertiary'
                  }`}
                >
                  Enabled (16px)
                </button>
                <button
                  onClick={() => setBlurAmount(0)}
                  className={`rounded border px-3 py-1 text-xs font-mono transition-colors ${
                    !blurEnabled
                      ? 'border-accent-primary/60 bg-accent-primary/10 text-content-primary'
                      : 'border-border-subtle bg-surface-subtle/40 text-content-tertiary'
                  }`}
                >
                  Disabled (High Performance)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold tracking-tight text-content-primary">Reduced Motion</h3>
              <p className="text-[11px] text-content-secondary mt-0.5">
                Disable heavy spring animations for vestibular comfort.
              </p>
              <div className="mt-2.5">
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`rounded border px-3 py-1.5 text-xs font-mono transition-colors ${
                    reducedMotion
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                      : 'border-border-subtle bg-surface-subtle/40 text-content-secondary hover:bg-surface-subtle'
                  }`}
                >
                  {reducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}
                </button>
              </div>
            </div>

            <div className="border-t border-border-subtle pt-4">
              <h3 className="text-xs font-semibold tracking-tight text-content-primary">High Contrast Profile</h3>
              <p className="text-[11px] text-content-secondary mt-0.5">
                Maximum visibility mode with solid pure blacks and high-luminance borders.
              </p>
              <button
                onClick={() => setTheme('high-contrast')}
                className="mt-2.5 rounded border border-border-subtle bg-surface-subtle/50 px-3 py-1.5 text-xs font-mono text-content-primary hover:bg-surface-subtle"
              >
                Activate High Contrast Theme
              </button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-3 text-xs text-content-secondary leading-relaxed">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-content-primary">FlowOS v0.2.0</h3>
              <p className="text-[11px] text-accent-primary font-mono">
                Linear · Raycast · Arc · Warp · Apple Pro Apps · Obsidian · Nothing OS
              </p>
            </div>

            <div className="rounded-lg border border-border-subtle bg-surface-subtle/30 p-3 font-mono text-[10px] space-y-1">
              <div><span className="text-content-tertiary">Design Language:</span> Linear Obsidian Carbon</div>
              <div><span className="text-content-tertiary">Command Engine:</span> Raycast Spotlight</div>
              <div><span className="text-content-tertiary">Workspace Navigation:</span> Arc Nested Spaces</div>
              <div><span className="text-content-tertiary">Terminal Shell:</span> Warp Block Cards</div>
              <div><span className="text-content-tertiary">Hierarchy & Titlebars:</span> Apple Pro Apps Restraint</div>
              <div><span className="text-content-tertiary">Notes & Markdown:</span> Obsidian Reading Views</div>
              <div><span className="text-content-tertiary">Micro-Details:</span> Nothing OS Restrained Dot</div>
            </div>
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
  defaultSize: { width: 620, height: 460 },
  constraints: { minWidth: 500, minHeight: 360, maxWidth: 960, maxHeight: 760 },
  allowMultipleInstances: false,
  permissions: ['notifications'],
  component: SettingsApp,
};
