import { create } from 'zustand';
import { useWallpaperStore } from './wallpaperStore';
import type {
  AccentColorDefinition,
  AccentColorId,
  ThemeId,
  ThemePreferences,
  FontFamilyId,
  IconShape,
  IconPackId,
  WindowMaterial,
} from '@contracts/theme';

export type { IconShape, IconPackId, WindowMaterial };

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
  iconShape: IconShape;
  iconPack: IconPackId;
  windowMaterial: WindowMaterial;
  windowOpacity: number;
  setTheme: (themeId: ThemeId) => void;
  setAccentColor: (accentColor: AccentColorId) => void;
  setWindowRadius: (radius: number) => void;
  setBlurAmount: (blur: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  setFontFamily: (font: FontFamilyId) => void;
  setUiScale: (scale: number) => void;
  setIconShape: (shape: IconShape) => void;
  setIconPack: (pack: IconPackId) => void;
  setWindowMaterial: (material: WindowMaterial) => void;
  setWindowOpacity: (opacity: number) => void;
}

const getStoredThemeId = (): ThemeId => {
  try {
    const t = (localStorage.getItem('onyx_theme') || localStorage.getItem('flowos_theme')) as ThemeId;
    if (t === 'dark' || t === 'light' || t === 'high-contrast') return t;
  } catch {}
  return 'dark';
};

const getStoredIconPack = (): IconPackId => {
  try {
    const p = (localStorage.getItem('onyx_icon_pack') || localStorage.getItem('flowos_icon_pack')) as IconPackId;
    if (p === 'monochrome' || p === 'vibrant' || p === 'neon' || p === 'pastel') return p;
  } catch {}
  return 'monochrome';
};

const getStoredIconShape = (): IconShape => {
  try {
    const s = localStorage.getItem('flowos_icon_shape') as IconShape;
    if (s === 'squircle' || s === 'circle' || s === 'rounded' || s === 'smooth') return s;
  } catch {}
  return 'squircle';
};

const getStoredWindowMaterial = (): WindowMaterial => {
  try {
    const m = localStorage.getItem('flowos_window_material') as WindowMaterial;
    if (m === 'glass' || m === 'solid' || m === 'translucent') return m;
  } catch {}
  return 'glass';
};

const getStoredWindowOpacity = (): number => {
  try {
    const o = parseFloat(localStorage.getItem('flowos_window_opacity') || '0.95');
    if (!isNaN(o) && o >= 0.5 && o <= 1.0) return o;
  } catch {}
  return 0.95;
};

// Immediate DOM sync on load
try {
  const initialTheme = getStoredThemeId();
  const root = document.documentElement;
  if (initialTheme === 'dark') {
    root.removeAttribute('data-theme');
    root.classList.remove('light', 'high-contrast');
    root.classList.add('dark');
  } else {
    root.setAttribute('data-theme', initialTheme);
    root.classList.remove('dark');
    root.classList.add(initialTheme);
  }
} catch {}

export const useThemeStore = create<ThemeStoreState>((set) => ({
  themeId: getStoredThemeId(),
  accentColor: 'indigo',
  blurEnabled: true,
  reducedMotion: false,
  windowRadius: 16,
  wallpaperId: 'obsidian-flow',
  fontFamily: 'inter',
  uiScale: 1.0,
  iconShape: getStoredIconShape(),
  iconPack: getStoredIconPack(),
  windowMaterial: getStoredWindowMaterial(),
  windowOpacity: getStoredWindowOpacity(),

  setTheme: (themeId) => {
    try {
      localStorage.setItem('onyx_theme', themeId);
    } catch {}
    set({ themeId });
    const root = document.documentElement;
    if (themeId === 'dark') {
      root.removeAttribute('data-theme');
      root.classList.remove('light', 'high-contrast');
      root.classList.add('dark');
      try {
        const wp = useWallpaperStore.getState();
        if (wp.currentWallpaperId === 'sequoia-light' || wp.currentWallpaperId === 'nordic-frost') {
          wp.setWallpaper('sequoia-dark');
        }
      } catch {}
    } else if (themeId === 'light') {
      root.setAttribute('data-theme', themeId);
      root.classList.remove('dark', 'high-contrast');
      root.classList.add(themeId);
      try {
        const wp = useWallpaperStore.getState();
        if (wp.currentWallpaperId === 'sequoia-dark' || wp.currentWallpaperId === 'obsidian-carbon') {
          wp.setWallpaper('sequoia-light');
        }
      } catch {}
    } else {
      root.setAttribute('data-theme', themeId);
      root.classList.remove('dark', 'light');
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

  setIconShape: (iconShape) => {
    try {
      localStorage.setItem('flowos_icon_shape', iconShape);
    } catch {}
    set({ iconShape });
  },

  setIconPack: (iconPack) => {
    try {
      localStorage.setItem('onyx_icon_pack', iconPack);
    } catch {}
    set({ iconPack });
  },

  setWindowMaterial: (windowMaterial) => {
    try {
      localStorage.setItem('flowos_window_material', windowMaterial);
    } catch {}
    set({ windowMaterial });
  },

  setWindowOpacity: (windowOpacity) => {
    const clamped = Math.max(0.5, Math.min(1.0, windowOpacity));
    try {
      localStorage.setItem('flowos_window_opacity', clamped.toString());
    } catch {}
    set({ windowOpacity: clamped });
  },
}));
