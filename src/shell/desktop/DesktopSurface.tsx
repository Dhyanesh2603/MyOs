import React, { useState, useRef, useEffect } from 'react';
import { useWallpaperStore } from '@core/theme/wallpaperStore';
import { useWindowStore } from '@core/window/windowStore';
import { useProcessStore } from '@core/process/processStore';
import { useContextMenuStore } from '@core/menu/contextMenuStore';
import { SelectionMarquee } from './SelectionMarquee';
import { DesktopIcons } from './DesktopIcons';
import { DesktopWidgets } from '../widgets/DesktopWidgets';
import { SnapPreviewOverlay } from './SnapPreviewOverlay';
import { importHostFileToVFS } from '@core/vfs/hostBridge';
import { useWidgetStore } from '@core/widgets/widgetStore';
import { FileText, Settings, Image, Minus, X, UploadCloud, LayoutGrid, Eye } from 'lucide-react';

export interface DesktopSurfaceProps {
  children?: React.ReactNode;
}

export const DesktopSurface: React.FC<DesktopSurfaceProps> = ({ children }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { currentWallpaperId, wallpapers, setWallpaper } = useWallpaperStore();
  const wallpaper = wallpapers.find((w) => w.id === currentWallpaperId) ?? wallpapers[0]!;
  const { windows, activeWindowId, focusWindow, minimizeWindow, closeWindow } = useWindowStore();
  const { launchApp } = useProcessStore();
  const openMenu = useContextMenuStore((state) => state.openMenu);

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
    if (e.target !== e.currentTarget) return;
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
            id: 'settings',
            label: 'System Settings',
            icon: Settings,
            action: () => launchApp('system-settings'),
          },
        },
        { type: 'separator', id: 'sep-1' },
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
        { type: 'separator', id: 'sep-2' },
        {
          type: 'item',
          item: {
            id: 'minimize-all',
            label: 'Minimize All Windows',
            icon: Minus,
            action: () => {
              Object.keys(windows).forEach((id) => minimizeWindow(id));
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
              Object.keys(windows).forEach((id) => closeWindow(id));
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
    // Only primary click directly on the desktop canvas surface itself
    if (e.button !== 0 || e.target !== e.currentTarget) return;

    // Defocus any currently active window if user clicked the empty desktop
    if (activeWindowId) {
      focusWindow('');
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
        setIsDragOver(true);
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
        if (e.dataTransfer.files?.length) {
          for (const file of Array.from(e.dataTransfer.files)) {
            await importHostFileToVFS(file, '/home/user/Desktop');
          }
        }
      }}
      style={wallpaper.style}
      className="relative h-screen w-screen overflow-hidden bg-surface-canvas text-content-primary select-none"
    >
      {/* Architectural Sub-pixel Dot Matrix Grid (Linear / Dieter Rams) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, rgb(var(--content-primary)) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Nothing OS Restrained Micro-Telemetry Stamp (Bottom Left Margin) */}
      <div className="pointer-events-none absolute bottom-5 left-6 z-10 flex items-center gap-2 font-mono text-[10px] tracking-wider text-content-tertiary select-none opacity-40">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d71921]" />
        <span>FLOW_OS v0.2.0</span>
        <span className="opacity-50">//</span>
        <span>SYS_OK</span>
      </div>

      {/* Marquee Drag-Selection Box */}
      <SelectionMarquee
        startPos={selectionStart}
        currentPos={selectionCurrent}
      />

      {/* Desktop Icons Spatial Grid */}
      <DesktopIcons />

      {/* Persistent Desktop HUD Widgets */}
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
