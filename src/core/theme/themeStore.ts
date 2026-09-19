import { create } from 'zustand';
import type {
  AccentColorDefinition,
  AccentColorId,
  ThemeId,
  ThemePreferences,
  FontFamilyId,
} from '@contracts/theme';

export const ACCENT_COLORS: Record<AccentColorId, AccentColorDefinition> = {
  indigo: {
    id: 'indigo',
    label: 'Indigo Kinetic',
    primary: '99 102 241',
    hover: '129 140 248',
    muted: '49 46 129',
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald Matrix',
    primary: '16 185 129',
    hover: '52 211 153',
    muted: '6 95 70',
  },
  amber: {
    id: 'amber',
    label: 'Amber Flux',
    primary: '245 158 11',
    hover: '251 191 36',
    muted: '120 53 15',
  },
  rose: {
    id: 'rose',
    label: 'Rose Neon',
    primary: '244 63 94',
    hover: '251 113 133',
    muted: '136 19 55',
  },
  cyan: {
    id: 'cyan',
    label: 'Cyan Quantum',
    primary: '6 182 212',
    hover: '34 211 238',
    muted: '22 78 99',
  },
  monochrome: {
    id: 'monochrome',
    label: 'Monochrome Jet',
    primary: '240 240 245',
    hover: '255 255 255',
    muted: '60 60 65',
  },
};

export interface ThemeStoreState extends ThemePreferences {
  fontFamily: FontFamilyId;
  uiScale: number;
  setTheme: (themeId: ThemeId) => void;
  setAccentColor: (accentColor: AccentColorId) => void;
  setWindowRadius: (radius: number) => void;
  setBlurAmount: (blur: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  setFontFamily: (font: FontFamilyId) => void;
  setUiScale: (scale: number) => void;
}

export const useThemeStore = create<ThemeStoreState>((set) => ({
  themeId: 'dark',
  accentColor: 'indigo',
  blurEnabled: true,
  reducedMotion: false,
  windowRadius: 16,
  wallpaperId: 'obsidian-flow',
  fontFamily: 'inter',
  uiScale: 1.0,

  setTheme: (themeId) => {
    set({ themeId });
    const root = document.documentElement;
    if (themeId === 'dark') {
      root.removeAttribute('data-theme');
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', themeId);
      root.classList.remove('dark');
      root.classList.add(themeId);
    }
  },

  setAccentColor: (accentColor) => {
    const def = ACCENT_COLORS[accentColor];
    if (!def) return;

    set({ accentColor });
    const root = document.documentElement;
    root.style.setProperty('--accent-primary', def.primary);
    root.style.setProperty('--accent-hover', def.hover);
    root.style.setProperty('--accent-muted', def.muted);
  },

  setWindowRadius: (windowRadius) => {
    set({ windowRadius });
    document.documentElement.style.setProperty(
      '--radius-window',
      `${windowRadius}px`
    );
  },

  setBlurAmount: (blurAmount) => {
    set({ blurAmount, blurEnabled: blurAmount > 0 } as Partial<ThemeStoreState>);
    document.documentElement.style.setProperty(
      '--blur-window',
      `${blurAmount}px`
    );
    document.documentElement.style.setProperty(
      '--blur-dock',
      `${Math.round(blurAmount * 1.15)}px`
    );
  },

  setReducedMotion: (reducedMotion) => {
    set({ reducedMotion });
  },

  setFontFamily: (fontFamily) => {
    set({ fontFamily });
    document.documentElement.setAttribute('data-font', fontFamily);
  },

  setUiScale: (uiScale) => {
    set({ uiScale });
    document.documentElement.style.setProperty('--ui-scale', `${uiScale}`);
    document.documentElement.style.fontSize = `${uiScale * 16}px`;
  },
}));
