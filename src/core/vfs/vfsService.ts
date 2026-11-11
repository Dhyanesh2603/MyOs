import type { VFSNode } from '@contracts/vfs';
import { vfsDB } from './db';

/**
 * Normalizes an absolute path.
 * Strips redundant slashes and trailing slashes (except root).
 */
export function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return '/' + parts.join('/');
}

/**
 * Extracts parent directory path from an absolute path.
 */
export function getParentPath(path: string): string {
  const normalized = normalizePath(path);
  if (normalized === '/') return '/';
  const lastSlashIndex = normalized.lastIndexOf('/');
  return lastSlashIndex === 0 ? '/' : normalized.slice(0, lastSlashIndex);
}

/**
 * Extracts the file or folder basename.
 */
export function getBaseName(path: string): string {
  const normalized = normalizePath(path);
  if (normalized === '/') return '';
  return normalized.slice(normalized.lastIndexOf('/') + 1);
}

class VFSService {
  private isInitialized = false;

  /**
   * Initializes the VFS. Seeds default root directories and welcome files
   * on first boot if the database is empty.
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;

    const rootNode = await vfsDB.get('/');
    if (!rootNode) {
      // Seed initial file tree
      const now = Date.now();
      const initialNodes: VFSNode[] = [
        {
          path: '/',
          name: '',
          type: 'directory',
          parentPath: '/',
          size: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          path: '/home',
          name: 'home',
          type: 'directory',
          parentPath: '/',
          size: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          path: '/home/user',
          name: 'user',
          type: 'directory',
          parentPath: '/home',
          size: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          path: '/home/user/Documents',
          name: 'Documents',
          type: 'directory',
          parentPath: '/home/user',
          size: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          path: '/home/user/Desktop',
          name: 'Desktop',
          type: 'directory',
          parentPath: '/home/user',
          size: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          path: '/home/user/welcome.txt',
          name: 'welcome.txt',
          type: 'file',
          parentPath: '/home/user',
          content:
            'Welcome to Onyx OS.\n\nOnyx OS is a modern browser-based desktop operating system.\nEvery file here is persisted in your browser via IndexedDB.\n\nEnjoy the fluid kinetic experience!',
          size: 165,
          createdAt: now,
          updatedAt: now,
        },
        {
          path: '/home/user/system.json',
          name: 'system.json',
          type: 'file',
          parentPath: '/home/user',
          content: JSON.stringify(
            {
              os: 'Onyx OS',
              version: '0.1.0',
              architecture: 'Micro-Kernel Frontend',
              persistence: 'IndexedDB / VFS',
            },
            null,
            2
          ),
          size: 130,
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const node of initialNodes) {
        await vfsDB.put(node);
      }
    }

    this.isInitialized = true;
  }

  public async writeFile(path: string, content: string): Promise<VFSNode> {
    await this.init();
    const normalized = normalizePath(path);
    const parentPath = getParentPath(normalized);
    const name = getBaseName(normalized);
    const now = Date.now();

    const existing = await vfsDB.get(normalized);

    const node: VFSNode = {
      path: normalized,
      name,
      type: 'file',
      parentPath,
      content,
      size: new Blob([content]).size,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    await vfsDB.put(node);
    return node;
  }

  public async readFile(path: string): Promise<string> {
    await this.init();
    const normalized = normalizePath(path);
    const node = await vfsDB.get(normalized);

    if (!node) {
      throw new Error(`[VFS] File not found: ${normalized}`);
    }

    if (node.type === 'directory') {
      throw new Error(`[VFS] Path is a directory: ${normalized}`);
    }

    return node.content ?? '';
  }

  public async mkdir(path: string): Promise<VFSNode> {
    await this.init();
    const normalized = normalizePath(path);
    const parentPath = getParentPath(normalized);
    const name = getBaseName(normalized);
    const now = Date.now();

    const existing = await vfsDB.get(normalized);
    if (existing) {
      return existing;
    }

    const node: VFSNode = {
      path: normalized,
      name,
      type: 'directory',
      parentPath,
      size: 0,
      createdAt: now,
      updatedAt: now,
    };

    await vfsDB.put(node);
    return node;
  }

  public async readDir(path: string): Promise<VFSNode[]> {
    await this.init();
    const normalized = normalizePath(path);
    const all = await vfsDB.getAll();
    return all.filter((n) => n.parentPath === normalized && n.path !== normalized);
  }

  public async deleteNode(path: string): Promise<void> {
    await this.init();
    const normalized = normalizePath(path);
    if (normalized === '/') {
      throw new Error('[VFS] Cannot delete root directory.');
    }

    const all = await vfsDB.getAll();
    const toDelete = all.filter(
      (n) => n.path === normalized || n.path.startsWith(normalized + '/')
    );

    for (const node of toDelete) {
      await vfsDB.delete(node.path);
    }
  }

  public async stat(path: string): Promise<VFSNode | null> {
    await this.init();
    const normalized = normalizePath(path);
    const node = await vfsDB.get(normalized);
    return node ?? null;
  }

  public async getAllNodes(): Promise<VFSNode[]> {
    await this.init();
    return vfsDB.getAll();
  }
}

export const vfs = new VFSService();
