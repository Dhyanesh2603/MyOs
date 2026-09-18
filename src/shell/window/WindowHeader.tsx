import React, { useRef } from 'react';
import type { WindowPosition, WindowState } from '@contracts/window';
import { clampPosition, DEFAULT_INSETS } from '@core/window/geometry';
import { useWindowStore } from '@core/window/windowStore';
import { appRegistry } from '@core/process/registry';
import { Minus, Square, Copy, X } from 'lucide-react';

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
  } = useWindowStore();

  const isDraggingRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<WindowPosition>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const pendingPosRef = useRef<WindowPosition | null>(null);

  const manifest = appRegistry.get(windowState.appId);
  const IconComponent = manifest?.icon;

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
    if (pendingPosRef.current) {
      updatePosition(windowState.id, pendingPosRef.current);
      pendingPosRef.current = null;
    }

    isDraggingRef.current = false;
    setDragging(windowState.id, false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Handled if pointer already released
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
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
      className={`no-select relative flex h-9 select-none items-center justify-between border-b px-3 transition-colors ${
        windowState.isFocused
          ? 'border-border-subtle bg-surface-overlay/95'
          : 'border-border-subtle bg-surface-panel/80'
      } ${windowState.isMaximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {/* Title & App Metadata (Apple Pro Apps Restraint) */}
      <div className="flex items-center gap-2 overflow-hidden">
        {IconComponent && (
          <IconComponent
            className={`h-3.5 w-3.5 shrink-0 transition-colors ${
              windowState.isFocused
                ? 'text-accent-primary'
                : 'text-content-tertiary'
            }`}
          />
        )}
        <span
          className={`truncate text-xs font-medium tracking-tight transition-colors ${
            windowState.isFocused
              ? 'text-content-primary'
              : 'text-content-secondary'
          }`}
        >
          {windowState.title}
        </span>
        <span className="hidden font-mono text-[9px] text-content-tertiary bg-surface-subtle/60 px-1 py-0.2 rounded sm:inline-block">
          {windowState.processId.slice(-4)}
        </span>
      </div>

      {/* Bespoke Restrained Window Control Rail */}
      <div className="flex items-center gap-0.5">
        {/* Minimize Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            minimizeWindow(windowState.id);
          }}
          aria-label="Minimize Window"
          className="flex h-5 w-5 items-center justify-center rounded text-content-tertiary transition-colors hover:bg-surface-subtle hover:text-content-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary"
        >
          <Minus className="h-3 w-3" />
        </button>

        {/* Maximize / Restore Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMaximize(windowState.id, {
              width: window.innerWidth,
              height: window.innerHeight,
            });
          }}
          aria-label={windowState.isMaximized ? 'Restore Window' : 'Maximize Window'}
          className="flex h-5 w-5 items-center justify-center rounded text-content-tertiary transition-colors hover:bg-surface-subtle hover:text-content-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary"
        >
          {windowState.isMaximized ? (
            <Copy className="h-2.5 w-2.5" />
          ) : (
            <Square className="h-2.5 w-2.5" />
          )}
        </button>

        {/* Close Button with subtle crimson dissipation */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeWindow(windowState.id);
          }}
          aria-label="Close Window"
          className="flex h-5 w-5 items-center justify-center rounded text-content-tertiary transition-colors hover:bg-rose-500/15 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </header>
  );
};
