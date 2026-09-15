import { create } from 'zustand';

export interface StatusSidebarState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useStatusSidebarStore = create<StatusSidebarState>((set) => ({
  isOpen: false, // Hidden by default, accessible via sliding menu bar
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
