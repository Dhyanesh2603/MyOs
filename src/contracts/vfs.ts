/**
 * Onyx OS Virtual File System (VFS) Contracts
 */

export type INodeType = 'file' | 'directory';

export interface VFSNode {
  readonly path: string;       // Absolute path e.g. "/home/user/notes.md"
  readonly name: string;       // Basename e.g. "notes.md"
  readonly type: INodeType;
  readonly parentPath: string; // e.g. "/home/user"
  readonly content?: string;   // Text or serialized content for files
  readonly size: number;       // Size in bytes
  readonly createdAt: number;  // Timestamp
  readonly updatedAt: number;  // Timestamp
}

export type VFSStat = Omit<VFSNode, 'content'>;
