import React, { useRef, useEffect, useState } from 'react';
import type { WindowPosition, WindowState } from '@contracts/window';
import { clampPosition, DEFAULT_INSETS } from '@core/window/geometry';
import { useWindowStore, type SnapTarget } from '@core/window/windowStore';
import { useFancyZonesStore } from '@core/window/fancyZonesStore';
import { soundEngine } from '@core/audio/soundEngine';
import { IosAppIcon } from '@shell/icons/IosAppIcon';

export interface WindowHeaderProps {
  windowState: WindowState;
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({ windowState }) => {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    updatePosition,
    setDragging,
    snapWindow,
    setSnapPreview,
  } = useWindowStore();

  const isDraggingRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<WindowPosition>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const pendingPosRef = useRef<WindowPosition | null>(null);
  const activeSnapRef = useRef<SnapTarget>(null);

  const [showTrafficGlyphs, setShowTrafficGlyphs] = useState(false);

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
        snapWindow(windowState.id, 'left', { width: window.innerWidth, height: window.innerHeight });
      } else if (e.altKey && (e.key === ']' || e.key === 'ArrowRight')) {
        e.preventDefault();
        soundEngine.playSnap();
        snapWindow(windowState.id, 'right', { width: window.innerWidth, height: window.innerHeight });
      } else if (e.altKey && (e.key === 'Enter' || e.key === 'ArrowUp')) {
        e.preventDefault();
        soundEngine.playSnap();
        toggleMaximize(windowState.id, { width: window.innerWidth, height: window.innerHeight });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windowState.id, windowState.isFocused, snapWindow, toggleMaximize]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button and when not maximized
    if (e.button !== 0 || windowState.isMaximized) return;

    // Do not initiate drag if user clicked an interactive control button
    if ((e.target as HTMLElement).closest('button')) return;

    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    focusWindow(windowState.id);
    setDragging(windowState.id, true);

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
      setSnapPreview(detectedSnap);
      if (detectedSnap) {
        soundEngine.playSnap();
      }
    }

    // Schedule RAF update for silky smooth drag
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingPosRef.current) {
          updatePosition(windowState.id, pendingPosRef.current);
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
      setSnapPreview(null);
    } else {
      useFancyZonesStore.getState().hideOverlay();
      const snapTarget = activeSnapRef.current;
      if (snapTarget) {
        soundEngine.playSnap();
        snapWindow(windowState.id, snapTarget, {
          width: window.innerWidth,
          height: window.innerHeight,
        });
        activeSnapRef.current = null;
        setSnapPreview(null);
      } else if (pendingPosRef.current) {
        updatePosition(windowState.id, pendingPosRef.current);
        pendingPosRef.current = null;
      }
    }

    isDraggingRef.current = false;
    setDragging(windowState.id, false);
    setSnapPreview(null);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleDoubleClick = () => {
    soundEngine.playClick();
    toggleMaximize(windowState.id, {
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
      className={`no-select relative flex h-10 select-none items-center justify-between border-b px-3.5 transition-colors ${
        windowState.isFocused
          ? 'border-white/10 bg-white/[0.06] backdrop-blur-2xl'
          : 'border-white/5 bg-white/[0.02] backdrop-blur-xl'
      } ${windowState.isMaximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {/* Authentic macOS Traffic Lights (Top-Left) */}
      <div
        className="flex items-center gap-2 pl-0.5 z-10"
        onMouseEnter={() => setShowTrafficGlyphs(true)}
        onMouseLeave={() => setShowTrafficGlyphs(false)}
      >
        {/* Close: #ff5f56 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.playClick();
            closeWindow(windowState.id);
          }}
          aria-label="Close Window"
          className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-90 transition-all cursor-pointer shadow-sm"
        >
          {showTrafficGlyphs && (
            <svg className="h-1.5 w-1.5 text-[#4a0002] opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </button>

        {/* Minimize: #ffbd2e */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.playClick();
            minimizeWindow(windowState.id);
          }}
          aria-label="Minimize Window"
          className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#ffbd2e] border border-[#dea123] hover:brightness-90 transition-all cursor-pointer shadow-sm"
        >
          {showTrafficGlyphs && (
            <svg className="h-1.5 w-1.5 text-[#543b00] opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>

        {/* Maximize / Zoom: #27c93f */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.playClick();
            toggleMaximize(windowState.id, {
              width: window.innerWidth,
              height: window.innerHeight,
            });
          }}
          aria-label="Zoom Window"
          className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#27c93f] border border-[#1aab29] hover:brightness-90 transition-all cursor-pointer shadow-sm"
        >
          {showTrafficGlyphs && (
            <svg className="h-1.5 w-1.5 text-[#004207] opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          )}
        </button>
      </div>

      {/* Centered Window Title with Authentic Apple App Icon */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none max-w-[55%] truncate">
        <div className="h-3.5 w-3.5 shrink-0">
          <IosAppIcon appId={windowState.appId} className="h-full w-full" />
        </div>
        <span
          className={`truncate text-[12px] font-medium tracking-tight ${
            windowState.isFocused
              ? 'text-white/90 drop-shadow-sm'
              : 'text-white/50'
          }`}
        >
          {windowState.title}
        </span>
      </div>

      {/* Right spacer for balance */}
      <div className="w-14" />
    </header>
  );
};
