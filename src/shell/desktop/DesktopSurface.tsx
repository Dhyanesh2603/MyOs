import React, { useState, useRef } from 'react';
import { useWallpaperStore } from '@core/theme/wallpaperStore';
import { useWindowStore } from '@core/window/windowStore';
import { SelectionMarquee } from './SelectionMarquee';

export interface DesktopSurfaceProps {
  children?: React.ReactNode;
}

export const DesktopSurface: React.FC<DesktopSurfaceProps> = ({ children }) => {
  const wallpaper = useWallpaperStore((state) => state.getCurrentWallpaper());
  const { activeWindowId, focusWindow } = useWindowStore();

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
      style={wallpaper.style}
      className="relative h-screen w-screen overflow-hidden bg-surface-canvas text-content-primary select-none"
    >
      {/* Subtle Geometric Depth Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Marquee Drag-Selection Box */}
      <SelectionMarquee
        startPos={selectionStart}
        currentPos={selectionCurrent}
      />

      {/* Surface Children (Windows, Dock, HUD, Overlays) */}
      {children}
    </div>
  );
};
