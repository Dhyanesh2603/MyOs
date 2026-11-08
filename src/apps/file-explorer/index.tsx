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
  Download,
  Eye,
  Tag,
  Laptop,
  FolderSync,
  Plus,
  X,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import type { VFSNode } from '@contracts/vfs';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useWindowStore } from '@core/window/windowStore';
import { openVFSFile } from '@core/vfs/fileAssociations';
import { downloadVFSToPC, importHostFileToVFS } from '@core/vfs/hostBridge';
import { normalizePath } from '@core/vfs/vfsService';
import { useQuickLookStore } from '@core/quicklook/quickLookStore';
import { useBatchRenamerStore } from '@core/vfs/batchRenamerStore';
import { useDeviceStorageStore } from '@core/vfs/deviceStorage';

const FileExplorerApp: React.FC<AppProps> = ({ windowId }) => {
  const { nodes, mkdir, writeFile, deleteNode } = useVFSStore();
  const { mountedFolders, isMounting, mountDirectoryPicker, mountDirectoryFromInput, mountFilesFromInput, unmountFolder } = useDeviceStorageStore();
  const directoryInputRef = React.useRef<HTMLInputElement>(null);
  const filesInputRef = React.useRef<HTMLInputElement>(null);
  const customState = useWindowStore((state) => state.windows[windowId]?.customState as { initialData?: { initialPath?: string } } | undefined);
  const startPath = customState?.initialData?.initialPath || '/home/user';

  const [currentPath, setCurrentPath] = useState<string>(startPath);
  const [history, setHistory] = useState<string[]>([startPath]);
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

  // Keyboard shortcut: Spacebar opens Quick Look
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && selectedPath && nodes[selectedPath]?.type === 'file') {
        e.preventDefault();
        useQuickLookStore.getState().openQuickLook(selectedPath);
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        const targets = selectedPath ? [selectedPath] : Object.values(nodes).filter((n) => n.parentPath === currentPath && n.path !== currentPath).map((n) => n.path);
        if (targets.length > 0) {
          useBatchRenamerStore.getState().openRenamer(targets);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPath, nodes, currentPath]);

  // Get nodes in current directory
  const currentNodes = Object.values(nodes).filter(
    (n) => n.parentPath === currentPath && n.path !== currentPath
  );

  const handleOpenNode = (node: VFSNode) => {
    if (node.type === 'directory') {
      navigateTo(node.path);
    } else {
      openVFSFile(node.path);
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

  const handleMountLocalFolder = async () => {
    if ('showDirectoryPicker' in window) {
      const p = await mountDirectoryPicker();
      if (p) navigateTo(p);
    } else {
      directoryInputRef.current?.click();
    }
  };

  const handleMountLocalFiles = () => {
    filesInputRef.current?.click();
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

          {/* Physical Device / Host PC Storage */}
          <div className="pt-2 border-t border-border-subtle">
            <div className="flex items-center justify-between px-2 pb-1 font-mono text-[9px] uppercase tracking-wider text-content-tertiary">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Laptop className="h-3 w-3" />
                Device Storage
              </span>
              {isMounting && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </div>

            <button
              onClick={handleMountLocalFolder}
              disabled={isMounting}
              title="Grant FlowOS access to view and browse actual files from your computer"
              className="flex w-full items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm my-1"
            >
              <span className="flex items-center gap-1.5 truncate">
                <FolderSync className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{isMounting ? 'Connecting...' : 'Mount Local Folder'}</span>
              </span>
              <Plus className="h-3 w-3 shrink-0" />
            </button>

            <button
              onClick={handleMountLocalFiles}
              disabled={isMounting}
              title="Pick individual files from your PC"
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-content-tertiary hover:bg-surface-subtle/50 hover:text-content-secondary transition-colors"
            >
              <FilePlus className="h-3 w-3" />
              <span>Import PC Files...</span>
            </button>

            {mountedFolders.map((f) => (
              <div
                key={f.id}
                className={`group flex items-center justify-between rounded-md px-2 py-1 text-xs transition-colors ${
                  currentPath.startsWith(f.vfsPath)
                    ? 'bg-surface-subtle text-content-primary font-medium shadow-sm'
                    : 'text-content-secondary hover:bg-surface-subtle/50'
                }`}
              >
                <button
                  onClick={() => navigateTo(f.vfsPath)}
                  className="flex items-center gap-2 truncate flex-1 text-left"
                >
                  <HardDrive className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{f.name}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    unmountFolder(f.vfsPath);
                    if (currentPath.startsWith(f.vfsPath)) {
                      navigateTo('/home/user');
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-content-tertiary hover:bg-rose-500/20 hover:text-rose-400 transition-all"
                  title="Unmount device folder"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
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

            <button
              onClick={handleMountLocalFolder}
              disabled={isMounting}
              title="Mount and browse actual files from your computer"
              className="flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm"
            >
              <Laptop className="h-3 w-3" />
              <span>{isMounting ? 'Connecting...' : 'Connect PC Folder'}</span>
            </button>

            <button
              onClick={() => {
                const targets = selectedPath ? [selectedPath] : currentNodes.map((n) => n.path);
                if (targets.length > 0) {
                  useBatchRenamerStore.getState().openRenamer(targets);
                }
              }}
              title="Batch Rename Files (F2)"
              className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle/50 px-2 py-1 text-[10px] font-mono text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
            >
              <Tag className="h-3 w-3 text-emerald-400" />
              <span className="hidden sm:inline">Rename</span>
            </button>

            {selectedPath && nodes[selectedPath]?.type === 'file' && (
              <>
                <button
                  onClick={() => useQuickLookStore.getState().openQuickLook(selectedPath)}
                  title="Quick Look Preview (Space)"
                  className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle/50 px-2 py-1 text-[10px] font-mono text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
                >
                  <Eye className="h-3 w-3 text-cyan-400" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                <button
                  onClick={() => downloadVFSToPC(selectedPath)}
                  title="Download to Physical PC"
                  className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle/50 px-2 py-1 text-[10px] font-mono text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
                >
                  <Download className="h-3 w-3 text-emerald-400" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </>
            )}

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
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files?.length) {
              for (const f of Array.from(e.dataTransfer.files)) {
                await importHostFileToVFS(f, currentPath);
              }
            }
          }}
          className="flex-1 overflow-y-auto p-4 select-none"
        >
          {/* Device Storage notification banner */}
          {currentPath.startsWith('/device') && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-300 shadow-sm">
              <div className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white">Physical PC Storage:</span>{' '}
                  <span>Showing actual files from your computer synced into FlowOS.</span>
                </div>
              </div>
              <button
                onClick={handleMountLocalFolder}
                className="rounded bg-emerald-500/20 px-2 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/30 transition-colors shrink-0"
              >
                + Connect Another
              </button>
            </div>
          )}

          {currentNodes.length === 0 ? (
            currentPath === '/device' ? (
              <div className="flex h-56 flex-col items-center justify-center gap-3 text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Laptop className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-content-primary">Connect Device Storage</h3>
                <p className="text-xs text-content-tertiary max-w-sm">
                  Grant FlowOS access to browse and open actual folders and files from your real PC.
                </p>
                <button
                  onClick={handleMountLocalFolder}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-mono text-xs font-semibold text-black shadow-md hover:bg-emerald-400 transition-colors"
                >
                  <FolderSync className="h-4 w-4" />
                  <span>Mount Local Folder</span>
                </button>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 font-mono text-xs text-content-tertiary">
                <Folder className="h-6 w-6 opacity-30" />
                <span>Empty directory</span>
              </div>
            )
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

      {/* Hidden inputs for directory and file fallbacks */}
      <input
        type="file"
        ref={directoryInputRef}
        {...{ webkitdirectory: '', directory: '' }}
        multiple
        className="hidden"
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0) {
            const p = await mountDirectoryFromInput(e.target.files);
            if (p) navigateTo(p);
          }
        }}
      />
      <input
        type="file"
        ref={filesInputRef}
        multiple
        className="hidden"
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0) {
            const p = await mountFilesFromInput(e.target.files);
            if (p) navigateTo(p);
          }
        }}
      />
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
