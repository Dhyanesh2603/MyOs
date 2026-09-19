import { create } from 'zustand';

export type DockSize = 'compact' | 'regular' | 'large';

export interface DockState {
  pinnedAppIds: string[];
  dockSize: DockSize;

  // Actions
  pinApp: (appId: string) => void;
  unpinApp: (appId: string) => void;
  setDockSize: (size: DockSize) => void;
}

export const useDockStore = create<DockState>((set) => ({
  pinnedAppIds: [
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
  ],
  dockSize: 'regular',

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
}));
