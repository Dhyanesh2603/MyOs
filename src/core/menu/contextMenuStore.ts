import { create } from 'zustand';
import type { ContextMenuEntry, ContextMenuPosition } from '@contracts/menu';

export interface ContextMenuState {
  isOpen: boolean;
  position: ContextMenuPosition;
  entries: ContextMenuEntry[];

  openMenu: (position: ContextMenuPosition, entries: ContextMenuEntry[]) => void;
  closeMenu: () => void;
}

export const useContextMenuStore = create<ContextMenuState>((set) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  entries: [],

  openMenu: (position, entries) => {
    set({
      isOpen: true,
      position,
      entries,
    });
  },

  closeMenu: () => {
    set({
      isOpen: false,
      entries: [],
    });
  },
}));
