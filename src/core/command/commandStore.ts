import { create } from 'zustand';

export interface CommandState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
}

export const useCommandStore = create<CommandState>((set) => ({
  isOpen: false,
  query: '',
  selectedIndex: 0,

  open: () => set({ isOpen: true, query: '', selectedIndex: 0 }),
  close: () => set({ isOpen: false, query: '', selectedIndex: 0 }),
  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      query: '',
      selectedIndex: 0,
    })),
  setQuery: (query) => set({ query, selectedIndex: 0 }),
  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
}));
