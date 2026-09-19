/**
 * FlowOS Window Management Contracts
 */

export type WindowId = string;
export type ProcessId = string;

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
}

export type ResizeDirection =
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw';

export interface WindowPreMaximizedSnapshot {
  position: WindowPosition;
  size: WindowSize;
}

export interface WindowState {
  id: WindowId;
  processId: ProcessId;
  appId: string;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  constraints: WindowConstraints;
  zIndex: number;
  isFocused: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isDragging: boolean;
  isResizing: boolean;
  preMaximizedState?: WindowPreMaximizedSnapshot;
  workspaceId?: number;
  customState?: Record<string, unknown>;
}

export interface WindowCreateOptions {
  appId: string;
  title?: string;
  initialPosition?: WindowPosition;
  initialSize?: WindowSize;
  constraints?: Partial<WindowConstraints>;
  workspaceId?: number;
  customState?: Record<string, unknown>;
}
