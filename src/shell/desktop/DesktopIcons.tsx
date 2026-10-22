import React, { useState } from 'react';
import { useProcessStore } from '@core/process/processStore';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useContextMenuStore } from '@core/menu/contextMenuStore';
import { openVFSFile } from '@core/vfs/fileAssociations';
import { downloadVFSToPC } from '@core/vfs/hostBridge';
import {
  Folder,
  File,
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
}

export const DesktopIcons: React.FC = () => {
  const { launchApp } = useProcessStore();
  const { nodes } = useVFSStore();
  const openContextMenu = useContextMenuStore((state) => state.openMenu);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Clean macOS desktop: Only show genuine files and folders in /home/user/Desktop
  // No hardcoded app shortcuts cluttering the wallpaper
  const shortcuts: DesktopShortcut[] = [];

  const desktopNodes = Object.values(nodes).filter(
    (n) => n.parentPath === '/home/user/Desktop'
  );

  desktopNodes.forEach((node) => {
    shortcuts.push({
      id: `vfs-${node.path}`,
      name: node.name,
      type: node.type === 'directory' ? 'folder' : 'file',
      target: node.path,
      icon: node.type === 'directory' ? Folder : File,
    });
  });

  // If desktop folder has no files, keep the homepage canvas 100% pristine and clean
  if (shortcuts.length === 0) {
    return null;
  }

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
      className="absolute top-12 left-8 z-[20] flex max-h-[85vh] flex-col flex-wrap gap-4 select-none pointer-events-auto"
    >
      {shortcuts.map((item) => {
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
            className={`group flex w-20 flex-col items-center gap-1.5 rounded-xl p-2 cursor-pointer transition-all outline-none ${
              isSelected
                ? 'bg-accent-primary/20 ring-1 ring-accent-primary/50 shadow-sm'
                : 'hover:bg-surface-subtle/40 focus-visible:ring-1 focus-visible:ring-accent-primary/50'
            }`}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle shadow-md backdrop-blur-md transition-transform group-hover:scale-105 ${
                isSelected
                  ? 'bg-accent-primary text-white'
                  : 'bg-surface-panel/70 text-content-primary'
              }`}
            >
              <IconComponent className="h-5 w-5" />
            </div>

            <span className="w-full truncate text-center font-mono text-[11px] font-medium text-content-primary drop-shadow-sm">
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
