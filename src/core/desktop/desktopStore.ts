import { create } from 'zustand';
import { appRegistry } from '@core/process/registry';

export type DesktopLayoutMode = 'grid' | 'freeform';

export interface DesktopShortcut {
  id: string;
  name: string;
  type: 'app' | 'file' | 'folder';
  target: string;
  isCustom?: boolean;
}

export interface IconPosition {
  x: number;
  y: number;
}

export const GRID_WIDTH = 96;
export const GRID_HEIGHT = 100;
export const ORIGIN_X = 28;
export const ORIGIN_Y = 56;

const POSITIONS_STORAGE_KEY = 'flowos_desktop_icon_positions_v3';
const SHORTCUTS_STORAGE_KEY = 'flowos_desktop_app_shortcuts_v3';
const LAYOUT_MODE_KEY = 'flowos_desktop_layout_mode_v3';

export const INITIAL_DEFAULT_APPS: DesktopShortcut[] = [
  { id: 'app-files', name: 'Files', type: 'app', target: 'file-explorer' },
  { id: 'app-browser', name: 'Browser', type: 'app', target: 'browser' },
  { id: 'app-code', name: 'Code', type: 'app', target: 'code-editor' },
  { id: 'app-notes', name: 'Notes', type: 'app', target: 'notes' },
  { id: 'app-terminal', name: 'Terminal', type: 'app', target: 'terminal' },
];

function loadSavedPositions(): Record<string, IconPosition> {
  try {
    const raw = localStorage.getItem(POSITIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function loadSavedShortcuts(): DesktopShortcut[] {
  try {
    const raw = localStorage.getItem(SHORTCUTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_DEFAULT_APPS;
}

function loadSavedLayoutMode(): DesktopLayoutMode {
  try {
    const mode = localStorage.getItem(LAYOUT_MODE_KEY) as DesktopLayoutMode;
    if (mode === 'grid' || mode === 'freeform') return mode;
  } catch {}
  return 'freeform';
}

export function snapToGrid(rawX: number, rawY: number): IconPosition {
  const col = Math.max(0, Math.round((rawX - ORIGIN_X) / GRID_WIDTH));
  const row = Math.max(0, Math.round((rawY - ORIGIN_Y) / GRID_HEIGHT));
  return {
    x: ORIGIN_X + col * GRID_WIDTH,
    y: ORIGIN_Y + row * GRID_HEIGHT,
  };
}

export interface DesktopStoreState {
  selectedIconId: string | null;
  layoutMode: DesktopLayoutMode;
  shortcuts: DesktopShortcut[];
  positions: Record<string, IconPosition>;

  setSelectedIconId: (id: string | null) => void;
  setLayoutMode: (mode: DesktopLayoutMode) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  isAppOnDesktop: (appId: string) => boolean;
  addAppShortcut: (appId: string, customPosition?: IconPosition) => boolean;
  removeAppShortcut: (appIdOrShortcutId: string) => boolean;
  autoArrangeGrid: (allItemIds: string[]) => void;
}

export const useDesktopStore = create<DesktopStoreState>((set, get) => ({
  selectedIconId: null,
  layoutMode: loadSavedLayoutMode(),
  shortcuts: loadSavedShortcuts(),
  positions: loadSavedPositions(),

  setSelectedIconId: (id) => set({ selectedIconId: id }),

  setLayoutMode: (mode) => {
    localStorage.setItem(LAYOUT_MODE_KEY, mode);
    set({ layoutMode: mode });
    if (mode === 'grid') {
      const current = get().positions;
      const snapped: Record<string, IconPosition> = {};
      for (const [id, pos] of Object.entries(current)) {
        snapped[id] = snapToGrid(pos.x, pos.y);
      }
      try {
        localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(snapped));
      } catch {}
      set({ positions: snapped });
    }
  },

  updatePosition: (id, rawX, rawY) => {
    const mode = get().layoutMode;
    const finalPos = mode === 'grid' ? snapToGrid(rawX, rawY) : { x: Math.round(rawX), y: Math.round(rawY) };

    set((state) => {
      const nextPositions = { ...state.positions, [id]: finalPos };
      try {
        localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(nextPositions));
      } catch {}
      return { positions: nextPositions };
    });
  },

  isAppOnDesktop: (appId: string) => {
    const shortcuts = get().shortcuts;
    const shortcutId = `app-${appId}`;
    return shortcuts.some((s) => s.target === appId || s.id === shortcutId || s.id === appId);
  },

  addAppShortcut: (appId, customPosition) => {
    const state = get();
    const shortcutId = `app-${appId}`;

    // Check if already in shortcuts
    const exists = state.shortcuts.some((s) => s.target === appId || s.id === shortcutId || s.id === appId);

    if (exists) {
      if (customPosition) {
        state.updatePosition(shortcutId, customPosition.x, customPosition.y);
      }
      set({ selectedIconId: shortcutId });
      return false;
    }

    const app = appRegistry.get(appId);
    const name = app?.name || appId;

    const newShortcut: DesktopShortcut = {
      id: shortcutId,
      name,
      type: 'app',
      target: appId,
      isCustom: true,
    };

    const nextShortcuts = [...state.shortcuts, newShortcut];
    try {
      localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(nextShortcuts));
    } catch {}

    // Compute initial coordinate
    let initialPos: IconPosition;
    if (customPosition) {
      initialPos = state.layoutMode === 'grid'
        ? snapToGrid(customPosition.x, customPosition.y)
        : { x: Math.round(customPosition.x), y: Math.round(customPosition.y) };
    } else {
      const totalCount = nextShortcuts.length;
      const maxRows = typeof window !== 'undefined'
        ? Math.max(3, Math.floor((window.innerHeight - ORIGIN_Y - 120) / GRID_HEIGHT))
        : 6;
      const col = Math.floor((totalCount - 1) / maxRows);
      const row = (totalCount - 1) % maxRows;
      initialPos = {
        x: ORIGIN_X + col * GRID_WIDTH,
        y: ORIGIN_Y + row * GRID_HEIGHT,
      };
    }

    const nextPositions = { ...state.positions, [shortcutId]: initialPos };
    try {
      localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(nextPositions));
    } catch {}

    set({
      shortcuts: nextShortcuts,
      positions: nextPositions,
      selectedIconId: shortcutId,
    });
    return true;
  },

  removeAppShortcut: (appIdOrShortcutId) => {
    const state = get();
    const targetShortcut = state.shortcuts.find(
      (s) => s.id === appIdOrShortcutId || s.target === appIdOrShortcutId
    );

    if (!targetShortcut) return false;

    const nextShortcuts = state.shortcuts.filter((s) => s.id !== targetShortcut.id);
    const nextPositions = { ...state.positions };
    delete nextPositions[targetShortcut.id];

    try {
      localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(nextShortcuts));
      localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(nextPositions));
    } catch {}

    set({
      shortcuts: nextShortcuts,
      positions: nextPositions,
      selectedIconId: state.selectedIconId === targetShortcut.id ? null : state.selectedIconId,
    });
    return true;
  },

  autoArrangeGrid: (allItemIds) => {
    const maxRows = typeof window !== 'undefined'
      ? Math.max(3, Math.floor((window.innerHeight - ORIGIN_Y - 120) / GRID_HEIGHT))
      : 6;

    const newPositions: Record<string, IconPosition> = {};
    allItemIds.forEach((id, index) => {
      const col = Math.floor(index / maxRows);
      const row = index % maxRows;
      newPositions[id] = {
        x: ORIGIN_X + col * GRID_WIDTH,
        y: ORIGIN_Y + row * GRID_HEIGHT,
      };
    });

    try {
      localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(newPositions));
    } catch {}

    set({ positions: newPositions });
  },
}));
