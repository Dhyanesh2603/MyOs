import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
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
  snapToGrid,
  ORIGIN_X,
  ORIGIN_Y,
  GRID_WIDTH,
  GRID_HEIGHT,
  getMaxRows,
} from '@core/desktop/desktopStore';

interface DesktopIconItemProps {
  item: DesktopShortcut;
  pos: IconPosition;
  isDragging: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpen: (item: DesktopShortcut) => void;
  onContextMenu: (e: React.MouseEvent, item: DesktopShortcut) => void;
  onDragStart: (id: string, initialPos: IconPosition) => void;
  onDragMove: (id: string, currentX: number, currentY: number) => void;
  onDragEnd: (id: string, finalX: number, finalY: number) => void;
}

const DesktopIconItem: React.FC<DesktopIconItemProps> = ({
  item,
  pos,
  isDragging,
  isSelected,
  onSelect,
  onOpen,
  onContextMenu,
  onDragStart,
  onDragMove,
  onDragEnd,
}) => {
  const dragOffsetRef = useRef({ x: 46, y: 48 });
  const hasDraggedRef = useRef(false);

  return (
    <motion.div
      data-desktop-icon="true"
      drag
      dragMomentum={false}
      dragElastic={0.06}
      animate={isDragging ? undefined : { x: pos.x, y: pos.y }}
      transition={{ type: 'spring', damping: 28, stiffness: 380, mass: 0.8 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: isDragging ? 100 : isSelected ? 30 : 10,
      }}
      onDragStart={(e, info) => {
        hasDraggedRef.current = true;
        const targetRect = (e.target as HTMLElement)
          .closest('[data-desktop-icon]')
          ?.getBoundingClientRect();
        if (targetRect) {
          dragOffsetRef.current = {
            x: info.point.x - targetRect.left,
            y: info.point.y - targetRect.top,
          };
        }
        onDragStart(item.id, pos);
      }}
      onDrag={(_, info) => {
        const currentIconX = info.point.x - dragOffsetRef.current.x;
        const currentIconY = info.point.y - dragOffsetRef.current.y;
        onDragMove(item.id, currentIconX, currentIconY);
      }}
      onDragEnd={(_, info) => {
        const finalIconX = info.point.x - dragOffsetRef.current.x;
        const finalIconY = info.point.y - dragOffsetRef.current.y;
        onDragEnd(item.id, finalIconX, finalIconY);
        setTimeout(() => {
          hasDraggedRef.current = false;
        }, 120);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (hasDraggedRef.current) return;
        soundEngine.playClick();
        onSelect(item.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (hasDraggedRef.current) return;
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
      className={`group flex w-[92px] flex-col items-center gap-1.5 rounded-2xl p-2 cursor-grab active:cursor-grabbing transition-colors outline-none pointer-events-auto select-none ${
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
  const storedPositions = useDesktopStore((state) => state.positions);
  const shortcuts = useDesktopStore((state) => state.shortcuts);
  const setAllPositions = useDesktopStore((state) => state.setAllPositions);
  const removeAppShortcut = useDesktopStore((state) => state.removeAppShortcut);

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

  // Live preview positions for smooth spring rearrangement during drag
  const [livePositions, setLivePositions] = useState<Record<string, IconPosition>>(storedPositions);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOriginPosRef = useRef<IconPosition>({ x: 0, y: 0 });
  const lastHoverTargetRef = useRef<string | null>(null);

  // Keep livePositions in sync with storedPositions when not actively dragging
  useEffect(() => {
    if (!draggingId) {
      setLivePositions(storedPositions);
    }
  }, [storedPositions, draggingId]);

  // Global listener: clicking anywhere outside desktop icons deselects current icon
  useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest('[data-desktop-icon]') ||
        target.closest('[data-context-menu]')
      ) {
        return;
      }
      setSelectedId(null);
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown);
    return () => window.removeEventListener('pointerdown', handleGlobalPointerDown, true);
  }, [setSelectedId]);

  const handleDragStart = (id: string, initialPos: IconPosition) => {
    setDraggingId(id);
    dragOriginPosRef.current = { ...initialPos };
    lastHoverTargetRef.current = null;
    setLivePositions({ ...storedPositions });
  };

  const handleDragMove = (id: string, currentX: number, currentY: number) => {
    const targetSlot = snapToGrid(currentX, currentY);
    const targetKey = `${targetSlot.x},${targetSlot.y}`;

    if (lastHoverTargetRef.current === targetKey) return;

    // Find if another shortcut currently occupies this slot
    const other = allShortcuts.find((s) => {
      if (s.id === id) return false;
      const p = livePositions[s.id] || storedPositions[s.id];
      return p && p.x === targetSlot.x && p.y === targetSlot.y;
    });

    if (other) {
      lastHoverTargetRef.current = targetKey;
      soundEngine.playSnap();

      // Rearrange / swap: The other icon glides to the slot vacated by the dragged icon
      const vacatedPos = { ...dragOriginPosRef.current };
      dragOriginPosRef.current = { ...targetSlot };

      setLivePositions((prev) => ({
        ...prev,
        [other.id]: vacatedPos,
        [id]: targetSlot,
      }));
    }
  };

  const handleDragEnd = (id: string, finalX: number, finalY: number) => {
    const targetSlot = snapToGrid(finalX, finalY);

    setLivePositions((prev) => {
      const next = { ...prev };

      // Ensure no collision in final positions
      const conflicting = Object.keys(next).find(
        (key) => key !== id && next[key]?.x === targetSlot.x && next[key]?.y === targetSlot.y
      );

      if (conflicting) {
        next[conflicting] = { ...dragOriginPosRef.current };
      }
      next[id] = targetSlot;

      // Commit to desktop store and persist to localStorage
      setAllPositions(next);
      return next;
    });

    soundEngine.playSnap();
    setDraggingId(null);
    lastHoverTargetRef.current = null;
  };

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

  const maxRows = getMaxRows();

  return (
    <div
      aria-label="Desktop Surface Icons"
      className="fixed inset-0 z-[20] pointer-events-none select-none overflow-hidden"
    >
      {allShortcuts.map((item, index) => {
        const col = Math.floor(index / maxRows);
        const row = index % maxRows;
        const defaultX = ORIGIN_X + col * GRID_WIDTH;
        const defaultY = ORIGIN_Y + row * GRID_HEIGHT;

        const pos =
          livePositions[item.id] ||
          storedPositions[item.id] || { x: defaultX, y: defaultY };
        const isSelected = selectedId === item.id;
        const isDragging = draggingId === item.id;

        return (
          <DesktopIconItem
            key={item.id}
            item={item}
            pos={pos}
            isDragging={isDragging}
            isSelected={isSelected}
            onSelect={setSelectedId}
            onOpen={handleOpen}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          />
        );
      })}
    </div>
  );
};
