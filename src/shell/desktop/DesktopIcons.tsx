import React, { useRef, useEffect } from 'react';
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
  Trash2,
} from 'lucide-react';
import { useQuickLookStore } from '@core/quicklook/quickLookStore';
import { IosAppIcon, IosFilesIcon } from '@shell/icons/IosAppIcon';
import { soundEngine } from '@core/audio/soundEngine';
import { useNotificationStore } from '@core/notifications/notificationStore';
import {
  useDesktopStore,
  DesktopShortcut,
  IconPosition,
  ORIGIN_X,
  ORIGIN_Y,
  GRID_WIDTH,
  GRID_HEIGHT,
} from '@core/desktop/desktopStore';

interface DesktopIconItemProps {
  item: DesktopShortcut;
  pos: IconPosition;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpen: (item: DesktopShortcut) => void;
  onContextMenu: (e: React.MouseEvent, item: DesktopShortcut) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
}

const DesktopIconItem: React.FC<DesktopIconItemProps> = ({
  item,
  pos,
  isSelected,
  onSelect,
  onOpen,
  onContextMenu,
  onPositionChange,
}) => {
  const x = useMotionValue(pos.x);
  const y = useMotionValue(pos.y);
  const isDraggingRef = useRef(false);

  // Synchronize motion values if pos changes externally (e.g., auto-arrange grid)
  useEffect(() => {
    x.set(pos.x);
    y.set(pos.y);
  }, [pos.x, pos.y, x, y]);

  return (
    <motion.div
      data-desktop-icon="true"
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
      {/* Authentic Adaptive Icon */}
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
  const { nodes, deleteNode } = useVFSStore();
  const openContextMenu = useContextMenuStore((state) => state.openMenu);

  const selectedId = useDesktopStore((state) => state.selectedIconId);
  const setSelectedId = useDesktopStore((state) => state.setSelectedIconId);
  const positions = useDesktopStore((state) => state.positions);
  const shortcuts = useDesktopStore((state) => state.shortcuts);
  const updatePosition = useDesktopStore((state) => state.updatePosition);
  const removeAppShortcut = useDesktopStore((state) => state.removeAppShortcut);

  // Global listener: clicking anywhere outside desktop icons deselects current icon
  useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-desktop-icon]') || target.closest('[data-context-menu]')) {
        return;
      }
      setSelectedId(null);
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown, true);
    return () => window.removeEventListener('pointerdown', handleGlobalPointerDown, true);
  }, [setSelectedId]);

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

  const allShortcuts = [...shortcuts, ...userItems];

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
      { type: 'separator', id: 'sep-action' },
      ...(item.type === 'app'
        ? [
            {
              type: 'item' as const,
              item: {
                id: 'remove-shortcut',
                label: 'Remove from Homescreen',
                action: () => {
                  removeAppShortcut(item.id);
                  soundEngine.playClick();
                  useNotificationStore.getState().notify({
                    title: 'Removed from Homescreen',
                    message: `${item.name} removed from your desktop.`,
                    type: 'info',
                  });
                },
                icon: Trash2,
                danger: true,
              },
            },
          ]
        : [
            {
              type: 'item' as const,
              item: {
                id: 'delete-vfs-item',
                label: item.type === 'folder' ? 'Delete Folder' : 'Delete File',
                action: async () => {
                  await deleteNode(item.target);
                  soundEngine.playClick();
                  useNotificationStore.getState().notify({
                    title: item.type === 'folder' ? 'Folder Deleted' : 'File Deleted',
                    message: `${item.name} permanently deleted from Desktop.`,
                    type: 'info',
                  });
                },
                icon: Trash2,
                danger: true,
              },
            },
          ]),
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
      className="fixed inset-0 z-[20] pointer-events-none select-none overflow-hidden"
    >
      {allShortcuts.map((item, index) => {
        // Calculate default grid position if not yet placed
        const maxRows = typeof window !== 'undefined'
          ? Math.max(3, Math.floor((window.innerHeight - ORIGIN_Y - 120) / GRID_HEIGHT))
          : 6;
        const col = Math.floor(index / maxRows);
        const row = index % maxRows;
        const defaultX = ORIGIN_X + col * GRID_WIDTH;
        const defaultY = ORIGIN_Y + row * GRID_HEIGHT;

        const pos = positions[item.id] || { x: defaultX, y: defaultY };
        const isSelected = selectedId === item.id;

        return (
          <DesktopIconItem
            key={item.id}
            item={item}
            pos={pos}
            isSelected={isSelected}
            onSelect={setSelectedId}
            onOpen={handleOpen}
            onContextMenu={handleContextMenu}
            onPositionChange={updatePosition}
          />
        );
      })}
    </div>
  );
};
