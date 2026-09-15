import React, { useState } from 'react';
import {
  Folder,
  File,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  FolderPlus,
  FilePlus,
  Trash2,
  HardDrive,
  Home,
  Monitor,
  FileText,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import type { VFSNode } from '@contracts/vfs';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useProcessStore } from '@core/process/processStore';
import { normalizePath } from '@core/vfs/vfsService';

const FileExplorerApp: React.FC<AppProps> = ({ windowId }) => {
  const { nodes, mkdir, writeFile, deleteNode } = useVFSStore();
  const { launchApp } = useProcessStore();

  const [currentPath, setCurrentPath] = useState<string>('/home/user');
  const [history, setHistory] = useState<string[]>(['/home/user']);
  const [historyIdx, setHistoryIdx] = useState<number>(0);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    const normalized = normalizePath(path);
    const newHistory = history.slice(0, historyIdx + 1);
    setHistory([...newHistory, normalized]);
    setHistoryIdx(newHistory.length);
    setCurrentPath(normalized);
    setSelectedPath(null);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setCurrentPath(history[historyIdx - 1]!);
      setSelectedPath(null);
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setCurrentPath(history[historyIdx + 1]!);
      setSelectedPath(null);
    }
  };

  // Get nodes in current directory
  const currentNodes = Object.values(nodes).filter(
    (n) => n.parentPath === currentPath && n.path !== currentPath
  );

  const handleOpenNode = (node: VFSNode) => {
    if (node.type === 'directory') {
      navigateTo(node.path);
    } else {
      // Open in Notes editor
      launchApp('notes');
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt('Enter folder name:', 'New Folder');
    if (!name?.trim()) return;
    const path = normalizePath(`${currentPath}/${name.trim()}`);
    await mkdir(path);
  };

  const handleCreateFile = async () => {
    const name = window.prompt('Enter file name:', 'untitled.txt');
    if (!name?.trim()) return;
    const path = normalizePath(`${currentPath}/${name.trim()}`);
    await writeFile(path, 'Created in FlowOS File Explorer.');
  };

  const handleDelete = async (path: string) => {
    if (window.confirm(`Delete '${path}'?`)) {
      await deleteNode(path);
      if (selectedPath === path) setSelectedPath(null);
    }
  };

  // Breadcrumbs
  const pathSegments = currentPath.split('/').filter(Boolean);

  return (
    <div className="flex h-full w-full bg-surface-panel text-content-primary">
      {/* Sidebar Navigation */}
      <aside className="w-48 border-r border-white/5 bg-surface-overlay/30 p-3 flex flex-col justify-between select-none">
        <div className="space-y-1">
          <span className="px-2 font-mono text-[10px] uppercase text-content-tertiary">
            Places
          </span>

          <button
            onClick={() => navigateTo('/home/user')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              currentPath === '/home/user'
                ? 'bg-accent-primary/20 text-content-primary border border-accent-primary/30'
                : 'text-content-secondary hover:bg-white/5'
            }`}
          >
            <Home className="h-3.5 w-3.5 text-accent-primary" />
            Home
          </button>

          <button
            onClick={() => navigateTo('/home/user/Documents')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              currentPath === '/home/user/Documents'
                ? 'bg-accent-primary/20 text-content-primary border border-accent-primary/30'
                : 'text-content-secondary hover:bg-white/5'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            Documents
          </button>

          <button
            onClick={() => navigateTo('/home/user/Desktop')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              currentPath === '/home/user/Desktop'
                ? 'bg-accent-primary/20 text-content-primary border border-accent-primary/30'
                : 'text-content-secondary hover:bg-white/5'
            }`}
          >
            <Monitor className="h-3.5 w-3.5 text-cyan-400" />
            Desktop
          </button>

          <button
            onClick={() => navigateTo('/')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              currentPath === '/'
                ? 'bg-accent-primary/20 text-content-primary border border-accent-primary/30'
                : 'text-content-secondary hover:bg-white/5'
            }`}
          >
            <HardDrive className="h-3.5 w-3.5 text-amber-400" />
            Root System
          </button>
        </div>

        <div className="px-2 font-mono text-[10px] text-content-tertiary">
          win: {windowId.slice(-6)}
        </div>
      </aside>

      {/* Main Browser Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Explorer Toolbar & Breadcrumbs */}
        <header className="flex h-11 items-center justify-between border-b border-white/5 bg-surface-overlay/50 px-3 select-none">
          {/* Back/Forward buttons + Breadcrumbs */}
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center gap-1">
              <button
                onClick={goBack}
                disabled={historyIdx === 0}
                className="rounded p-1 text-content-secondary hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={goForward}
                disabled={historyIdx >= history.length - 1}
                className="rounded p-1 text-content-secondary hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Clickable Breadcrumbs Rail */}
            <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-white/5 px-2 py-1 font-mono text-xs text-content-secondary">
              <span
                onClick={() => navigateTo('/')}
                className="cursor-pointer hover:text-content-primary transition-colors"
              >
                /
              </span>
              {pathSegments.map((segment, index) => {
                const segPath = '/' + pathSegments.slice(0, index + 1).join('/');
                return (
                  <React.Fragment key={segPath}>
                    <ChevronRight className="h-3 w-3 opacity-40" />
                    <span
                      onClick={() => navigateTo(segPath)}
                      className="cursor-pointer hover:text-content-primary transition-colors"
                    >
                      {segment}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: New Folder, New File, Delete */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCreateFolder}
              title="New Folder"
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-content-secondary hover:bg-white/10 hover:text-content-primary transition-colors"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Folder</span>
            </button>
            <button
              onClick={handleCreateFile}
              title="New File"
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-content-secondary hover:bg-white/10 hover:text-content-primary transition-colors"
            >
              <FilePlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">File</span>
            </button>
            {selectedPath && (
              <button
                onClick={() => handleDelete(selectedPath)}
                title="Delete Selected"
                className="rounded-lg p-1 text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Directory Items Grid */}
        <div
          onClick={() => setSelectedPath(null)}
          className="flex-1 overflow-y-auto p-4 select-none"
        >
          {currentNodes.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-xs text-content-tertiary">
              <Folder className="h-8 w-8 opacity-25" />
              <span>Empty directory</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {currentNodes.map((node) => {
                const isSelected = selectedPath === node.path;
                const isDir = node.type === 'directory';

                return (
                  <div
                    key={node.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPath(node.path);
                    }}
                    onDoubleClick={() => handleOpenNode(node)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-accent-primary bg-accent-primary/20 scale-105 shadow-sm'
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        isDir ? 'text-accent-primary' : 'text-content-secondary'
                      }`}
                    >
                      {isDir ? (
                        <Folder className="h-7 w-7" />
                      ) : (
                        <File className="h-7 w-7" />
                      )}
                    </div>

                    <div className="w-full text-center">
                      <div className="truncate text-xs font-medium text-content-primary">
                        {node.name}
                      </div>
                      <div className="font-mono text-[9px] text-content-tertiary">
                        {isDir ? 'Folder' : `${node.size}B`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <footer className="flex h-7 items-center justify-between border-t border-white/5 bg-surface-overlay/40 px-3 font-mono text-[10px] text-content-tertiary">
          <span>{currentNodes.length} items</span>
          <span>IndexedDB VFS</span>
        </footer>
      </main>
    </div>
  );
};

export const fileExplorerManifest: AppManifest = {
  id: 'file-explorer',
  name: 'Files',
  description: 'Visual explorer for managing directories and documents in the browser VFS.',
  category: 'utilities',
  icon: Folder,
  defaultSize: { width: 680, height: 460 },
  constraints: { minWidth: 480, minHeight: 320, maxWidth: 1100, maxHeight: 850 },
  allowMultipleInstances: true,
  permissions: ['vfs:read', 'vfs:write'],
  component: FileExplorerApp,
};
