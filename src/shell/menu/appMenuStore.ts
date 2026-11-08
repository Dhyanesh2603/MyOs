import { create } from 'zustand';

export type AppMenuCategory =
  | 'all'
  | 'productivity'
  | 'development'
  | 'utilities'
  | 'media'
  | 'games'
  | 'system';

interface AppMenuState {
  isOpen: boolean;
  searchQuery: string;
  selectedCategory: AppMenuCategory;
  openAppMenu: () => void;
  closeAppMenu: () => void;
  toggleAppMenu: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: AppMenuCategory) => void;
}

export const useAppMenuStore = create<AppMenuState>((set) => ({
  isOpen: false,
  searchQuery: '',
  selectedCategory: 'all',
  openAppMenu: () => set({ isOpen: true, searchQuery: '' }),
  closeAppMenu: () => set({ isOpen: false, searchQuery: '' }),
  toggleAppMenu: () =>
    set((state) => ({ isOpen: !state.isOpen, searchQuery: '' })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}));
