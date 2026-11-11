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
  LayoutGrid,
  Grid,
  Move,
  Shapes,
  Sparkles,
  RotateCcw,
  PanelBottom,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import type { ThemeId, AccentColorId, IconShape, WindowMaterial } from '@contracts/theme';
import { useThemeStore, ACCENT_COLORS } from '@core/theme/themeStore';
import { useWallpaperStore } from '@core/theme/wallpaperStore';
import { useDesktopStore } from '@core/desktop/desktopStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { useDockStore, type DockAutoHideMode } from '@shell/dock/dockStore';

type SettingsTab = 'appearance' | 'desktop' | 'geometry' | 'accessibility' | 'about';

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
    iconShape,
    setIconShape,
    windowMaterial,
    setWindowMaterial,
    windowOpacity,
    setWindowOpacity,
  } = useThemeStore();

  const { wallpapers, currentWallpaperId, setWallpaper } = useWallpaperStore();
  const layoutMode = useDesktopStore((state) => state.layoutMode);
  const setLayoutMode = useDesktopStore((state) => state.setLayoutMode);
  const autoArrangeGrid = useDesktopStore((state) => state.autoArrangeGrid);
  const shortcuts = useDesktopStore((state) => state.shortcuts);
  const autoHideMode = useDockStore((state) => state.autoHideMode);
  const setAutoHideMode = useDockStore((state) => state.setAutoHideMode);

  return (
    <div className="flex h-full w-full bg-[#0a0b10] text-neutral-100 select-none">
      {/* Settings Navigation Rail */}
      <aside className="w-52 border-r border-white/[0.08] bg-[#0e1017] p-3 flex flex-col justify-between select-none shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-white">
            <SettingsIcon className="h-4 w-4 text-neutral-300" />
            <span>Preferences</span>
          </div>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            Appearance & Glass
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Desktop & Grid
          </button>

          <button
            onClick={() => setActiveTab('geometry')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'geometry'
                ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Geometry & Blur
          </button>

          <button
            onClick={() => setActiveTab('accessibility')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'accessibility'
                ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
            }`}
          >
            <Accessibility className="h-3.5 w-3.5" />
            Accessibility
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            About Onyx OS
          </button>
        </div>

        <div className="space-y-0.5 px-2.5 py-1 font-mono text-[9px] text-neutral-500">
          <div>proc: {processId.slice(-4)}</div>
          <div>win: {windowId.slice(-4)}</div>
        </div>
      </aside>

      {/* Main Settings Content Viewport */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a0b10] scrollbar-none no-scrollbar">
        {/* TAB 1: APPEARANCE */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">Theme Architecture</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Switch between high-contrast, paper daylight, and deep obsidian canvases.
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
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white/30 bg-white/10 text-white shadow-md ring-1 ring-white/20'
                          : 'border-white/10 bg-[#12141c] text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px] font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Window Materiality: Glass vs Solid vs Translucent */}
            <div className="border-t border-white/[0.08] pt-5">
              <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">Window Materiality & Shading</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Choose between frosted liquid glass, opaque studio matte, or airy translucent polymer.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {[
                  { id: 'glass', label: 'Frosted Glass', desc: 'Backdrop blur & specular edge' },
                  { id: 'solid', label: 'Opaque Solid', desc: 'High-contrast jet matte black' },
                  { id: 'translucent', label: 'Translucent Film', desc: 'Lightweight glassy tint' },
                ].map((mat) => {
                  const isSelected = windowMaterial === mat.id;
                  return (
                    <button
                      key={mat.id}
                      onClick={() => setWindowMaterial(mat.id as WindowMaterial)}
                      className={`flex flex-col text-left rounded-xl border p-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white/40 bg-white/10 text-white shadow-md ring-1 ring-white/30'
                          : 'border-white/10 bg-[#12141c] text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{mat.label}</span>
                        {isSelected && <Sparkles className="h-3.5 w-3.5 text-cyan-400" />}
                      </div>
                      <span className="font-mono text-[9px] text-neutral-400 mt-1">{mat.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Window Opacity Slider */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-neutral-300">Window Opacity Surface</span>
                <span className="font-mono text-[11px] text-white font-semibold">
                  {Math.round(windowOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={windowOpacity}
                onChange={(e) => setWindowOpacity(parseFloat(e.target.value))}
                className="mt-2 w-full accent-white cursor-pointer"
              />
            </div>

            {/* Accent Spectrum */}
            <div className="border-t border-white/[0.08] pt-5">
              <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">Accent Spectrum</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Dynamic CSS variable injection directly across the desktop shell.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {(Object.keys(ACCENT_COLORS) as AccentColorId[]).map((key) => {
                  const def = ACCENT_COLORS[key];
                  const isSelected = accentColor === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setAccentColor(key)}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-2.5 text-[10px] font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white/30 bg-white/10 text-white shadow-sm'
                          : 'border-white/10 bg-[#12141c] text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: `rgb(${def.primary})` }}
                        className="flex h-5 w-5 items-center justify-center rounded-full shadow-sm"
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <span className="truncate font-medium">{def.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wallpapers */}
            <div className="border-t border-white/[0.08] pt-5">
              <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">Desktop Wallpapers</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Artisanal dark gradients, deep lattices, and dynamic atmospheres.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {wallpapers.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWallpaper(w.id)}
                    style={w.style}
                    className={`h-16 rounded-xl border p-2 text-left text-[10px] font-mono transition-all cursor-pointer ${
                      w.id === currentWallpaperId
                        ? 'border-white ring-2 ring-white/30 text-white shadow-lg'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="rounded-md bg-black/80 text-white border border-white/10 px-2 py-0.5 backdrop-blur-md font-sans text-[10px] font-medium">
                      {w.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Hierarchy */}
            <div className="border-t border-white/[0.08] pt-5">
              <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">Typography Hierarchy</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Select your preferred system typography.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  { id: 'inter', label: 'Apple Inter', desc: 'Crisp & Clean' },
                  { id: 'ndot', label: 'Nothing NDOT', desc: 'Space Grotesk' },
                  { id: 'jetbrains', label: 'JetBrains Mono', desc: 'Hacker Terminal' },
                  { id: 'serif', label: 'Editorial Serif', desc: 'Classic Reading' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={`flex flex-col rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      fontFamily === f.id
                        ? 'border-white/30 bg-white/10 ring-1 ring-white/20 text-white shadow-sm'
                        : 'border-white/10 bg-[#12141c] text-neutral-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="font-semibold text-xs text-white">{f.label}</span>
                    <span className="font-mono text-[9px] text-neutral-400 mt-1">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Global UI Density Scale */}
            <div className="border-t border-white/[0.08] pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">UI Scale & Density</h3>
                <span className="font-mono text-[11px] text-white font-semibold">
                  {Math.round(uiScale * 100)}%
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Scale interface elements and typography proportionally.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="font-mono text-[10px] text-neutral-400">85% Compact</span>
                <input
                  type="range"
                  min="0.85"
                  max="1.15"
                  step="0.05"
                  value={uiScale}
                  onChange={(e) => setUiScale(parseFloat(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
                <span className="font-mono text-[10px] text-neutral-400">115% Large</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DESKTOP & GRID */}
        {activeTab === 'desktop' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">Desktop Placement Architecture</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Toggle between automatic grid column snapping and unrestricted freeform drag placement.
              </p>

              <div className="mt-3.5 grid grid-cols-2 gap-3">
                {/* Option A: Grid Snapping */}
                <button
                  onClick={() => {
                    setLayoutMode('grid');
                    useNotificationStore.getState().notify({
                      title: 'Grid Layout Enabled',
                      message: 'Desktop icons now snap to fixed 96x100 grid cells.',
                      type: 'info',
                    });
                  }}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    layoutMode === 'grid'
                      ? 'border-white/40 bg-white/10 ring-1 ring-white/30 text-white shadow-md'
                      : 'border-white/10 bg-[#12141c] text-neutral-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Grid className="h-5 w-5 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Fixed Grid Snapping</span>
                    {layoutMode === 'grid' && (
                      <span className="ml-auto rounded-full bg-cyan-500/20 px-2 py-0.5 font-mono text-[9px] text-cyan-300">Active</span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Icons snap precisely to orderly columns and rows. Dragging automatically locks to the nearest grid cell.
                  </p>
                </button>

                {/* Option B: Freeform Drag */}
                <button
                  onClick={() => {
                    setLayoutMode('freeform');
                    useNotificationStore.getState().notify({
                      title: 'Freeform Layout Enabled',
                      message: 'Desktop icons can be positioned anywhere freely.',
                      type: 'info',
                    });
                  }}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    layoutMode === 'freeform'
                      ? 'border-white/40 bg-white/10 ring-1 ring-white/30 text-white shadow-md'
                      : 'border-white/10 bg-[#12141c] text-neutral-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Move className="h-5 w-5 text-amber-400" />
                    <span className="text-xs font-bold text-white">Freeform Placement</span>
                    {layoutMode === 'freeform' && (
                      <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[9px] text-amber-300">Active</span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Place icons anywhere on the desktop canvas with fluid pixel coordinates. No snapping constraints.
                  </p>
                </button>
              </div>

              {/* Auto Arrange Button */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-[#12141c] p-3.5">
                <div>
                  <div className="text-xs font-semibold text-white">Auto-Arrange Desktop Icons</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Organize all default apps, pinned shortcuts, and desktop files into pristine columns.
                  </div>
                </div>
                <button
                  onClick={() => {
                    const allIds = shortcuts.map((s) => s.id);
                    autoArrangeGrid(allIds);
                    useNotificationStore.getState().notify({
                      title: 'Desktop Arranged',
                      message: 'All desktop icons aligned neatly to grid.',
                      type: 'success',
                    });
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-all cursor-pointer shrink-0 ml-3"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Align Icons</span>
                </button>
              </div>
            </div>

            {/* Icon Morphing & Geometry */}
            <div className="border-t border-white/[0.08] pt-5">
              <div className="flex items-center gap-2">
                <Shapes className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">Icon Geometry Morphing</h3>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Morph application icons across the dock, launchpad, and desktop into your preferred silhouette.
              </p>
              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'squircle', label: 'Squircle', desc: 'Apple iOS Curvature' },
                  { id: 'circle', label: 'Circle', desc: 'Android Pixel Minimal' },
                  { id: 'rounded', label: 'Rounded', desc: 'macOS Big Sur Tile' },
                  { id: 'smooth', label: 'Smooth', desc: 'Nothing OS Soft Pill' },
                ].map((shape) => {
                  const isSelected = iconShape === shape.id;
                  return (
                    <button
                      key={shape.id}
                      onClick={() => setIconShape(shape.id as IconShape)}
                      className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white/40 bg-white/10 ring-1 ring-white/30 text-white shadow-md'
                          : 'border-white/10 bg-[#12141c] text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div
                        className={`h-8 w-8 bg-gradient-to-tr from-cyan-500 to-indigo-500 mb-2 shadow-sm ${
                          shape.id === 'circle'
                            ? 'rounded-full'
                            : shape.id === 'squircle'
                            ? 'rounded-[22.5%]'
                            : shape.id === 'rounded'
                            ? 'rounded-lg'
                            : 'rounded-2xl'
                        }`}
                      />
                      <span className="text-xs font-semibold text-white">{shape.label}</span>
                      <span className="font-mono text-[9px] text-neutral-400 mt-0.5">{shape.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dock Auto-Hide & Behavior */}
            <div className="border-t border-white/[0.08] pt-5">
              <div className="flex items-center gap-2">
                <PanelBottom className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">Dock & Taskbar Visibility</h3>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Configure when the bottom application dock appears on the screen.
              </p>
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'always', label: 'Bottom Hot-Edge', desc: 'Hidden until cursor hits bottom (Default)' },
                  { id: 'smart', label: 'Smart Auto-Hide', desc: 'Hides when overlapping windows' },
                  { id: 'never', label: 'Always Visible', desc: 'Pinned permanently at bottom' },
                ].map((item) => {
                  const isSelected = autoHideMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAutoHideMode(item.id as DockAutoHideMode)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white/40 bg-white/10 ring-1 ring-white/30 text-white shadow-md'
                          : 'border-white/10 bg-[#12141c] text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-semibold text-white">{item.label}</span>
                      <span className="font-mono text-[9px] text-neutral-400 mt-1">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GEOMETRY & BLUR */}
        {activeTab === 'geometry' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">Window Curvature</h3>
                <span className="font-mono text-[11px] text-white font-semibold">
                  {windowRadius}px
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Adjust window corner radius across all applications.
              </p>
              <input
                type="range"
                min="6"
                max="24"
                value={windowRadius}
                onChange={(e) => setWindowRadius(Number(e.target.value))}
                className="mt-3.5 w-full accent-white cursor-pointer"
              />
            </div>

            <div className="border-t border-white/[0.08] pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">Glass Blur Materiality</h3>
                <span className="font-mono text-[11px] text-white font-semibold">
                  {blurEnabled ? '16px' : '0px (Disabled)'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Backdrop-filter blur for low-end GPU performance.
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <button
                  onClick={() => setBlurAmount(16)}
                  className={`rounded-xl border px-3.5 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                    blurEnabled
                      ? 'border-white/30 bg-white/10 text-white font-semibold'
                      : 'border-white/10 bg-[#12141c] text-neutral-400 hover:text-white'
                  }`}
                >
                  Enabled (16px)
                </button>
                <button
                  onClick={() => setBlurAmount(0)}
                  className={`rounded-xl border px-3.5 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                    !blurEnabled
                      ? 'border-white/30 bg-white/10 text-white font-semibold'
                      : 'border-white/10 bg-[#12141c] text-neutral-400 hover:text-white'
                  }`}
                >
                  Disabled (High Performance)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACCESSIBILITY */}
        {activeTab === 'accessibility' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">Reduced Motion</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Disable heavy spring animations for vestibular comfort.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`rounded-xl border px-4 py-2 text-xs font-mono transition-colors cursor-pointer ${
                    reducedMotion
                      ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'border-white/10 bg-[#12141c] text-neutral-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {reducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}
                </button>
              </div>
            </div>

            <div className="border-t border-white/[0.08] pt-5">
              <h3 className="text-xs font-bold tracking-tight text-white uppercase tracking-wider">High Contrast Profile</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Maximum visibility mode with solid pure blacks and high-luminance borders.
              </p>
              <button
                onClick={() => setTheme('high-contrast')}
                className="mt-3 rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-mono text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Activate High Contrast Theme
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">Onyx OS v2.0</h3>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                Artisanal Web Operating System Architecture
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#12141c] p-4 font-mono text-[10px] space-y-2">
              <div className="flex justify-between border-b border-white/[0.06] pb-1.5"><span className="text-neutral-400">Design Language</span> <span className="text-white">Opus 5.5 Bespoke Artisanal</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-1.5"><span className="text-neutral-400">Window Manager</span> <span className="text-white">Fluid Floating Windows (Top-Right Controls)</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-1.5"><span className="text-neutral-400">Desktop Layout</span> <span className="text-white">Fixed Grid Snapping + Freeform Coordinates</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-1.5"><span className="text-neutral-400">File System</span> <span className="text-white">POSIX IndexedDB + Physical PC Mount</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-1.5"><span className="text-neutral-400">Terminal Shell</span> <span className="text-white">Warp Execution Cards</span></div>
              <div className="flex justify-between border-b border-white/[0.06] pb-1.5"><span className="text-neutral-400">Browser</span> <span className="text-white">Direct Embed, Universal YouTube, Jina Reader</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Status Island</span> <span className="text-white">Detached Dynamic Capsule Island</span></div>
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
  description: 'Customize Onyx OS preferences, appearance, window physics, and accessibility.',
  category: 'system',
  icon: SettingsIcon,
  defaultSize: { width: 680, height: 500 },
  constraints: { minWidth: 520, minHeight: 380, maxWidth: 960, maxHeight: 760 },
  allowMultipleInstances: false,
  permissions: ['notifications'],
  component: SettingsApp,
};

