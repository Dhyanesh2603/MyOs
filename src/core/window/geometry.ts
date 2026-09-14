import type {
  ResizeDirection,
  WindowConstraints,
  WindowPosition,
  WindowSize,
  WindowState,
} from '@contracts/window';

export const BASE_Z_INDEX = 100;
export const CASCADE_OFFSET = 28;
export const TITLEBAR_VISIBLE_HEIGHT = 40;
export const HORIZONTAL_VISIBLE_MARGIN = 80;

export interface ViewportInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const DEFAULT_INSETS: ViewportInsets = {
  top: 0,
  bottom: 84, // Reserve space for dock clearance
  left: 0,
  right: 0,
};

/**
 * Clamps a window's position to ensure its header/chrome remains accessible
 * within the visible viewport and does not disappear off-screen.
 */
export function clampPosition(
  pos: WindowPosition,
  size: WindowSize,
  viewport: WindowSize,
  insets: ViewportInsets = DEFAULT_INSETS
): WindowPosition {
  const minX = insets.left - size.width + HORIZONTAL_VISIBLE_MARGIN;
  const maxX = viewport.width - insets.right - HORIZONTAL_VISIBLE_MARGIN;

  const minY = insets.top;
  const maxY = Math.max(
    insets.top,
    viewport.height - insets.bottom - TITLEBAR_VISIBLE_HEIGHT
  );

  return {
    x: Math.min(Math.max(pos.x, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(pos.y, minY), maxY),
  };
}

/**
 * Computes a smart initial position for a new window.
 * If windows already exist, cascades from the last active window.
 * If no windows exist or cascade would clip outside bounds, centers on the canvas.
 */
export function computeInitialPosition(
  size: WindowSize,
  viewport: WindowSize,
  activeWindow?: WindowState,
  insets: ViewportInsets = DEFAULT_INSETS
): WindowPosition {
  const usableWidth = viewport.width - insets.left - insets.right;
  const usableHeight = viewport.height - insets.top - insets.bottom;

  const centerPos: WindowPosition = {
    x: Math.max(insets.left + 20, insets.left + Math.round((usableWidth - size.width) / 2)),
    y: Math.max(insets.top + 20, insets.top + Math.round((usableHeight - size.height) / 2)),
  };

  if (!activeWindow) {
    return centerPos;
  }

  const cascadedPos: WindowPosition = {
    x: activeWindow.position.x + CASCADE_OFFSET,
    y: activeWindow.position.y + CASCADE_OFFSET,
  };

  // If cascading pushes beyond the comfortable boundary, wrap back to center or origin
  if (
    cascadedPos.x + size.width > viewport.width - insets.right ||
    cascadedPos.y + size.height > viewport.height - insets.bottom
  ) {
    return {
      x: insets.left + 40,
      y: insets.top + 40,
    };
  }

  return cascadedPos;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculates updated window rect (position + size) during an active resize gesture.
 * Correctly handles all 8 resize directions and strictly respects min/max constraints.
 */
export function calculateResize(
  initialRect: Rect,
  delta: { dx: number; dy: number },
  direction: ResizeDirection,
  constraints: WindowConstraints
): Rect {
  let { x, y, width, height } = initialRect;
  const { minWidth, minHeight, maxWidth = Infinity, maxHeight = Infinity } = constraints;

  // Horizontal Resize
  if (direction.includes('e')) {
    const rawWidth = initialRect.width + delta.dx;
    width = Math.min(Math.max(rawWidth, minWidth), maxWidth);
  } else if (direction.includes('w')) {
    const rawWidth = initialRect.width - delta.dx;
    width = Math.min(Math.max(rawWidth, minWidth), maxWidth);
    x = initialRect.x + (initialRect.width - width);
  }

  // Vertical Resize
  if (direction.includes('s')) {
    const rawHeight = initialRect.height + delta.dy;
    height = Math.min(Math.max(rawHeight, minHeight), maxHeight);
  } else if (direction.includes('n')) {
    const rawHeight = initialRect.height - delta.dy;
    height = Math.min(Math.max(rawHeight, minHeight), maxHeight);
    y = initialRect.y + (initialRect.height - height);
  }

  return { x, y, width, height };
}
