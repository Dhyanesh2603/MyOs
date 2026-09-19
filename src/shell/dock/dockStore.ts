import { create } from 'zustand';

export type DockSize = 'compact' | 'regular' | 'large';
export type DockAutoHideMode = 'smart' | 'always' | 'never';

export interface DockState {
  pinnedAppIds: string[];
  dockSize: DockSize;
  autoHideMode: DockAutoHideMode;
  isDockRevealed: boolean;

  // Actions
  pinApp: (appId: string) => void;
  unpinApp: (appId: string) => void;
  setDockSize: (size: DockSize) => void;
  setAutoHideMode: (mode: DockAutoHideMode) => void;
  setIsDockRevealed: (revealed: boolean) => void;
}

export const useDockStore = create<DockState>((set) => ({
  pinnedAppIds: [
    'personal-os',
    'browser',
    'file-explorer',
    'code-editor',
    'notes',
    'terminal',
    'calculator',
    'paint',
    'gallery',
    'task-manager',
    'music',
    'system-settings',
    'retro-2048',
    'retro-sweeper',
    'synth',
    'flowcam',
    'flowtape',
    'flowboard',
  ],
  dockSize: 'regular',
  autoHideMode: 'smart',
  isDockRevealed: false,

  pinApp: (appId) => {
    set((state) => {
      if (state.pinnedAppIds.includes(appId)) return state;
      return { pinnedAppIds: [...state.pinnedAppIds, appId] };
    });
  },

  unpinApp: (appId) => {
    set((state) => ({
      pinnedAppIds: state.pinnedAppIds.filter((id) => id !== appId),
    }));
  },

  setDockSize: (size) => set({ dockSize: size }),
  setAutoHideMode: (mode) => set({ autoHideMode: mode }),
  setIsDockRevealed: (revealed) => set({ isDockRevealed: revealed }),
}));
