import { create } from 'zustand';
import { soundEngine } from '@core/audio/soundEngine';

export interface WorkspaceItem {
  id: number;
  name: string;
}

export interface WorkspaceStoreState {
  workspaces: WorkspaceItem[];
  activeWorkspaceId: number;
  isMissionControlOpen: boolean;

  setActiveWorkspace: (id: number) => void;
  nextWorkspace: () => void;
  prevWorkspace: () => void;
  toggleMissionControl: () => void;
  openMissionControl: () => void;
  closeMissionControl: () => void;
  addWorkspace: () => void;
  removeWorkspace: (id: number) => void;
}

const DEFAULT_WORKSPACES: WorkspaceItem[] = [
  { id: 1, name: 'Space 1' },
  { id: 2, name: 'Space 2' },
  { id: 3, name: 'Space 3' },
  { id: 4, name: 'Space 4' },
];

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  workspaces: DEFAULT_WORKSPACES,
  activeWorkspaceId: 1,
  isMissionControlOpen: false,

  setActiveWorkspace: (id: number) => {
    const { workspaces, activeWorkspaceId } = get();
    if (id === activeWorkspaceId) return;
    const exists = workspaces.some((w) => w.id === id);
    if (!exists) return;

    soundEngine.playSnap();
    set({ activeWorkspaceId: id });
  },

  nextWorkspace: () => {
    const { workspaces, activeWorkspaceId } = get();
    const currentIdx = workspaces.findIndex((w) => w.id === activeWorkspaceId);
    const nextIdx = (currentIdx + 1) % workspaces.length;
    const nextWs = workspaces[nextIdx]!;
    soundEngine.playSnap();
    set({ activeWorkspaceId: nextWs.id });
  },

  prevWorkspace: () => {
    const { workspaces, activeWorkspaceId } = get();
    const currentIdx = workspaces.findIndex((w) => w.id === activeWorkspaceId);
    const prevIdx = (currentIdx - 1 + workspaces.length) % workspaces.length;
    const prevWs = workspaces[prevIdx]!;
    soundEngine.playSnap();
    set({ activeWorkspaceId: prevWs.id });
  },

  toggleMissionControl: () => {
    const next = !get().isMissionControlOpen;
    soundEngine.playClick();
    set({ isMissionControlOpen: next });
  },

  openMissionControl: () => {
    soundEngine.playClick();
    set({ isMissionControlOpen: true });
  },

  closeMissionControl: () => {
    set({ isMissionControlOpen: false });
  },

  addWorkspace: () => {
    const { workspaces } = get();
    if (workspaces.length >= 8) return;
    const nextId = Math.max(...workspaces.map((w) => w.id), 0) + 1;
    const nextList = [...workspaces, { id: nextId, name: `Space ${nextId}` }];
    soundEngine.playChime();
    set({ workspaces: nextList, activeWorkspaceId: nextId });
  },

  removeWorkspace: (id: number) => {
    const { workspaces, activeWorkspaceId } = get();
    if (workspaces.length <= 1) return;
    const nextList = workspaces.filter((w) => w.id !== id);
    let nextActive = activeWorkspaceId;
    if (activeWorkspaceId === id) {
      nextActive = nextList[0]!.id;
    }
    set({ workspaces: nextList, activeWorkspaceId: nextActive });
  },
}));
