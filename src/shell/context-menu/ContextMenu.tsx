import React, { useEffect, useRef } from 'react';
import { useContextMenuStore } from '@core/menu/contextMenuStore';

export const ContextMenu: React.FC = () => {
  const { isOpen, position, entries, closeMenu } = useContextMenuStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  if (!isOpen || entries.length === 0) {
    return null;
  }

  // Viewport boundary collision avoidance
  const ESTIMATED_WIDTH = 220;
  const ESTIMATED_HEIGHT = entries.length * 36 + 16;

  const adjustedX =
    position.x + ESTIMATED_WIDTH > window.innerWidth - 12
      ? Math.max(12, position.x - ESTIMATED_WIDTH)
      : position.x;

  const adjustedY =
    position.y + ESTIMATED_HEIGHT > window.innerHeight - 12
      ? Math.max(12, position.y - ESTIMATED_HEIGHT)
      : position.y;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Context Menu"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
      }}
      className="fixed z-[9999] min-w-[210px] select-none rounded-xl border border-border-subtle bg-surface-panel/95 p-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
    >
      {entries.map((entry) => {
        if (entry.type === 'separator') {
          return (
            <div
              key={entry.id}
              role="separator"
              className="my-1 h-[1px] bg-border-subtle"
            />
          );
        }

        const { item } = entry;
        const IconComponent = item.icon;

        return (
          <button
            key={item.id}
            role="menuitem"
            disabled={item.disabled}
            onClick={(e) => {
              e.stopPropagation();
              item.action();
              closeMenu();
            }}
            className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
              item.disabled
                ? 'cursor-not-allowed opacity-40'
                : item.danger
                  ? 'text-rose-400 hover:bg-rose-500/20'
                  : 'text-content-primary hover:bg-surface-subtle'
            }`}
          >
            <div className="flex items-center gap-2">
              {IconComponent && (
                <IconComponent className="h-3.5 w-3.5 opacity-70" />
              )}
              <span>{item.label}</span>
            </div>

            {item.shortcut && (
              <span className="font-mono text-[10px] text-content-tertiary">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
