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
  LayoutGrid,
  List,
  Sparkles,
  Music as MusicIcon,
  Image as ImageIcon,
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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

  const pathSegments = currentPath.split('/').filter(Boolean);

  return (
    <div className="flex h-full w-full bg-surface-panel text-content-primary">
      {/* Arc-Style Fluid Spaces & Places Sidebar */}
      <aside className="w-44 border-r border-border-subtle bg-surface-overlay/80 p-2.5 flex flex-col justify-between select-none">
        <div className="space-y-3">
          {/* Arc Workspace Header */}
          <div className="flex items-center gap-1.5 px-2 pt-1 font-mono text-[10px] text-content-tertiary uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-accent-primary" />
            <span>Workspace</span>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => navigateTo('/home/user')}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                currentPath === '/home/user'
                  ? 'bg-surface-subtle text-content-primary font-semibold shadow-sm'
                  : 'text-content-secondary hover:bg-surface-subtle/50'
              }`}
            >
              <Home className="h-3.5 w-3.5 text-accent-primary" />
              User Home
            </button>

            <button
              onClick={() => navigateTo('/home/user/Documents')}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                currentPath === '/home/user/Documents'
                  ? 'bg-surface-subtle text-content-primary font-semibold shadow-sm'
                  : 'text-content-secondary hover:bg-surface-subtle/50'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              Documents
            </button>

            <button
              onClick={() => navigateTo('/home/user/Desktop')}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                currentPath === '/home/user/Desktop'
                  ? 'bg-surface-subtle text-content-primary font-semibold shadow-sm'
                  : 'text-content-secondary hover:bg-surface-subtle/50'
              }`}
            >
              <Monitor className="h-3.5 w-3.5 text-cyan-400" />
              Desktop
            </button>

            <button
              onClick={() => navigateTo('/home/user/Pictures')}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                currentPath === '/home/user/Pictures'
                  ? 'bg-surface-subtle text-content-primary font-semibold shadow-sm'
                  : 'text-content-secondary hover:bg-surface-subtle/50'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
              Pictures
            </button>

            <button
              onClick={() => navigateTo('/home/user/Music')}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                currentPath === '/home/user/Music'
                  ? 'bg-surface-subtle text-content-primary font-semibold shadow-sm'
                  : 'text-content-secondary hover:bg-surface-subtle/50'
              }`}
            >
              <MusicIcon className="h-3.5 w-3.5 text-amber-400" />
              Music
            </button>
          </div>

          {/* System Roots */}
          <div className="pt-2 border-t border-border-subtle">
            <div className="px-2 pb-1 font-mono text-[9px] uppercase tracking-wider text-content-tertiary">
              Volumes
            </div>
            <button
              onClick={() => navigateTo('/')}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
                currentPath === '/'
                  ? 'bg-surface-subtle text-content-primary shadow-sm'
                  : 'text-content-secondary hover:bg-surface-subtle/50'
              }`}
            >
              <HardDrive className="h-3.5 w-3.5 text-rose-400" />
              Root Inodes
            </button>
          </div>
        </div>

        <div className="px-2 font-mono text-[9px] text-content-tertiary">
          win: {windowId.slice(-4)}
        </div>
      </aside>

      {/* Main Browser Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden bg-surface-panel">
        {/* Apple Pro Apps Toolbar & Breadcrumbs */}
        <header className="flex h-10 items-center justify-between border-b border-border-subtle bg-surface-overlay/90 px-3 select-none">
          {/* Back/Forward buttons + Breadcrumbs */}
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center gap-0.5">
              <button
                onClick={goBack}
                disabled={historyIdx === 0}
                className="rounded p-1 text-content-tertiary hover:bg-surface-subtle hover:text-content-primary disabled:opacity-30 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={goForward}
                disabled={historyIdx >= history.length - 1}
                className="rounded p-1 text-content-tertiary hover:bg-surface-subtle hover:text-content-primary disabled:opacity-30 transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Clickable Breadcrumbs Rail */}
            <div className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle/50 px-2 py-0.5 font-mono text-[11px] text-content-secondary">
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

          {/* Action Controls & View Switcher (Apple Pro Apps Restraint) */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center rounded border border-border-subtle bg-surface-subtle/50 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`rounded p-1 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-surface-panel text-content-primary shadow-sm'
                    : 'text-content-tertiary hover:text-content-secondary'
                }`}
              >
                <LayoutGrid className="h-3 w-3" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="High-Density List Table"
                className={`rounded p-1 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-surface-panel text-content-primary shadow-sm'
                    : 'text-content-tertiary hover:text-content-secondary'
                }`}
              >
                <List className="h-3 w-3" />
              </button>
            </div>

            <button
              onClick={handleCreateFolder}
              title="New Folder"
              className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle/50 px-2 py-1 text-[10px] font-mono text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
            >
              <FolderPlus className="h-3 w-3 text-accent-primary" />
              <span>Folder</span>
            </button>

            <button
              onClick={handleCreateFile}
              title="New File"
              className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle/50 px-2 py-1 text-[10px] font-mono text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
            >
              <FilePlus className="h-3 w-3 text-accent-primary" />
              <span>File</span>
            </button>

            {selectedPath && (
              <button
                onClick={() => handleDelete(selectedPath)}
                title="Delete Selected"
                className="rounded p-1 text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Directory Items Viewport */}
        <div
          onClick={() => setSelectedPath(null)}
          className="flex-1 overflow-y-auto p-4 select-none"
        >
          {currentNodes.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 font-mono text-xs text-content-tertiary">
              <Folder className="h-6 w-6 opacity-30" />
              <span>Empty directory</span>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
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
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleOpenNode(node);
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-lg p-2.5 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-surface-subtle border-border-subtle text-content-primary shadow-sm'
                        : 'border-transparent hover:bg-surface-subtle/50 text-content-secondary'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                        isDir
                          ? 'border-accent-primary/20 bg-accent-primary/10 text-accent-primary'
                          : 'border-border-subtle bg-surface-subtle/60 text-content-tertiary'
                      }`}
                    >
                      {isDir ? (
                        <Folder className="h-5 w-5" />
                      ) : (
                        <File className="h-5 w-5" />
                      )}
                    </div>

                    <span className="w-full truncate text-center font-mono text-[11px]">
                      {node.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Apple Pro Apps High-Density Table View */
            <div className="w-full text-xs font-mono">
              <div className="grid grid-cols-12 border-b border-border-subtle pb-1.5 text-[10px] text-content-tertiary uppercase tracking-wider">
                <span className="col-span-6">Name</span>
                <span className="col-span-2">Kind</span>
                <span className="col-span-2">Size</span>
                <span className="col-span-2 text-right">Modified</span>
              </div>
              <div className="divide-y divide-border-subtle/50">
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
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleOpenNode(node);
                      }}
                      className={`grid grid-cols-12 items-center py-1.5 px-1 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-subtle text-content-primary'
                          : 'hover:bg-surface-subtle/40 text-content-secondary'
                      }`}
                    >
                      <div className="col-span-6 flex items-center gap-2 truncate">
                        {isDir ? (
                          <Folder className="h-3.5 w-3.5 text-accent-primary shrink-0" />
                        ) : (
                          <File className="h-3.5 w-3.5 text-content-tertiary shrink-0" />
                        )}
                        <span className="truncate">{node.name}</span>
                      </div>
                      <span className="col-span-2 text-[10px] text-content-tertiary">
                        {isDir ? 'Folder' : 'File'}
                      </span>
                      <span className="col-span-2 text-[10px] text-content-tertiary">
                        {isDir ? '—' : `${node.size}B`}
                      </span>
                      <span className="col-span-2 text-right text-[10px] text-content-tertiary">
                        {new Date(node.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Directory Footer Status */}
        <footer className="flex h-7 items-center justify-between border-t border-white/[0.06] bg-[#0c0d10] px-3 font-mono text-[9px] text-content-tertiary select-none">
          <span>{currentNodes.length} items</span>
          <span>{selectedPath ? selectedPath : currentPath}</span>
        </footer>
      </main>
    </div>
  );
};

export const fileExplorerManifest: AppManifest = {
  id: 'file-explorer',
  name: 'Files',
  description: 'Arc-inspired sidebar browser with Apple Pro Apps metadata tables.',
  category: 'system',
  icon: Folder,
  defaultSize: { width: 660, height: 440 },
  constraints: { minWidth: 420, minHeight: 300, maxWidth: 1100, maxHeight: 850 },
  allowMultipleInstances: true,
  permissions: ['vfs:read', 'vfs:write'],
  component: FileExplorerApp,
};
