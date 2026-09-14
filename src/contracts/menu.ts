import type { ComponentType } from 'react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  action: () => void;
}

export type ContextMenuEntry =
  | { type: 'item'; item: ContextMenuItem }
  | { type: 'separator'; id: string };

export interface ContextMenuPosition {
  x: number;
  y: number;
}
