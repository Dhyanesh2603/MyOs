import { create } from 'zustand';
import type { WindowId, WindowPosition, WindowSize } from '@contracts/window';
import { useWindowStore } from './windowStore';
import { DEFAULT_INSETS } from './geometry';
import { soundEngine } from '@core/audio/soundEngine';

export type FancyZoneId =
  | 'left-half'
  | 'right-half'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center-focus'
  | 'left-third'
  | 'center-third'
  | 'right-third';

export interface FancyZoneConfig {
  id: FancyZoneId;
  label: string;
  calcBounds: (
    viewport: WindowSize,
    insets: typeof DEFAULT_INSETS
  ) => { position: WindowPosition; size: WindowSize };
}

export const FANCY_ZONES: Record<FancyZoneId, FancyZoneConfig> = {
  'left-half': {
    id: 'left-half',
    label: 'Left 50%',
    calcBounds: (v, insets) => {
      const w = Math.floor((v.width - insets.left - insets.right) / 2);
      const h = v.height - insets.top - insets.bottom;
      return { position: { x: insets.left, y: insets.top }, size: { width: w, height: h } };
    },
  },
  'right-half': {
    id: 'right-half',
    label: 'Right 50%',
    calcBounds: (v, insets) => {
      const availW = v.width - insets.left - insets.right;
      const w = Math.floor(availW / 2);
      const h = v.height - insets.top - insets.bottom;
      return { position: { x: insets.left + w, y: insets.top }, size: { width: w, height: h } };
    },
  },
  'top-left': {
    id: 'top-left',
    label: 'Top Left Quadrant',
    calcBounds: (v, insets) => {
      const w = Math.floor((v.width - insets.left - insets.right) / 2);
      const h = Math.floor((v.height - insets.top - insets.bottom) / 2);
      return { position: { x: insets.left, y: insets.top }, size: { width: w, height: h } };
    },
  },
  'top-right': {
    id: 'top-right',
    label: 'Top Right Quadrant',
    calcBounds: (v, insets) => {
      const availW = v.width - insets.left - insets.right;
      const w = Math.floor(availW / 2);
      const h = Math.floor((v.height - insets.top - insets.bottom) / 2);
      return { position: { x: insets.left + w, y: insets.top }, size: { width: w, height: h } };
    },
  },
  'bottom-left': {
    id: 'bottom-left',
    label: 'Bottom Left Quadrant',
    calcBounds: (v, insets) => {
      const w = Math.floor((v.width - insets.left - insets.right) / 2);
      const availH = v.height - insets.top - insets.bottom;
      const h = Math.floor(availH / 2);
      return { position: { x: insets.left, y: insets.top + h }, size: { width: w, height: h } };
    },
  },
  'bottom-right': {
    id: 'bottom-right',
    label: 'Bottom Right Quadrant',
    calcBounds: (v, insets) => {
      const availW = v.width - insets.left - insets.right;
      const w = Math.floor(availW / 2);
      const availH = v.height - insets.top - insets.bottom;
      const h = Math.floor(availH / 2);
      return { position: { x: insets.left + w, y: insets.top + h }, size: { width: w, height: h } };
    },
  },
  'center-focus': {
    id: 'center-focus',
    label: 'Center Stage',
    calcBounds: (v, insets) => {
      const availW = v.width - insets.left - insets.right;
      const availH = v.height - insets.top - insets.bottom;
      const w = Math.floor(availW * 0.72);
      const h = Math.floor(availH * 0.85);
      const x = insets.left + Math.floor((availW - w) / 2);
      const y = insets.top + Math.floor((availH - h) / 2);
      return { position: { x, y }, size: { width: w, height: h } };
    },
  },
  'left-third': {
    id: 'left-third',
    label: 'Left 1/3',
    calcBounds: (v, insets) => {
      const w = Math.floor((v.width - insets.left - insets.right) / 3);
      const h = v.height - insets.top - insets.bottom;
      return { position: { x: insets.left, y: insets.top }, size: { width: w, height: h } };
    },
  },
  'center-third': {
    id: 'center-third',
    label: 'Center 1/3',
    calcBounds: (v, insets) => {
      const availW = v.width - insets.left - insets.right;
      const w = Math.floor(availW / 3);
      const h = v.height - insets.top - insets.bottom;
      return { position: { x: insets.left + w, y: insets.top }, size: { width: w, height: h } };
    },
  },
  'right-third': {
    id: 'right-third',
    label: 'Right 1/3',
    calcBounds: (v, insets) => {
      const availW = v.width - insets.left - insets.right;
      const w = Math.floor(availW / 3);
      const h = v.height - insets.top - insets.bottom;
      return { position: { x: insets.left + w * 2, y: insets.top }, size: { width: w, height: h } };
    },
  },
};

interface FancyZonesState {
  isOverlayVisible: boolean;
  activeZoneId: FancyZoneId | null;
  draggedWindowId: WindowId | null;

  showOverlay: (windowId: WindowId) => void;
  hideOverlay: () => void;
  setActiveZone: (zoneId: FancyZoneId | null) => void;
  snapWindowToZone: (windowId: WindowId, zoneId: FancyZoneId) => void;
}

export const useFancyZonesStore = create<FancyZonesState>((set) => ({
  isOverlayVisible: false,
  activeZoneId: null,
  draggedWindowId: null,

  showOverlay: (windowId) => {
    set({ isOverlayVisible: true, draggedWindowId: windowId });
  },

  hideOverlay: () => {
    set({ isOverlayVisible: false, activeZoneId: null, draggedWindowId: null });
  },

  setActiveZone: (zoneId) => {
    set({ activeZoneId: zoneId });
  },

  snapWindowToZone: (windowId, zoneId) => {
    const config = FANCY_ZONES[zoneId];
    if (!config) return;

    const viewport: WindowSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const { position, size } = config.calcBounds(viewport, DEFAULT_INSETS);
    useWindowStore.getState().updateBounds(windowId, position, size);
    soundEngine.playSnap();

    set({ isOverlayVisible: false, activeZoneId: null, draggedWindowId: null });
  },
}));
