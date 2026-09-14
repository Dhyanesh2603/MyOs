import { create } from 'zustand';
import type { WallpaperDefinition } from '@contracts/theme';

export const WALLPAPERS: WallpaperDefinition[] = [
  {
    id: 'obsidian-flow',
    name: 'Obsidian Flow',
    type: 'abstract',
    style: {
      background: 'radial-gradient(circle at 50% 25%, rgba(99, 102, 241, 0.14) 0%, rgba(10, 10, 14, 1) 80%)',
    },
  },
  {
    id: 'kinetic-aurora',
    name: 'Kinetic Aurora',
    type: 'gradient',
    style: {
      background: 'radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(99, 102, 241, 0.14) 0%, rgba(10, 10, 14, 1) 85%)',
    },
  },
  {
    id: 'dusk-ember',
    name: 'Dusk Ember',
    type: 'gradient',
    style: {
      background: 'radial-gradient(circle at 50% 30%, rgba(244, 63, 94, 0.12) 0%, rgba(245, 158, 11, 0.06) 40%, rgba(10, 10, 14, 1) 85%)',
    },
  },
  {
    id: 'monochrome-grid',
    name: 'Monochrome Grid',
    type: 'minimal',
    style: {
      background: '#090a0f',
    },
  },
];

export interface WallpaperState {
  currentWallpaperId: string;
  wallpapers: WallpaperDefinition[];
  setWallpaper: (id: string) => void;
  getCurrentWallpaper: () => WallpaperDefinition;
}

export const useWallpaperStore = create<WallpaperState>((set, get) => ({
  currentWallpaperId: 'obsidian-flow',
  wallpapers: WALLPAPERS,

  setWallpaper: (id) => {
    if (WALLPAPERS.some((w) => w.id === id)) {
      set({ currentWallpaperId: id });
    }
  },

  getCurrentWallpaper: () => {
    const { currentWallpaperId } = get();
    return (
      WALLPAPERS.find((w) => w.id === currentWallpaperId) ?? WALLPAPERS[0]!
    );
  },
}));
