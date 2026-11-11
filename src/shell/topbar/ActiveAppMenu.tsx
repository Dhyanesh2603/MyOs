import React, { useState, useRef, useEffect } from 'react';
import { useWindowStore } from '@core/window/windowStore';
import { appRegistry } from '@core/process/registry';
import { useProcessStore } from '@core/process/processStore';

interface MenuDropdownProps {
  label: string;
  items: Array<{ label: string; shortcut?: string; action: () => void; divider?: boolean }>;
}

const MenuDropdown: React.FC<MenuDropdownProps> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-6 rounded px-2 text-xs font-normal transition-colors ${
          isOpen
            ? 'bg-surface-subtle text-accent-primary font-medium'
            : 'text-content-secondary hover:bg-surface-subtle/50 hover:text-content-primary'
        }`}
      >
        {label}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-7 z-[9500] w-48 rounded-xl border border-border-subtle bg-surface-panel/95 p-1 text-xs text-content-primary shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              {item.divider && <div className="my-1 border-t border-border-subtle/60" />}
              <button
                onClick={() => {
                  setIsOpen(false);
                  item.action();
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-content-secondary hover:bg-accent-primary hover:text-white transition-colors"
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="font-mono text-[9px] opacity-70">{item.shortcut}</span>
                )}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export const ActiveAppMenu: React.FC = () => {
  const { windows, activeWindowId, closeWindow, toggleMaximize } = useWindowStore();
  const { launchApp } = useProcessStore();

  const activeWindow = activeWindowId ? windows[activeWindowId] : undefined;
  const manifest = activeWindow ? appRegistry.get(activeWindow.appId) : undefined;
  const appName = manifest?.name ?? 'Finder';

  return (
    <div className="flex items-center gap-1">
      {/* Active App Title (Bold) */}
      <span className="font-semibold text-content-primary px-2 text-xs">
        {appName}
      </span>

      {/* File Menu */}
      <MenuDropdown
        label="File"
        items={[
          {
            label: 'New Window',
            shortcut: '⌘N',
            action: () => {
              if (activeWindow) launchApp(activeWindow.appId);
            },
          },
          {
            label: 'Open Terminal',
            action: () => launchApp('terminal'),
          },
          {
            label: 'Open Files',
            action: () => launchApp('file-explorer'),
            divider: true,
          },
          {
            label: 'Close Window',
            shortcut: '⌘W',
            action: () => {
              if (activeWindowId) closeWindow(activeWindowId);
            },
          },
        ]}
      />

      {/* Edit Menu */}
      <MenuDropdown
        label="Edit"
        items={[
          { label: 'Undo', shortcut: '⌘Z', action: () => document.execCommand('undo') },
          { label: 'Redo', shortcut: '⇧⌘Z', action: () => document.execCommand('redo') },
          { label: 'Cut', shortcut: '⌘X', action: () => document.execCommand('cut'), divider: true },
          { label: 'Copy', shortcut: '⌘C', action: () => document.execCommand('copy') },
          { label: 'Paste', shortcut: '⌘V', action: () => document.execCommand('paste') },
          { label: 'Select All', shortcut: '⌘A', action: () => document.execCommand('selectAll'), divider: true },
        ]}
      />

      {/* Window Menu */}
      <MenuDropdown
        label="Window"
        items={[
          {
            label: 'Maximize / Restore',
            shortcut: '⌥↵',
            action: () => {
              if (activeWindowId) {
                toggleMaximize(activeWindowId, {
                  width: window.innerWidth,
                  height: window.innerHeight,
                });
              }
            },
          },
          {
            label: 'Snap Left Half',
            shortcut: '⌥[',
            action: () => {
              if (activeWindowId) {
                useWindowStore.getState().snapWindow(activeWindowId, 'left', {
                  width: window.innerWidth,
                  height: window.innerHeight,
                });
              }
            },
          },
          {
            label: 'Snap Right Half',
            shortcut: '⌥]',
            action: () => {
              if (activeWindowId) {
                useWindowStore.getState().snapWindow(activeWindowId, 'right', {
                  width: window.innerWidth,
                  height: window.innerHeight,
                });
              }
            },
          },
        ]}
      />

      {/* Help Menu */}
      <MenuDropdown
        label="Help"
        items={[
          {
            label: 'Onyx OS Documentation',
            action: () => launchApp('browser', { filePath: 'https://en.wikipedia.org/wiki/Operating_system' }),
          },
          {
            label: 'Keyboard Shortcuts',
            action: () => {
              useWindowStore.getState().setSnapPreview(null);
            },
          },
        ]}
      />
    </div>
  );
};
