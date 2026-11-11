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
    await writeFile(path, 'Created in Onyx OS File Explorer.');
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
    <div className="flex h-full w-full bg-[#0a0b10] text-neutral-100 select-none">
      {/* Linear / Modern Finder Style Sidebar */}
      <aside className="w-48 border-r border-white/[0.08] bg-[#0e1017] p-3 flex flex-col justify-between select-none">
        <div className="space-y-4">
          {/* Workspace Header */}
          <div className="flex items-center gap-1.5 px-2 pt-0.5 font-mono text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
            <Sparkles className="h-3 w-3 text-neutral-300" />
            <span>Favorites</span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => navigateTo('/home/user')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                currentPath === '/home/user'
                  ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
                  : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
              }`}
            >
              <Home className="h-3.5 w-3.5 text-neutral-300" />
              User Home
            </button>

            <button
              onClick={() => navigateTo('/home/user/Documents')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                currentPath === '/home/user/Documents'
                  ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
                  : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              Documents
            </button>

            <button
              onClick={() => navigateTo('/home/user/Desktop')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                currentPath === '/home/user/Desktop'
                  ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
                  : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
              }`}
            >
              <Monitor className="h-3.5 w-3.5 text-sky-400" />
              Desktop
            </button>

            <button
              onClick={() => navigateTo('/home/user/Pictures')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                currentPath === '/home/user/Pictures'
                  ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
                  : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
              Pictures
            </button>

            <button
              onClick={() => navigateTo('/home/user/Music')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                currentPath === '/home/user/Music'
                  ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
                  : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
              }`}
            >
              <MusicIcon className="h-3.5 w-3.5 text-amber-400" />
              Music
            </button>
          </div>

          {/* System Roots */}
          <div className="pt-3 border-t border-white/[0.08]">
            <div className="px-2 pb-1.5 font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">
              Volumes
            </div>
            <button
              onClick={() => navigateTo('/')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                currentPath === '/'
                  ? 'bg-white/10 text-white font-semibold border border-white/10 shadow-sm'
                  : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
              }`}
            >
              <HardDrive className="h-3.5 w-3.5 text-rose-400" />
              Root Inodes
            </button>
          </div>

          {/* Physical Device / Host PC Storage */}
          <div className="pt-3 border-t border-white/[0.08]">
            <div className="flex items-center justify-between px-2 pb-1.5 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Laptop className="h-3 w-3" />
                Device Storage
              </span>
              {isMounting && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>

            <button
              onClick={handleMountLocalFolder}
              disabled={isMounting}
              title="Grant Onyx OS access to view and browse actual files from your computer"
              className="flex w-full items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm my-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <FolderSync className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{isMounting ? 'Connecting...' : 'Mount Folder'}</span>
              </span>
              <Plus className="h-3 w-3 shrink-0" />
            </button>

            <button
              onClick={handleMountLocalFiles}
              disabled={isMounting}
              title="Pick individual files from your PC"
              className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] text-neutral-400 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
            >
              <FilePlus className="h-3 w-3" />
              <span>Import PC Files...</span>
            </button>

            {mountedFolders.map((f) => (
              <div
                key={f.id}
                className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  currentPath.startsWith(f.vfsPath)
                    ? 'bg-white/10 text-white font-medium shadow-sm border border-white/10'
                    : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white border border-transparent'
                }`}
              >
                <button
                  onClick={() => navigateTo(f.vfsPath)}
                  className="flex items-center gap-2 truncate flex-1 text-left cursor-pointer"
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
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-neutral-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all cursor-pointer"
                  title="Unmount device folder"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-2 font-mono text-[9px] text-neutral-500">
          win:{windowId.slice(-4)}
        </div>
      </aside>

      {/* Main Browser Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0b10]">
        {/* Apple Pro Apps Toolbar & Breadcrumbs */}
        <header className="flex h-11 items-center justify-between border-b border-white/[0.08] bg-[#10121a] px-3.5 select-none">
          {/* Back/Forward buttons + Breadcrumbs */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex items-center gap-1">
              <button
                onClick={goBack}
                disabled={historyIdx === 0}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={goForward}
                disabled={historyIdx >= history.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Clickable Breadcrumbs Rail */}
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#161824] px-2.5 py-1 font-mono text-[11px] text-neutral-300">
              <span
                onClick={() => navigateTo('/')}
                className="cursor-pointer hover:text-white transition-colors"
              >
                /
              </span>
              {pathSegments.map((segment, index) => {
                const segPath = '/' + pathSegments.slice(0, index + 1).join('/');
                return (
                  <React.Fragment key={segPath}>
                    <ChevronRight className="h-3 w-3 text-neutral-500" />
                    <span
                      onClick={() => navigateTo(segPath)}
                      className="cursor-pointer hover:text-white transition-colors"
                    >
                      {segment}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Action Controls & View Switcher */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center rounded-lg border border-white/10 bg-[#161824] p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={handleCreateFolder}
              title="New Folder"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-mono text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <FolderPlus className="h-3 w-3" />
              <span>Folder</span>
            </button>

            <button
              onClick={handleCreateFile}
              title="New File"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-mono text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <FilePlus className="h-3 w-3" />
              <span>File</span>
            </button>

            <button
              onClick={handleMountLocalFolder}
              disabled={isMounting}
              title="Mount and browse actual files from your computer"
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Laptop className="h-3 w-3" />
              <span>{isMounting ? 'Connecting...' : 'Connect PC'}</span>
            </button>

            <button
              onClick={() => {
                const targets = selectedPath ? [selectedPath] : currentNodes.map((n) => n.path);
                if (targets.length > 0) {
                  useBatchRenamerStore.getState().openRenamer(targets);
                }
              }}
              title="Batch Rename Files (F2)"
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-mono text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <Tag className="h-3 w-3 text-emerald-400" />
              <span className="hidden sm:inline">Rename</span>
            </button>

            {selectedPath && nodes[selectedPath]?.type === 'file' && (
              <>
                <button
                  onClick={() => useQuickLookStore.getState().openQuickLook(selectedPath)}
                  title="Quick Look Preview (Space)"
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-mono text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                >
                  <Eye className="h-3 w-3 text-sky-400" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                <button
                  onClick={() => downloadVFSToPC(selectedPath)}
                  title="Download to Physical PC"
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-mono text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
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
                className="rounded-lg p-1 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
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
          className="flex-1 overflow-y-auto p-4 select-none scrollbar-none no-scrollbar"
        >
          {/* Device Storage notification banner */}
          {currentPath.startsWith('/device') && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs font-mono text-emerald-300 shadow-sm">
              <div className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white">Physical PC Storage:</span>{' '}
                  <span className="text-neutral-300">Showing actual files from your computer synced into Onyx OS.</span>
                </div>
              </div>
              <button
                onClick={handleMountLocalFolder}
                className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/30 transition-colors shrink-0 cursor-pointer"
              >
                + Connect Another
              </button>
            </div>
          )}

          {currentNodes.length === 0 ? (
            currentPath === '/device' ? (
              <div className="flex h-56 flex-col items-center justify-center gap-3 text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md">
                  <Laptop className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-white">Connect Device Storage</h3>
                <p className="text-xs text-neutral-400 max-w-sm">
                  Grant Onyx OS access to browse and open actual folders and files from your real PC.
                </p>
                <button
                  onClick={handleMountLocalFolder}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-mono text-xs font-bold text-black shadow-lg hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  <FolderSync className="h-4 w-4" />
                  <span>Mount Local Folder</span>
                </button>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 font-mono text-xs text-neutral-500">
                <Folder className="h-8 w-8 opacity-20" />
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
                    className={`flex flex-col items-center gap-2 rounded-xl p-3 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-white/15 border-white/25 text-white shadow-md'
                        : 'border-transparent hover:bg-white/[0.05] hover:border-white/10 text-neutral-300'
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                        isDir
                          ? 'border-sky-500/30 bg-sky-500/15 text-sky-400'
                          : 'border-white/10 bg-[#161824] text-neutral-300'
                      }`}
                    >
                      {isDir ? (
                        <Folder className="h-6 w-6 fill-sky-400/20" />
                      ) : (
                        <File className="h-6 w-6" />
                      )}
                    </div>

                    <span className="w-full truncate text-center font-mono text-[11px] font-medium">
                      {node.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* High-Density Table View */
            <div className="w-full text-xs font-mono">
              <div className="grid grid-cols-12 border-b border-white/[0.08] pb-2 text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                <span className="col-span-6">Name</span>
                <span className="col-span-2">Kind</span>
                <span className="col-span-2">Size</span>
                <span className="col-span-2 text-right">Modified</span>
              </div>
              <div className="divide-y divide-white/[0.05]">
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
                      className={`grid grid-cols-12 items-center py-2 px-1.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-white/10 text-white font-medium'
                          : 'hover:bg-white/[0.04] text-neutral-300'
                      }`}
                    >
                      <div className="col-span-6 flex items-center gap-2 truncate">
                        {isDir ? (
                          <Folder className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        ) : (
                          <File className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        )}
                        <span className="truncate">{node.name}</span>
                      </div>
                      <span className="col-span-2 text-[10px] text-neutral-400">
                        {isDir ? 'Folder' : 'File'}
                      </span>
                      <span className="col-span-2 text-[10px] text-neutral-400">
                        {isDir ? '—' : `${node.size}B`}
                      </span>
                      <span className="col-span-2 text-right text-[10px] text-neutral-400">
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
        <footer className="flex h-7 items-center justify-between border-t border-white/[0.08] bg-[#0e1017] px-3.5 font-mono text-[9px] text-neutral-400 select-none">
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
