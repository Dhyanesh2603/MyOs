import { create } from 'zustand';
import { useVFSStore } from '@core/vfs/vfsStore';
import { soundEngine } from '@core/audio/soundEngine';

export interface QuickLookState {
  isOpen: boolean;
  filePath: string | null;
  fileName: string;
  fileContent: string | null;
  fileSize: number;
  fileExtension: string;
  appToLaunch: { id: string; name: string };
  openQuickLook: (path: string) => Promise<void>;
  closeQuickLook: () => void;
  toggleQuickLook: (path: string) => void;
}

function resolveDefaultApp(ext: string): { id: string; name: string } {
  switch (ext) {
    case 'md':
    case 'txt':
    case 'log':
      return { id: 'notes', name: 'Notes' };
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'json':
    case 'css':
    case 'html':
    case 'sh':
    case 'env':
      return { id: 'code-editor', name: 'Code Editor' };
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'webp':
      return { id: 'gallery', name: 'Gallery' };
    case 'mp3':
    case 'wav':
    case 'ogg':
      return { id: 'music', name: 'Music Player' };
    default:
      return { id: 'notes', name: 'Notes' };
  }
}

export const useQuickLookStore = create<QuickLookState>((set, get) => ({
  isOpen: false,
  filePath: null,
  fileName: '',
  fileContent: null,
  fileSize: 0,
  fileExtension: '',
  appToLaunch: { id: 'notes', name: 'Notes' },

  openQuickLook: async (path: string) => {
    const { nodes, readFile } = useVFSStore.getState();
    const node = nodes[path];
    if (!node || node.type === 'directory') return;

    soundEngine.playClick();

    const fileName = path.split('/').pop() || 'file';
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    const appToLaunch = resolveDefaultApp(fileExtension);

    try {
      const content = await readFile(path);
      set({
        isOpen: true,
        filePath: path,
        fileName,
        fileContent: content,
        fileSize: node.size,
        fileExtension,
        appToLaunch,
      });
    } catch {
      set({
        isOpen: true,
        filePath: path,
        fileName,
        fileContent: '(Unable to preview content)',
        fileSize: node.size,
        fileExtension,
        appToLaunch,
      });
    }
  },

  closeQuickLook: () => {
    soundEngine.playClick();
    set({ isOpen: false, filePath: null, fileContent: null });
  },

  toggleQuickLook: (path: string) => {
    if (get().isOpen && get().filePath === path) {
      get().closeQuickLook();
    } else {
      get().openQuickLook(path);
    }
  },
}));
