import React, { useState } from 'react';
import { useProcessStore } from '@core/process/processStore';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useContextMenuStore } from '@core/menu/contextMenuStore';
import { openVFSFile } from '@core/vfs/fileAssociations';
import {
  Settings,
  FileText,
  Terminal,
  Folder,
  File,
  Calculator,
  ExternalLink,
  Globe,
  Code2,
  Activity,
} from 'lucide-react';

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

  // Default system shortcuts + desktop files
  const shortcuts: DesktopShortcut[] = [
    {
      id: 'sc-browser',
      name: 'Browser',
      type: 'app',
      target: 'browser',
      icon: Globe,
    },
    {
      id: 'sc-explorer',
      name: 'Files',
      type: 'app',
      target: 'file-explorer',
      icon: Folder,
    },
    {
      id: 'sc-code',
      name: 'Code',
      type: 'app',
      target: 'code-editor',
      icon: Code2,
    },
    {
      id: 'sc-notes',
      name: 'Notes',
      type: 'app',
      target: 'notes',
      icon: FileText,
    },
    {
      id: 'sc-terminal',
      name: 'Terminal',
      type: 'app',
      target: 'terminal',
      icon: Terminal,
    },
    {
      id: 'sc-activity',
      name: 'Activity',
      type: 'app',
      target: 'task-manager',
      icon: Activity,
    },
    {
      id: 'sc-calculator',
      name: 'Calculator',
      type: 'app',
      target: 'calculator',
      icon: Calculator,
    },
    {
      id: 'sc-settings',
      name: 'Settings',
      type: 'app',
      target: 'system-settings',
      icon: Settings,
    },
    {
      id: 'sc-documents',
      name: 'Documents',
      type: 'folder',
      target: '/home/user/Documents',
      icon: Folder,
    },
    {
      id: 'sc-welcome',
      name: 'welcome.txt',
      type: 'file',
      target: '/home/user/welcome.txt',
      icon: File,
    },
  ];

  // Also include files created inside /home/user/Desktop
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

            <span className="w-full truncate text-center font-mono text-[11px] font-medium text-content-primary">
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
