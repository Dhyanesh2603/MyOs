import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { useProcessStore } from '@core/process/processStore';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useContextMenuStore } from '@core/menu/contextMenuStore';
import { openVFSFile } from '@core/vfs/fileAssociations';
import { downloadVFSToPC } from '@core/vfs/hostBridge';
import {
  File,
  ExternalLink,
  Download,
  Eye,
} from 'lucide-react';
import { useQuickLookStore } from '@core/quicklook/quickLookStore';
import { IosAppIcon, IosFilesIcon } from '@shell/icons/IosAppIcon';
import { soundEngine } from '@core/audio/soundEngine';

interface DesktopShortcut {
  id: string;
  name: string;
  type: 'app' | 'file' | 'folder';
  target: string;
  colorClass?: string;
  badge?: string;
}

interface IconPosition {
  x: number;
  y: number;
}

const STORAGE_KEY = 'flowos_desktop_icon_positions_v2';

function loadSavedPositions(): Record<string, IconPosition> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore json errors
  }
  return {};
}

function savePositionsToStorage(positions: Record<string, IconPosition>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // ignore
  }
}

interface DesktopIconItemProps {
  item: DesktopShortcut;
  initialPos: IconPosition;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpen: (item: DesktopShortcut) => void;
  onContextMenu: (e: React.MouseEvent, item: DesktopShortcut) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

const DesktopIconItem: React.FC<DesktopIconItemProps> = ({
  item,
  initialPos,
  isSelected,
  onSelect,
  onOpen,
  onContextMenu,
  onPositionChange,
}) => {
  const x = useMotionValue(initialPos.x);
  const y = useMotionValue(initialPos.y);
  const isDraggingRef = useRef(false);

  // Sync motion values if initial position changes from reset or layout
  useEffect(() => {
    x.set(initialPos.x);
    y.set(initialPos.y);
  }, [initialPos.x, initialPos.y, x, y]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      style={{
        x,
        y,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={() => {
        const curX = Math.round(x.get());
        const curY = Math.round(y.get());
        onPositionChange(item.id, curX, curY);
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 120);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isDraggingRef.current) return;
        soundEngine.playClick();
        onSelect(item.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (isDraggingRef.current) return;
        onOpen(item);
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        onContextMenu(e, item);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onOpen(item);
        } else if (e.key === ' ' && item.type === 'file') {
          e.preventDefault();
          useQuickLookStore.getState().openQuickLook(item.target);
        }
      }}
      tabIndex={0}
      className={`group flex w-22 flex-col items-center gap-1.5 rounded-2xl p-2 cursor-grab active:cursor-grabbing transition-colors outline-none pointer-events-auto select-none ${
        isSelected
          ? 'bg-white/20 ring-1 ring-white/40 backdrop-blur-md'
          : 'hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-white/40'
      }`}
    >
      {/* Authentic iOS Squircle Icon */}
      <div
        className={`relative flex h-14 w-14 items-center justify-center transition-transform duration-150 group-hover:scale-108 ${
          isSelected ? 'ring-2 ring-white/80 rounded-[22.5%] scale-105' : ''
        }`}
      >
        {item.type === 'app' ? (
          <IosAppIcon appId={item.target} className="h-full w-full" />
        ) : item.type === 'folder' ? (
          <IosFilesIcon className="h-full w-full" />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center rounded-[22.5%] border border-white/20 bg-gradient-to-b from-slate-700 to-slate-900 shadow-md">
            <File className="h-7 w-7 text-white" />
          </div>
        )}
      </div>

      {/* Item Name Label */}
      <span className="w-full truncate text-center font-sans text-[11px] font-semibold tracking-tight text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] group-hover:text-cyan-200 transition-colors px-1">
        {item.name}
      </span>
    </motion.div>
  );
};

export const DesktopIcons: React.FC = () => {
  const { launchApp } = useProcessStore();
  const { nodes } = useVFSStore();
  const openContextMenu = useContextMenuStore((state) => state.openMenu);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, IconPosition>>(loadSavedPositions);

  // Curated clean apps on the desktop (Flow OS item completely removed)
  const curatedApps: DesktopShortcut[] = [
    {
      id: 'app-files',
      name: 'Files',
      type: 'app',
      target: 'file-explorer',
    },
    {
      id: 'app-browser',
      name: 'Browser',
      type: 'app',
      target: 'browser',
    },
    {
      id: 'app-code',
      name: 'Code',
      type: 'app',
      target: 'code-editor',
    },
    {
      id: 'app-notes',
      name: 'Notes',
      type: 'app',
      target: 'notes',
    },
    {
      id: 'app-terminal',
      name: 'Terminal',
      type: 'app',
      target: 'terminal',
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
  }));

  const allShortcuts = [...curatedApps, ...userItems];

  const handlePositionChange = useCallback((id: string, x: number, y: number) => {
    setPositions((prev) => {
      const next = { ...prev, [id]: { x, y } };
      savePositionsToStorage(next);
      return next;
    });
  }, []);

  const handleOpen = (item: DesktopShortcut) => {
    soundEngine.playClick();
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
    soundEngine.playClick();
    setSelectedId(item.id);

    openContextMenu({ x: e.clientX, y: e.clientY }, [
      {
        type: 'item',
        item: {
          id: 'open',
          label: item.type === 'app' ? 'Launch Application' : 'Open',
          action: () => handleOpen(item),
          icon: item.type === 'app' ? ExternalLink : Eye,
        },
      },
      ...(item.type === 'file'
        ? [
            {
              type: 'item' as const,
              item: {
                id: 'quicklook',
                label: 'Quick Look (Space)',
                action: () => useQuickLookStore.getState().openQuickLook(item.target),
                icon: Eye,
              },
            },
            {
              type: 'item' as const,
              item: {
                id: 'download-pc',
                label: 'Download to Physical PC',
                action: () => downloadVFSToPC(item.target),
                icon: Download,
              },
            },
          ]
        : []),
      { type: 'separator', id: 'sep-1' },
      {
        type: 'item',
        item: {
          id: 'info',
          label: `${item.name} (${item.type.toUpperCase()})`,
          action: () => {},
          disabled: true,
        },
      },
    ]);
  };

  return (
    <div
      aria-label="Desktop Surface Icons"
      onClick={() => setSelectedId(null)}
      className="fixed inset-0 z-[20] pointer-events-none select-none overflow-hidden"
    >
      {allShortcuts.map((item, index) => {
        // Calculate default grid position if not yet dragged:
        // Column 0 starts at x: 28, y: 56, spacing 100px vertically
        const col = Math.floor(index / 6);
        const row = index % 6;
        const defaultX = 28 + col * 96;
        const defaultY = 56 + row * 100;

        const initialPos = positions[item.id] || { x: defaultX, y: defaultY };
        const isSelected = selectedId === item.id;

        return (
          <DesktopIconItem
            key={item.id}
            item={item}
            initialPos={initialPos}
            isSelected={isSelected}
            onSelect={setSelectedId}
            onOpen={handleOpen}
            onContextMenu={handleContextMenu}
            onPositionChange={handlePositionChange}
          />
        );
      })}
    </div>
  );
};
