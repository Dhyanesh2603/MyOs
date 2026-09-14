import { create } from 'zustand';
import type { VFSNode } from '@contracts/vfs';
import { vfs } from './vfsService';

export interface VFSState {
  nodes: Record<string, VFSNode>;
  currentPath: string;
  isLoading: boolean;

  init: () => Promise<void>;
  refresh: () => Promise<void>;
  writeFile: (path: string, content: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  mkdir: (path: string) => Promise<void>;
  deleteNode: (path: string) => Promise<void>;
  setCurrentPath: (path: string) => void;
}

export const useVFSStore = create<VFSState>((set, get) => ({
  nodes: {},
  currentPath: '/home/user',
  isLoading: true,

  init: async () => {
    await vfs.init();
    await get().refresh();
    set({ isLoading: false });
  },

  refresh: async () => {
    const all = await vfs.getAllNodes();
    const map: Record<string, VFSNode> = {};
    for (const node of all) {
      map[node.path] = node;
    }
    set({ nodes: map });
  },

  writeFile: async (path, content) => {
    await vfs.writeFile(path, content);
    await get().refresh();
  },

  readFile: async (path) => {
    return vfs.readFile(path);
  },

  mkdir: async (path) => {
    await vfs.mkdir(path);
    await get().refresh();
  },

  deleteNode: async (path) => {
    await vfs.deleteNode(path);
    await get().refresh();
  },

  setCurrentPath: (currentPath) => set({ currentPath }),
}));
