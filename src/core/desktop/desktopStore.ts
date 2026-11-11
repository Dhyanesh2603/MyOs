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

export const GRID_WIDTH = 92;
export const GRID_HEIGHT = 96;
export const ORIGIN_X = 24;
export const ORIGIN_Y = 56;

const POSITIONS_STORAGE_KEY = 'flowos_desktop_icon_positions_v3';
const SHORTCUTS_STORAGE_KEY = 'flowos_desktop_app_shortcuts_v3';
const LAYOUT_MODE_KEY = 'flowos_desktop_layout_mode_v3';

export const INITIAL_DEFAULT_APPS: DesktopShortcut[] = [
  { id: 'app-files', name: 'Files', type: 'app', target: 'file-explorer' },
  { id: 'app-browser', name: 'Browser', type: 'app', target: 'browser' },
  { id: 'app-code', name: 'Code', type: 'app', target: 'code-editor' },
  { id: 'app-notes', name: 'Notes', type: 'app', target: 'notes' },
  { id: 'app-personal-os', name: 'Personal OS', type: 'app', target: 'personal-os' },
  { id: 'app-terminal', name: 'Terminal', type: 'app', target: 'terminal' },
];

export function snapToGrid(rawX: number, rawY: number): IconPosition {
  const col = Math.max(0, Math.round((rawX - ORIGIN_X) / GRID_WIDTH));
  const row = Math.max(0, Math.round((rawY - ORIGIN_Y) / GRID_HEIGHT));
  return {
    x: ORIGIN_X + col * GRID_WIDTH,
    y: ORIGIN_Y + row * GRID_HEIGHT,
  };
}

export function getMaxRows(height: number = typeof window !== 'undefined' ? window.innerHeight : 900): number {
  return Math.max(3, Math.floor((height - ORIGIN_Y - 110) / GRID_HEIGHT));
}

function loadSavedPositions(shortcuts: DesktopShortcut[]): Record<string, IconPosition> {
  let loaded: Record<string, IconPosition> = {};
  try {
    const raw = localStorage.getItem(POSITIONS_STORAGE_KEY);
    if (raw) loaded = JSON.parse(raw);
  } catch {}

  const maxRows = getMaxRows();
  const sanitized: Record<string, IconPosition> = {};
  const occupiedSlots = new Set<string>();

  // Snap all valid positions and discard collisions
  for (const shortcut of shortcuts) {
    const pos = loaded[shortcut.id];
    if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
      const snapped = snapToGrid(pos.x, pos.y);
      const key = `${snapped.x},${snapped.y}`;
      if (!occupiedSlots.has(key)) {
        occupiedSlots.add(key);
        sanitized[shortcut.id] = snapped;
      }
    }
  }

  // Any unplaced or collided shortcuts get assigned orderly, non-overlapping grid slots
  let col = 0;
  let row = 0;
  for (const shortcut of shortcuts) {
    if (!sanitized[shortcut.id]) {
      while (occupiedSlots.has(`${ORIGIN_X + col * GRID_WIDTH},${ORIGIN_Y + row * GRID_HEIGHT}`)) {
        row++;
        if (row >= maxRows) {
          row = 0;
          col++;
        }
      }
      const freePos = {
        x: ORIGIN_X + col * GRID_WIDTH,
        y: ORIGIN_Y + row * GRID_HEIGHT,
      };
      occupiedSlots.add(`${freePos.x},${freePos.y}`);
      sanitized[shortcut.id] = freePos;
    }
  }

  try {
    localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch {}

  return sanitized;
}

function loadSavedShortcuts(): DesktopShortcut[] {
  try {
    const raw = localStorage.getItem(SHORTCUTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default core apps like Personal OS are included if missing
        const hasPersonalOs = parsed.some((s) => s.target === 'personal-os' || s.id === 'app-personal-os');
        if (!hasPersonalOs) {
          parsed.splice(4, 0, { id: 'app-personal-os', name: 'Personal OS', type: 'app', target: 'personal-os' });
        }
        return parsed;
      }
    }
  } catch {}
  return INITIAL_DEFAULT_APPS;
}

function loadSavedLayoutMode(): DesktopLayoutMode {
  try {
    const mode = localStorage.getItem(LAYOUT_MODE_KEY) as DesktopLayoutMode;
    if (mode === 'grid' || mode === 'freeform') return mode;
  } catch {}
  return 'grid'; // Grid is the primary default
}

export interface DesktopStoreState {
  selectedIconId: string | null;
  layoutMode: DesktopLayoutMode;
  shortcuts: DesktopShortcut[];
  positions: Record<string, IconPosition>;

  setSelectedIconId: (id: string | null) => void;
  setLayoutMode: (mode: DesktopLayoutMode) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  setAllPositions: (positions: Record<string, IconPosition>) => void;
  isAppOnDesktop: (appId: string) => boolean;
  addAppShortcut: (appId: string, customPosition?: IconPosition) => boolean;
  removeAppShortcut: (appIdOrShortcutId: string) => boolean;
  autoArrangeGrid: (allItemIds: string[]) => void;
}

const initialShortcuts = loadSavedShortcuts();

export const useDesktopStore = create<DesktopStoreState>((set, get) => ({
  selectedIconId: null,
  layoutMode: loadSavedLayoutMode(),
  shortcuts: initialShortcuts,
  positions: loadSavedPositions(initialShortcuts),

  setSelectedIconId: (id) => set((s) => (s.selectedIconId === id ? s : { selectedIconId: id })),

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
    const finalPos = snapToGrid(rawX, rawY);

    set((state) => {
      const nextPositions = { ...state.positions };

      // Prevent overlaps: find if another icon occupies finalPos
      const conflictingId = Object.keys(nextPositions).find(
        (key) => key !== id && nextPositions[key]?.x === finalPos.x && nextPositions[key]?.y === finalPos.y
      );

      if (conflictingId && state.positions[id]) {
        // Swap conflicting icon into id's previous slot
        nextPositions[conflictingId] = { ...state.positions[id]! };
      }
      nextPositions[id] = finalPos;

      try {
        localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(nextPositions));
      } catch {}
      return { positions: nextPositions };
    });
  },

  setAllPositions: (newPositions) => {
    try {
      localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(newPositions));
    } catch {}
    set({ positions: newPositions });
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

    // Compute initial coordinate without collision
    const occupiedSlots = new Set(
      Object.values(state.positions).map((p) => `${p.x},${p.y}`)
    );
    const maxRows = getMaxRows();

    let initialPos: IconPosition;
    if (customPosition) {
      const snapped = snapToGrid(customPosition.x, customPosition.y);
      if (!occupiedSlots.has(`${snapped.x},${snapped.y}`)) {
        initialPos = snapped;
      } else {
        let col = 0;
        let row = 0;
        while (occupiedSlots.has(`${ORIGIN_X + col * GRID_WIDTH},${ORIGIN_Y + row * GRID_HEIGHT}`)) {
          row++;
          if (row >= maxRows) {
            row = 0;
            col++;
          }
        }
        initialPos = {
          x: ORIGIN_X + col * GRID_WIDTH,
          y: ORIGIN_Y + row * GRID_HEIGHT,
        };
      }
    } else {
      let col = 0;
      let row = 0;
      while (occupiedSlots.has(`${ORIGIN_X + col * GRID_WIDTH},${ORIGIN_Y + row * GRID_HEIGHT}`)) {
        row++;
        if (row >= maxRows) {
          row = 0;
          col++;
        }
      }
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
    const maxRows = getMaxRows();

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
