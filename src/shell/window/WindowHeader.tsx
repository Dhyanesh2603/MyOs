import React, { useRef, useEffect } from 'react';
import type { WindowPosition, WindowState } from '@contracts/window';
import { clampPosition, DEFAULT_INSETS } from '@core/window/geometry';
import { useWindowStore, type SnapTarget } from '@core/window/windowStore';
import { useFancyZonesStore } from '@core/window/fancyZonesStore';
import { soundEngine } from '@core/audio/soundEngine';
import { Minus, Square, Copy, X } from 'lucide-react';
import { IosAppIcon } from '@shell/icons/IosAppIcon';

export interface WindowHeaderProps {
  windowState: WindowState;
}

export const WindowHeader: React.FC<WindowHeaderProps> = React.memo(({ windowState }) => {
  const isDraggingRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<WindowPosition>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const pendingPosRef = useRef<WindowPosition | null>(null);
  const activeSnapRef = useRef<SnapTarget>(null);

  // Global keyboard shortcuts for focused window (Aero Snap shortcuts)
  useEffect(() => {
    if (!windowState.isFocused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.altKey && (e.key === '[' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        soundEngine.playSnap();
        useWindowStore.getState().snapWindow(windowState.id, 'left', { width: window.innerWidth, height: window.innerHeight });
      } else if (e.altKey && (e.key === ']' || e.key === 'ArrowRight')) {
        e.preventDefault();
        soundEngine.playSnap();
        useWindowStore.getState().snapWindow(windowState.id, 'right', { width: window.innerWidth, height: window.innerHeight });
      } else if (e.altKey && (e.key === 'Enter' || e.key === 'ArrowUp')) {
        e.preventDefault();
        soundEngine.playSnap();
        useWindowStore.getState().toggleMaximize(windowState.id, { width: window.innerWidth, height: window.innerHeight });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windowState.id, windowState.isFocused]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button and when not maximized
    if (e.button !== 0 || windowState.isMaximized) return;

    // Do not initiate drag if user clicked an interactive control button
    if ((e.target as HTMLElement).closest('button')) return;

    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    const store = useWindowStore.getState();
    store.focusWindow(windowState.id);
    store.setDragging(windowState.id, true);

    isDraggingRef.current = true;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = { ...windowState.position };
    pendingPosRef.current = null;
    activeSnapRef.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - startPointerRef.current.x;
    const dy = e.clientY - startPointerRef.current.y;

    const unconstrainedPos: WindowPosition = {
      x: startPosRef.current.x + dx,
      y: startPosRef.current.y + dy,
    };

    const viewportSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const clamped = clampPosition(
      unconstrainedPos,
      windowState.size,
      viewportSize,
      DEFAULT_INSETS
    );

    pendingPosRef.current = clamped;

    // FancyZones Shift-drag trigger
    if (e.shiftKey) {
      useFancyZonesStore.getState().showOverlay(windowState.id);
    }

    // Detect Aero Snap edge proximity
    let detectedSnap: SnapTarget = null;
    if (e.clientX <= 24) {
      detectedSnap = 'left';
    } else if (e.clientX >= window.innerWidth - 24) {
      detectedSnap = 'right';
    } else if (e.clientY <= 20) {
      detectedSnap = 'maximize';
    }

    if (activeSnapRef.current !== detectedSnap) {
      activeSnapRef.current = detectedSnap;
      useWindowStore.getState().setSnapPreview(detectedSnap);
      if (detectedSnap) {
        soundEngine.playSnap();
      }
    }

    // Schedule RAF update for silky smooth drag
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingPosRef.current) {
          useWindowStore.getState().updatePosition(windowState.id, pendingPosRef.current);
        }
        rafRef.current = null;
      });
    }
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const activeZone = useFancyZonesStore.getState().activeZoneId;
    if (activeZone) {
      useFancyZonesStore.getState().snapWindowToZone(windowState.id, activeZone);
      activeSnapRef.current = null;
      useWindowStore.getState().setSnapPreview(null);
    } else {
      useFancyZonesStore.getState().hideOverlay();
      const snapTarget = activeSnapRef.current;
      if (snapTarget) {
        soundEngine.playSnap();
        useWindowStore.getState().snapWindow(windowState.id, snapTarget, {
          width: window.innerWidth,
          height: window.innerHeight,
        });
        activeSnapRef.current = null;
        useWindowStore.getState().setSnapPreview(null);
      } else if (pendingPosRef.current) {
        useWindowStore.getState().updatePosition(windowState.id, pendingPosRef.current);
        pendingPosRef.current = null;
      }
    }

    isDraggingRef.current = false;
    useWindowStore.getState().setDragging(windowState.id, false);
    useWindowStore.getState().setSnapPreview(null);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleDoubleClick = () => {
    soundEngine.playClick();
    useWindowStore.getState().toggleMaximize(windowState.id, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  return (
    <header
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onDoubleClick={handleDoubleClick}
      className={`no-select relative flex h-9.5 select-none items-center justify-between border-b px-3.5 transition-colors ${
        windowState.isFocused
          ? 'border-border-strong bg-surface-overlay/80 backdrop-blur-2xl'
          : 'border-border-subtle bg-surface-overlay/40 backdrop-blur-xl'
      } ${windowState.isMaximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {/* Top Left: App Icon & Title */}
      <div className="flex items-center gap-2 overflow-hidden max-w-[70%]">
        <div className="h-4 w-4 shrink-0">
          <IosAppIcon appId={windowState.appId} className="h-full w-full" />
        </div>
        <span
          className={`truncate text-xs font-semibold tracking-tight transition-colors ${
            windowState.isFocused
              ? 'text-content-primary'
              : 'text-content-secondary'
          }`}
        >
          {windowState.title}
        </span>
      </div>

      {/* Top Right: Window Controls (Minimize, Maximize / Restore, Close) */}
      <div className="flex items-center gap-1 z-10">
        {/* Minimize Button */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.playClick();
            useWindowStore.getState().minimizeWindow(windowState.id);
          }}
          aria-label="Minimize Window"
          className="flex h-6 w-7 items-center justify-center rounded-md text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors cursor-pointer"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        {/* Maximize / Restore Button */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.playClick();
            useWindowStore.getState().toggleMaximize(windowState.id, {
              width: window.innerWidth,
              height: window.innerHeight,
            });
          }}
          aria-label={windowState.isMaximized ? 'Restore Window' : 'Maximize Window'}
          className="flex h-6 w-7 items-center justify-center rounded-md text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors cursor-pointer"
        >
          {windowState.isMaximized ? (
            <Copy className="h-3 w-3" />
          ) : (
            <Square className="h-3 w-3" />
          )}
        </button>

        {/* Close Button at top-right corner with smooth red hover */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.playClick();
            useWindowStore.getState().closeWindow(windowState.id);
          }}
          aria-label="Close Window"
          className="flex h-6 w-7 items-center justify-center rounded-md text-content-secondary hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
});

WindowHeader.displayName = 'WindowHeader';
