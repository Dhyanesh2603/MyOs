import React, { useState } from 'react';
import { useProcessStore } from '@core/process/processStore';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useContextMenuStore } from '@core/menu/contextMenuStore';
import { openVFSFile } from '@core/vfs/fileAssociations';
import { downloadVFSToPC } from '@core/vfs/hostBridge';
import {
  Folder,
  File,
  Globe,
  Code2,
  FileText,
  Terminal,
  Layers,
  ExternalLink,
  Download,
  Eye,
} from 'lucide-react';
import { useQuickLookStore } from '@core/quicklook/quickLookStore';

interface DesktopShortcut {
  id: string;
  name: string;
  type: 'app' | 'file' | 'folder';
  target: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass?: string;
  badge?: string;
}

export const DesktopIcons: React.FC = () => {
  const { launchApp } = useProcessStore();
  const { nodes } = useVFSStore();
  const openContextMenu = useContextMenuStore((state) => state.openMenu);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Option B: Curated, clean, high-design grid of essential desktop apps
  const curatedApps: DesktopShortcut[] = [
    {
      id: 'app-personal-os',
      name: 'Flow OS',
      type: 'app',
      target: 'personal-os',
      icon: Layers,
      colorClass: 'from-indigo-500/25 to-purple-500/15 border-indigo-400/30 text-indigo-300 group-hover:border-indigo-400/60 shadow-[0_4px_16px_rgba(99,102,241,0.15)]',
    },
    {
      id: 'app-files',
      name: 'Files',
      type: 'app',
      target: 'file-explorer',
      icon: Folder,
      colorClass: 'from-blue-500/25 to-cyan-500/15 border-blue-400/30 text-blue-300 group-hover:border-blue-400/60 shadow-[0_4px_16px_rgba(59,130,246,0.15)]',
    },
    {
      id: 'app-browser',
      name: 'Browser',
      type: 'app',
      target: 'browser',
      icon: Globe,
      colorClass: 'from-cyan-500/25 to-teal-500/15 border-cyan-400/30 text-cyan-300 group-hover:border-cyan-400/60 shadow-[0_4px_16px_rgba(6,182,212,0.15)]',
    },
    {
      id: 'app-code',
      name: 'Code',
      type: 'app',
      target: 'code-editor',
      icon: Code2,
      colorClass: 'from-emerald-500/25 to-teal-500/15 border-emerald-400/30 text-emerald-300 group-hover:border-emerald-400/60 shadow-[0_4px_16px_rgba(16,185,129,0.15)]',
    },
    {
      id: 'app-notes',
      name: 'Notes',
      type: 'app',
      target: 'notes',
      icon: FileText,
      colorClass: 'from-amber-500/25 to-orange-500/15 border-amber-400/30 text-amber-300 group-hover:border-amber-400/60 shadow-[0_4px_16px_rgba(245,158,11,0.15)]',
    },
    {
      id: 'app-terminal',
      name: 'Terminal',
      type: 'app',
      target: 'terminal',
      icon: Terminal,
      colorClass: 'from-zinc-700/35 to-zinc-900/35 border-zinc-600/40 text-zinc-200 group-hover:border-zinc-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
    },
  ];

  // Dynamic user files & folders created inside /home/user/Desktop
  const desktopNodes = Object.values(nodes).filter(
    (n) => n.parentPath === '/home/user/Desktop'
  );

  const userItems: DesktopShortcut[] = desktopNodes.map((node) => ({
    id: `vfs-${node.path}`,
    name: node.name,
    type: node.type === 'directory' ? 'folder' : 'file',
    target: node.path,
    icon: node.type === 'directory' ? Folder : File,
    colorClass:
      node.type === 'directory'
        ? 'from-blue-600/20 to-indigo-600/15 border-blue-400/30 text-blue-300'
        : 'from-surface-panel/80 to-surface-panel/60 border-border-subtle text-content-primary',
  }));

  const allShortcuts = [...curatedApps, ...userItems];

  const handleOpen = (item: DesktopShortcut) => {
    if (item.type === 'app') {
      launchApp(item.target);
    } else if (item.type === 'file') {
      openVFSFile(item.target);
    } else if (item.type === 'folder') {
      launchApp('file-explorer', { initialPath: item.target });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: DesktopShortcut) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(item.id);

    openContextMenu(
      { x: e.clientX, y: e.clientY },
      [
        {
          type: 'item',
          item: {
            id: 'open',
            label: 'Open',
            icon: ExternalLink,
            shortcut: '↵',
            action: () => handleOpen(item),
          },
        },
        ...(item.type === 'file'
          ? [
              {
                type: 'item' as const,
                item: {
                  id: 'quick-look',
                  label: 'Quick Look Preview',
                  icon: Eye,
                  shortcut: 'Space',
                  action: () => useQuickLookStore.getState().openQuickLook(item.target),
                },
              },
              {
                type: 'item' as const,
                item: {
                  id: 'download-pc',
                  label: 'Download to PC',
                  icon: Download,
                  action: () => downloadVFSToPC(item.target),
                },
              },
            ]
          : []),
        { type: 'separator', id: 'sep-1' },
        {
          type: 'item',
          item: {
            id: 'info',
            label: `Type: ${item.type.toUpperCase()}`,
            action: () => {},
            disabled: true,
          },
        },
      ]
    );
  };

  return (
    <div
      aria-label="Desktop Grid"
      className="absolute top-12 left-6 z-[20] flex max-h-[calc(100vh-140px)] flex-col flex-wrap gap-3.5 select-none pointer-events-auto"
    >
      {allShortcuts.map((item) => {
        const IconComponent = item.icon;
        const isSelected = selectedId === item.id;

        return (
          <div
            key={item.id}
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(item.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleOpen(item);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOpen(item);
              } else if (e.key === ' ' && item.type === 'file') {
                e.preventDefault();
                useQuickLookStore.getState().openQuickLook(item.target);
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, item)}
            className={`group flex w-20 flex-col items-center gap-1.5 rounded-2xl p-2 cursor-pointer transition-all outline-none ${
              isSelected
                ? 'bg-white/15 ring-1 ring-white/30 backdrop-blur-sm'
                : 'hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-white/40'
            }`}
          >
            {/* Glassmorphic Icon Tile */}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br backdrop-blur-md transition-all duration-200 group-hover:scale-108 ${
                item.colorClass ?? 'from-surface-panel/80 to-surface-panel/50 border-border-subtle text-content-primary'
              } ${
                isSelected
                  ? 'ring-2 ring-white/50 shadow-lg scale-105'
                  : ''
              }`}
            >
              <IconComponent className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 drop-shadow-sm" />
            </div>

            {/* Typography with clean drop-shadow */}
            <span className="w-full truncate text-center font-sans text-[11px] font-medium tracking-tight text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] group-hover:text-white transition-colors">
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
