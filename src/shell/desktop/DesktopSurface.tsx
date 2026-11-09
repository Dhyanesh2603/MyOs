import React, { useState, useRef, useEffect } from 'react';
import { useWallpaperStore } from '@core/theme/wallpaperStore';
import { useWindowStore } from '@core/window/windowStore';
import { useProcessStore } from '@core/process/processStore';
import { useContextMenuStore } from '@core/menu/contextMenuStore';
import { SelectionMarquee } from './SelectionMarquee';
import { DesktopIcons } from './DesktopIcons';
import { DesktopWidgets } from '../widgets/DesktopWidgets';
import { SnapPreviewOverlay } from './SnapPreviewOverlay';
import { DynamicWallpaperHost } from './wallpapers/DynamicWallpaperHost';
import { importHostFileToVFS } from '@core/vfs/hostBridge';
import { useWidgetStore } from '@core/widgets/widgetStore';
import { useCustomAppStore } from '@core/packages/customAppStore';
import { useControlCenterStore } from '@core/system/controlCenterStore';
import { useDesktopStore, DEFAULT_APPS } from '@core/desktop/desktopStore';
import { useAppMenuStore } from '@shell/menu/appMenuStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import {
  FileText,
  Settings,
  Image,
  Minus,
  X,
  UploadCloud,
  LayoutGrid,
  Eye,
  Globe,
  SlidersHorizontal,
  Grid,
  Move,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';

export interface DesktopSurfaceProps {
  children?: React.ReactNode;
}

export const DesktopSurface: React.FC<DesktopSurfaceProps> = ({ children }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDesktopIcons, setShowDesktopIcons] = useState<boolean>(() => {
    try {
      return localStorage.getItem('flowos_show_desktop_icons') !== 'false';
    } catch {
      return true;
    }
  });

  const { currentWallpaperId, wallpapers, setWallpaper } = useWallpaperStore();
  const wallpaper = wallpapers.find((w) => w.id === currentWallpaperId) ?? wallpapers[0]!;
  const { launchApp } = useProcessStore();
  const openMenu = useContextMenuStore((state) => state.openMenu);
  const layoutMode = useDesktopStore((state) => state.layoutMode);
  const setLayoutMode = useDesktopStore((state) => state.setLayoutMode);
  const autoArrangeGrid = useDesktopStore((state) => state.autoArrangeGrid);
  const customShortcuts = useDesktopStore((state) => state.customShortcuts);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        useWidgetStore.getState().toggleWidgetsVisibility();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-desktop-icon]') ||
      target.closest('[role="dialog"]') ||
      target.closest('[role="navigation"]') ||
      target.closest('[data-context-menu]')
    ) {
      return;
    }
    e.preventDefault();

    const currentIdx = wallpapers.findIndex((w) => w.id === wallpaper.id);
    const nextWallpaper = wallpapers[(currentIdx + 1) % wallpapers.length];

    openMenu(
      { x: e.clientX, y: e.clientY },
      [
        {
          type: 'item',
          item: {
            id: 'new-note',
            label: 'New Scratchpad Note',
            icon: FileText,
            shortcut: 'Alt+N',
            action: () => launchApp('notes'),
          },
        },
        {
          type: 'item',
          item: {
            id: 'add-apps-launchpad',
            label: 'Add App to Homescreen...',
            icon: PlusCircle,
            action: () => useAppMenuStore.getState().openAppMenu(),
          },
        },
        { type: 'separator', id: 'sep-layout' },
        {
          type: 'item',
          item: {
            id: 'layout-mode-toggle',
            label: layoutMode === 'grid' ? 'Layout: Snap to Grid (Active)' : 'Layout: Freeform Drag (Active)',
            icon: layoutMode === 'grid' ? Grid : Move,
            action: () => {
              const nextMode = layoutMode === 'grid' ? 'freeform' : 'grid';
              setLayoutMode(nextMode);
              useNotificationStore.getState().notify({
                title: nextMode === 'grid' ? 'Grid Layout Enabled' : 'Freeform Layout Enabled',
                message: nextMode === 'grid' ? 'Icons snap to fixed grid coordinates.' : 'Icons can be dragged anywhere freely.',
                type: 'info',
              });
            },
          },
        },
        {
          type: 'item',
          item: {
            id: 'auto-arrange-grid',
            label: 'Auto-Arrange Desktop Icons',
            icon: RotateCcw,
            action: () => {
              const allIds = [
                ...DEFAULT_APPS.map((a) => a.id),
                ...customShortcuts.map((s) => s.id),
              ];
              autoArrangeGrid(allIds);
              useNotificationStore.getState().notify({
                title: 'Desktop Arranged',
                message: 'All desktop icons aligned neatly to grid.',
                type: 'success',
              });
            },
          },
        },
        { type: 'separator', id: 'sep-sys' },
        {
          type: 'item',
          item: {
            id: 'settings',
            label: 'System Settings',
            icon: Settings,
            action: () => launchApp('system-settings'),
          },
        },
        {
          type: 'item',
          item: {
            id: 'control-center',
            label: 'Control Center (Quick Hub)',
            icon: SlidersHorizontal,
            shortcut: 'Alt+C',
            action: () => useControlCenterStore.getState().toggleControlCenter(),
          },
        },
        { type: 'separator', id: 'sep-1' },
        {
          type: 'item',
          item: {
            id: 'toggle-icons',
            label: showDesktopIcons ? 'Hide Desktop Icons' : 'Show Desktop Icons',
            icon: LayoutGrid,
            action: () => {
              setShowDesktopIcons((prev) => {
                const next = !prev;
                try {
                  localStorage.setItem('flowos_show_desktop_icons', String(next));
                } catch {
                  // ignored
                }
                return next;
              });
            },
          },
        },
        {
          type: 'item',
          item: {
            id: 'change-wallpaper',
            label: `Next Wallpaper (${nextWallpaper?.name ?? 'Cycle'})`,
            icon: Image,
            action: () => {
              if (nextWallpaper) setWallpaper(nextWallpaper.id);
            },
          },
        },
        { type: 'separator', id: 'sep-widgets' },
        {
          type: 'item',
          item: {
            id: 'add-widgets',
            label: 'Add Widgets...',
            icon: LayoutGrid,
            action: () => useWidgetStore.getState().openDrawer(),
          },
        },
        {
          type: 'item',
          item: {
            id: 'toggle-widgets',
            label: useWidgetStore.getState().isWidgetsVisible ? 'Hide Widgets' : 'Show Widgets',
            icon: Eye,
            shortcut: 'Alt+W',
            action: () => useWidgetStore.getState().toggleWidgetsVisibility(),
          },
        },
        {
          type: 'item',
          item: {
            id: 'package-web-app',
            label: 'Package Web App (PWA)...',
            icon: Globe,
            action: () => useCustomAppStore.getState().openCreateModal(),
          },
        },
        { type: 'separator', id: 'sep-2' },
        {
          type: 'item',
          item: {
            id: 'minimize-all',
            label: 'Minimize All Windows',
            icon: Minus,
            action: () => {
              const store = useWindowStore.getState();
              Object.keys(store.windows).forEach((id) => store.minimizeWindow(id));
            },
          },
        },
        {
          type: 'item',
          item: {
            id: 'close-all',
            label: 'Close All Windows',
            icon: X,
            danger: true,
            action: () => {
              const store = useWindowStore.getState();
              Object.keys(store.windows).forEach((id) => store.closeWindow(id));
            },
          },
        },
      ]
    );
  };

  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const isSelectingRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-desktop-icon]') ||
      target.closest('[role="dialog"]') ||
      target.closest('[role="navigation"]') ||
      target.closest('[data-context-menu]')
    ) {
      return;
    }
    if (e.button !== 0) return;

    // Deselect any desktop icon
    useDesktopStore.getState().setSelectedIconId(null);

    // Defocus any currently active window if user clicked the empty desktop
    const winStore = useWindowStore.getState();
    if (winStore.activeWindowId) {
      winStore.focusWindow('');
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if capture unsupported
    }

    isSelectingRef.current = true;
    const start = { x: e.clientX, y: e.clientY };
    setSelectionStart(start);
    setSelectionCurrent(start);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSelectingRef.current) return;
    setSelectionCurrent({ x: e.clientX, y: e.clientY });
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSelectingRef.current) return;
    isSelectingRef.current = false;
    setSelectionStart(null);
    setSelectionCurrent(null);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onContextMenu={handleContextMenu}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes('application/flowos-app-id')) {
          e.dataTransfer.dropEffect = 'copy';
        } else {
          setIsDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) {
          setIsDragOver(false);
        }
      }}
      onDrop={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        // Check if an app was dropped from Launchpad
        const appId = e.dataTransfer.getData('application/flowos-app-id');
        if (appId) {
          const added = useDesktopStore.getState().addAppShortcut(appId, {
            x: e.clientX - 44,
            y: e.clientY - 44,
          });
          useNotificationStore.getState().notify({
            title: added ? 'App Added to Homescreen' : 'Already on Homescreen',
            message: added ? 'Shortcut placed on desktop.' : 'App shortcut is already present.',
            type: added ? 'success' : 'info',
          });
          useAppMenuStore.getState().closeAppMenu();
          return;
        }

        if (e.dataTransfer.files?.length) {
          for (const file of Array.from(e.dataTransfer.files)) {
            await importHostFileToVFS(file, '/home/user/Desktop');
          }
        }
      }}
      style={wallpaper.style}
      className="relative h-screen w-screen overflow-hidden bg-surface-canvas text-content-primary select-none transition-[background] duration-500"
    >
      {/* Live Dynamic Generative Canvas Wallpaper Layer */}
      <DynamicWallpaperHost wallpaper={wallpaper} />

      {/* Marquee Drag-Selection Box */}
      <SelectionMarquee
        startPos={selectionStart}
        currentPos={selectionCurrent}
      />

      {/* Curated Modern Desktop Icons Grid */}
      {showDesktopIcons && <DesktopIcons />}

      {/* Persistent Desktop HUD Widgets (if user opts in) */}
      <DesktopWidgets />

      {/* Aero Snap Preview Overlay */}
      <SnapPreviewOverlay />

      {/* Host Machine Drag-and-Drop Indicator */}
      {isDragOver && (
        <div className="pointer-events-none fixed inset-8 z-[8900] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent-primary bg-accent-primary/15 backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-95 select-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-panel border border-accent-primary/40 text-accent-primary shadow-lg mb-3">
            <UploadCloud className="h-8 w-8 animate-bounce" />
          </div>
          <h3 className="font-sans text-base font-semibold text-content-primary">
            Drop Physical Files to Import
          </h3>
          <p className="mt-1 font-mono text-xs text-content-tertiary">
            Will be written directly to /home/user/Desktop in FlowOS VFS
          </p>
        </div>
      )}

      {/* Surface Children (Windows, Dock, HUD, Overlays) */}
      {children}
    </div>
  );
};
