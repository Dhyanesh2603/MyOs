import React, { useRef } from 'react';
import type { ResizeDirection, WindowState } from '@contracts/window';
import { calculateResize, type Rect } from '@core/window/geometry';
import { useWindowStore } from '@core/window/windowStore';

export interface ResizeHandleProps {
  direction: ResizeDirection;
  windowState: WindowState;
}

const HANDLE_CLASSES: Record<ResizeDirection, string> = {
  n: 'top-0 left-2 right-2 h-2 -translate-y-1/2 cursor-ns-resize',
  s: 'bottom-0 left-2 right-2 h-2 translate-y-1/2 cursor-ns-resize',
  w: 'left-0 top-2 bottom-2 w-2 -translate-x-1/2 cursor-ew-resize',
  e: 'right-0 top-2 bottom-2 w-2 translate-x-1/2 cursor-ew-resize',
  nw: 'top-0 left-0 w-3 h-3 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize z-20',
  ne: 'top-0 right-0 w-3 h-3 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize z-20',
  sw: 'bottom-0 left-0 w-3 h-3 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize z-20',
  se: 'bottom-0 right-0 w-3 h-3 translate-x-1/2 translate-y-1/2 cursor-nwse-resize z-20',
};

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  windowState,
}) => {
  const { updateBounds, setResizing, focusWindow } = useWindowStore();

  const isResizingRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startRectRef = useRef<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const rafRef = useRef<number | null>(null);
  const pendingRectRef = useRef<Rect | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || windowState.isMaximized) return;

    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    focusWindow(windowState.id);
    setResizing(windowState.id, true);

    isResizingRef.current = true;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    startRectRef.current = {
      x: windowState.position.x,
      y: windowState.position.y,
      width: windowState.size.width,
      height: windowState.size.height,
    };
    pendingRectRef.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return;

    const dx = e.clientX - startPointerRef.current.x;
    const dy = e.clientY - startPointerRef.current.y;

    const newRect = calculateResize(
      startRectRef.current,
      { dx, dy },
      direction,
      windowState.constraints
    );

    pendingRectRef.current = newRect;

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingRectRef.current) {
          updateBounds(
            windowState.id,
            { x: pendingRectRef.current.x, y: pendingRectRef.current.y },
            { width: pendingRectRef.current.width, height: pendingRectRef.current.height }
          );
        }
        rafRef.current = null;
      });
    }
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (pendingRectRef.current) {
      updateBounds(
        windowState.id,
        { x: pendingRectRef.current.x, y: pendingRectRef.current.y },
        { width: pendingRectRef.current.width, height: pendingRectRef.current.height }
      );
      pendingRectRef.current = null;
    }

    isResizingRef.current = false;
    setResizing(windowState.id, false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Handled if pointer was already released by the browser
    }
  };

  if (windowState.isMaximized) return null;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      aria-hidden="true"
      className={`absolute select-none touch-none ${HANDLE_CLASSES[direction]}`}
    />
  );
};
