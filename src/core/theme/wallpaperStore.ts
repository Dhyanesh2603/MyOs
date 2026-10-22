import { create } from 'zustand';
import type { WallpaperDefinition } from '@contracts/theme';

export const WALLPAPERS: WallpaperDefinition[] = [
  {
    id: 'sequoia-dark',
    name: 'macOS Sequoia Midnight',
    type: 'gradient',
    style: {
      backgroundColor: '#0a0d14',
      backgroundImage: `
        radial-gradient(at 15% 15%, rgba(67, 56, 202, 0.28) 0px, transparent 55%),
        radial-gradient(at 85% 20%, rgba(99, 102, 241, 0.22) 0px, transparent 50%),
        radial-gradient(at 50% 80%, rgba(30, 27, 75, 0.5) 0px, transparent 65%),
        radial-gradient(at 80% 85%, rgba(59, 130, 246, 0.18) 0px, transparent 50%)
      `,
    },
  },
  {
    id: 'sonoma-horizon',
    name: 'Sonoma Ember Horizon',
    type: 'gradient',
    style: {
      backgroundColor: '#090a0f',
      backgroundImage: `
        radial-gradient(at 50% 0%, rgba(120, 53, 15, 0.22) 0px, transparent 60%),
        radial-gradient(at 10% 90%, rgba(88, 28, 135, 0.3) 0px, transparent 60%),
        radial-gradient(at 90% 85%, rgba(15, 23, 42, 0.6) 0px, transparent 55%)
      `,
    },
  },
  {
    id: 'obsidian-carbon',
    name: 'Obsidian Minimal',
    type: 'abstract',
    style: {
      backgroundColor: '#0c0e12',
      backgroundImage: `radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 65%)`,
    },
  },
  {
    id: 'pro-studio',
    name: 'Apple Pro Titanium',
    type: 'gradient',
    style: {
      background:
        'linear-gradient(180deg, #181a20 0%, #0d0e12 100%)',
    },
  },
  {
    id: 'warp-slate',
    name: 'Warp Technical Slate',
    type: 'minimal',
    style: {
      background:
        'linear-gradient(135deg, #1e222b 0%, #0b0d11 100%)',
    },
  },
  {
    id: 'live-starfield',
    name: 'Cosmic Starfield (Live)',
    type: 'live',
    dynamicType: 'starfield',
    style: {
      backgroundColor: '#05070a',
    },
  },
  {
    id: 'live-matrix',
    name: 'Matrix Cyber Rain (Live)',
    type: 'live',
    dynamicType: 'matrix',
    style: {
      backgroundColor: '#05070a',
    },
  },
  {
    id: 'live-waves',
    name: 'Harmonic Waves (Live)',
    type: 'live',
    dynamicType: 'waves',
    style: {
      backgroundColor: '#06080d',
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
  currentWallpaperId: 'sequoia-dark',
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
