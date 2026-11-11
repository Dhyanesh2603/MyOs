import { create } from 'zustand';
import { vfs, normalizePath } from './vfsService';
import { useVFSStore } from './vfsStore';
import { useNotificationStore } from '@core/notifications/notificationStore';

export interface MountedFolder {
  id: string;
  name: string;
  vfsPath: string; // e.g. "/device/MyProject"
  fileCount: number;
  totalSize: number;
  mountedAt: number;
}

export interface DeviceStorageState {
  mountedFolders: MountedFolder[];
  isMounting: boolean;

  mountDirectoryPicker: () => Promise<string | null>;
  mountDirectoryFromInput: (files: FileList) => Promise<string | null>;
  mountFilesFromInput: (files: FileList, folderName?: string) => Promise<string | null>;
  unmountFolder: (vfsPath: string) => Promise<void>;
}

// Helpers
const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'json', 'js', 'ts', 'jsx', 'tsx',
  'html', 'htm', 'css', 'scss', 'sass', 'less', 'py', 'sh',
  'bash', 'zsh', 'env', 'yml', 'yaml', 'xml', 'csv', 'svg',
  'sql', 'rs', 'go', 'c', 'cpp', 'h', 'hpp', 'java', 'kt',
  'rb', 'php', 'toml', 'ini', 'cfg', 'conf', 'log',
]);

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.cache',
  '.turbo', 'coverage', '.vscode', '.idea',
]);

function isTextFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return TEXT_EXTENSIONS.has(ext);
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export const useDeviceStorageStore = create<DeviceStorageState>((set) => ({
  mountedFolders: [],
  isMounting: false,

  /**
   * Mounts a local directory using the W3C File System Access API (showDirectoryPicker)
   */
  mountDirectoryPicker: async () => {
    const { notify } = useNotificationStore.getState();

    if (!('showDirectoryPicker' in window)) {
      notify({
        title: 'API Not Supported',
        message: 'Your browser does not support Directory Picker. Using file dialog fallback...',
        type: 'info',
      });
      // Fallback: trigger file input with webkitdirectory
      return triggerDirectoryInputFallback();
    }

    try {
      set({ isMounting: true });
      // Request access to host directory
      // @ts-expect-error showDirectoryPicker is a standard modern web API
      const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
        mode: 'read',
      });

      const folderName = dirHandle.name || 'DeviceFolder';
      const rootPath = normalizePath(`/device/${folderName}`);

      // Ensure /device directory exists in VFS
      await vfs.mkdir('/device').catch(() => {});
      await vfs.mkdir(rootPath).catch(() => {});

      let fileCount = 0;
      let totalSize = 0;

      // Recursive scan function
      async function scanDirectory(
        handle: FileSystemDirectoryHandle,
        currentVfsDir: string,
        depth = 0
      ) {
        if (depth > 4) return; // Prevent excessive deep traversal

        // @ts-expect-error entries() is available on FileSystemDirectoryHandle
        for await (const [name, entry] of handle.entries()) {
          if (IGNORED_DIRS.has(name)) continue;

          const childVfsPath = normalizePath(`${currentVfsDir}/${name}`);

          if (entry.kind === 'directory') {
            await vfs.mkdir(childVfsPath).catch(() => {});
            await scanDirectory(entry as FileSystemDirectoryHandle, childVfsPath, depth + 1);
          } else if (entry.kind === 'file') {
            try {
              const fileHandle = entry as FileSystemFileHandle;
              const file = await fileHandle.getFile();
              totalSize += file.size;
              fileCount++;

              let content = '';
              if (file.size <= 2 * 1024 * 1024) {
                // Read text or data URL for files up to 2MB
                if (isTextFile(file.name)) {
                  content = await readFileAsText(file);
                } else if (file.type.startsWith('image/') || file.type.startsWith('audio/')) {
                  content = await readFileAsDataURL(file);
                } else {
                  content = `[Binary file: ${file.name} (${file.size} bytes)]`;
                }
              } else {
                content = `[Large file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)]`;
              }

              await vfs.writeFile(childVfsPath, content);
            } catch (err) {
              console.warn(`Could not read device file: ${name}`, err);
            }
          }
        }
      }

      await scanDirectory(dirHandle, rootPath, 0);

      // Refresh VFS Store so File Explorer immediately displays all new nodes
      await useVFSStore.getState().refresh();

      const newMounted: MountedFolder = {
        id: `mount-${Date.now()}`,
        name: folderName,
        vfsPath: rootPath,
        fileCount,
        totalSize,
        mountedAt: Date.now(),
      };

      set((state) => ({
        mountedFolders: [...state.mountedFolders.filter((f) => f.vfsPath !== rootPath), newMounted],
        isMounting: false,
      }));

      notify({
        title: 'Device Folder Mounted',
        message: `Successfully connected '${folderName}' (${fileCount} files from your device).`,
        type: 'success',
      });

      return rootPath;
    } catch (err: unknown) {
      set({ isMounting: false });
      const errObj = err as Error;
      if (errObj.name !== 'AbortError') {
        notify({
          title: 'Mount Cancelled or Failed',
          message: errObj.message || 'Could not access device folder.',
          type: 'error',
        });
      }
      return null;
    }
  },

  /**
   * Mounts files from an <input type="file" webkitdirectory /> event
   */
  mountDirectoryFromInput: async (files: FileList) => {
    if (!files || files.length === 0) return null;
    const { notify } = useNotificationStore.getState();

    try {
      set({ isMounting: true });

      // Determine top-level folder name from webkitRelativePath
      const firstFile = files[0];
      const relPath = firstFile?.webkitRelativePath || '';
      const folderName = relPath.split('/')[0] || 'DeviceFiles';
      const rootPath = normalizePath(`/device/${folderName}`);

      await vfs.mkdir('/device').catch(() => {});
      await vfs.mkdir(rootPath).catch(() => {});

      let totalSize = 0;
      let fileCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        // Skip ignored directories
        const pathParts = (file.webkitRelativePath || file.name).split('/');
        if (pathParts.some((p) => IGNORED_DIRS.has(p))) continue;

        const subRelPath = file.webkitRelativePath
          ? file.webkitRelativePath.slice(folderName.length)
          : `/${file.name}`;

        const fullVfsPath = normalizePath(`${rootPath}/${subRelPath}`);
        const parentDir = fullVfsPath.slice(0, fullVfsPath.lastIndexOf('/'));

        // Ensure parent directories exist
        if (parentDir && parentDir !== rootPath) {
          const parts = parentDir.split('/').filter(Boolean);
          let curr = '';
          for (const p of parts) {
            curr += `/${p}`;
            await vfs.mkdir(curr).catch(() => {});
          }
        }

        totalSize += file.size;
        fileCount++;

        let content = '';
        if (file.size <= 2 * 1024 * 1024) {
          if (isTextFile(file.name)) {
            content = await readFileAsText(file);
          } else if (file.type.startsWith('image/') || file.type.startsWith('audio/')) {
            content = await readFileAsDataURL(file);
          } else {
            content = `[Binary file: ${file.name} (${file.size} bytes)]`;
          }
        } else {
          content = `[Large file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)]`;
        }

        await vfs.writeFile(fullVfsPath, content);
      }

      await useVFSStore.getState().refresh();

      const newMounted: MountedFolder = {
        id: `mount-${Date.now()}`,
        name: folderName,
        vfsPath: rootPath,
        fileCount,
        totalSize,
        mountedAt: Date.now(),
      };

      set((state) => ({
        mountedFolders: [...state.mountedFolders.filter((f) => f.vfsPath !== rootPath), newMounted],
        isMounting: false,
      }));

      notify({
        title: 'Device Folder Connected',
        message: `Imported '${folderName}' (${fileCount} real files from your PC).`,
        type: 'success',
      });

      return rootPath;
    } catch (err: unknown) {
      set({ isMounting: false });
      notify({
        title: 'Import Failed',
        message: (err as Error).message || 'Failed to read files.',
        type: 'error',
      });
      return null;
    }
  },

  /**
   * Mounts individual files into a designated device folder
   */
  mountFilesFromInput: async (files: FileList, folderName = 'ImportedFiles') => {
    if (!files || files.length === 0) return null;
    const { notify } = useNotificationStore.getState();

    try {
      set({ isMounting: true });
      const rootPath = normalizePath(`/device/${folderName}`);
      await vfs.mkdir('/device').catch(() => {});
      await vfs.mkdir(rootPath).catch(() => {});

      let totalSize = 0;
      let count = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        const filePath = normalizePath(`${rootPath}/${file.name}`);
        totalSize += file.size;
        count++;

        let content = '';
        if (isTextFile(file.name)) {
          content = await readFileAsText(file);
        } else if (file.type.startsWith('image/') || file.type.startsWith('audio/')) {
          content = await readFileAsDataURL(file);
        } else {
          content = `[Binary file: ${file.name}]`;
        }

        await vfs.writeFile(filePath, content);
      }

      await useVFSStore.getState().refresh();

      const newMounted: MountedFolder = {
        id: `mount-${Date.now()}`,
        name: folderName,
        vfsPath: rootPath,
        fileCount: count,
        totalSize,
        mountedAt: Date.now(),
      };

      set((state) => ({
        mountedFolders: [...state.mountedFolders.filter((f) => f.vfsPath !== rootPath), newMounted],
        isMounting: false,
      }));

      notify({
        title: 'Device Files Added',
        message: `Imported ${count} files into ${rootPath}.`,
        type: 'success',
      });

      return rootPath;
    } catch (err: unknown) {
      set({ isMounting: false });
      notify({
        title: 'Import Failed',
        message: (err as Error).message || 'Could not read device files.',
        type: 'error',
      });
      return null;
    }
  },

  /**
   * Unmounts a device folder from VFS
   */
  unmountFolder: async (vfsPath: string) => {
    const { notify } = useNotificationStore.getState();
    try {
      await vfs.deleteNode(vfsPath);
      await useVFSStore.getState().refresh();

      set((state) => ({
        mountedFolders: state.mountedFolders.filter((f) => f.vfsPath !== vfsPath),
      }));

      notify({
        title: 'Folder Unmounted',
        message: `Disconnected ${vfsPath} from Onyx OS.`,
        type: 'info',
      });
    } catch (err: unknown) {
      notify({
        title: 'Unmount Failed',
        message: (err as Error).message || 'Could not unmount folder.',
        type: 'error',
      });
    }
  },
}));

/**
 * Triggers fallback input element when showDirectoryPicker is not supported
 */
function triggerDirectoryInputFallback(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    (input as HTMLInputElement & { webkitdirectory?: boolean }).webkitdirectory = true;
    input.multiple = true;
    input.style.display = 'none';

    input.onchange = async () => {
      if (input.files && input.files.length > 0) {
        const path = await useDeviceStorageStore.getState().mountDirectoryFromInput(input.files);
        resolve(path);
      } else {
        resolve(null);
      }
      document.body.removeChild(input);
    };

    input.oncancel = () => {
      resolve(null);
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  });
}
