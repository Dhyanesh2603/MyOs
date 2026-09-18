import { create } from 'zustand';
import type { WallpaperDefinition } from '@contracts/theme';

export const WALLPAPERS: WallpaperDefinition[] = [
  {
    id: 'obsidian-carbon',
    name: 'Obsidian Carbon',
    type: 'abstract',
    style: {
      backgroundColor: 'rgb(var(--surface-canvas))',
      backgroundImage: `radial-gradient(circle at 50% 0%, rgb(var(--content-primary) / 0.04) 0%, transparent 60%)`,
    },
  },
  {
    id: 'pro-studio',
    name: 'Apple Pro Studio',
    type: 'gradient',
    style: {
      background:
        'linear-gradient(180deg, rgb(var(--surface-overlay)) 0%, rgb(var(--surface-canvas)) 100%)',
    },
  },
  {
    id: 'warp-slate',
    name: 'Warp Technical Slate',
    type: 'minimal',
    style: {
      background:
        'linear-gradient(135deg, rgb(var(--surface-subtle) / 0.5) 0%, rgb(var(--surface-canvas)) 100%)',
    },
  },
  {
    id: 'monochrome-pitch',
    name: 'Monochrome Canvas',
    type: 'minimal',
    style: {
      backgroundColor: 'rgb(var(--surface-canvas))',
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
