import { create } from 'zustand';
import type { WallpaperDefinition } from '@contracts/theme';

export const WALLPAPERS: WallpaperDefinition[] = [
  {
    id: 'obsidian-carbon',
    name: 'Obsidian Carbon',
    type: 'abstract',
    style: {
      backgroundColor: '#08090a',
      backgroundImage: `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.03) 0%, transparent 60%)`,
    },
  },
  {
    id: 'pro-studio',
    name: 'Apple Pro Studio',
    type: 'gradient',
    style: {
      background: 'linear-gradient(180deg, #0e1014 0%, #060709 100%)',
    },
  },
  {
    id: 'warp-slate',
    name: 'Warp Technical Slate',
    type: 'minimal',
    style: {
      background: 'linear-gradient(135deg, #0c0e12 0%, #07080a 100%)',
    },
  },
  {
    id: 'monochrome-pitch',
    name: 'Monochrome Pitch',
    type: 'minimal',
    style: {
      backgroundColor: '#050507',
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
  currentWallpaperId: 'obsidian-carbon',
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
