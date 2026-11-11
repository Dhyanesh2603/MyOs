import React, { useState, useRef, useEffect } from 'react';
import { useProcessStore } from '@core/process/processStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import {
  Settings,
  Lock,
  RotateCw,
  Activity,
  Info,
  DownloadCloud,
  UploadCloud,
  Monitor,
} from 'lucide-react';
import { exportSystemImage, restoreSystemImage } from '@core/system/backupEngine';
import { useScreenSaverStore } from '@shell/desktop/screensaver/screenSaverStore';

export const FlowMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { launchApp } = useProcessStore();
  const { notify } = useNotificationStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAbout = () => {
    setIsOpen(false);
    notify({
      title: 'About FlowOS',
      message: 'FlowOS v0.2.0 (Flagship Edition) • Kernel v2.4.0 • Linear/Obsidian Design Core',
      type: 'info',
    });
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-6 items-center gap-1.5 rounded px-2 text-xs font-semibold tracking-tight transition-colors ${
          isOpen
            ? 'bg-surface-subtle text-accent-primary'
            : 'text-content-primary hover:bg-surface-subtle/60'
        }`}
      >
        <span>FlowOS</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-7 z-[9500] w-56 rounded-xl border border-border-subtle bg-surface-panel/95 p-1 text-xs text-content-primary shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <button
            onClick={handleAbout}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-content-secondary hover:bg-accent-primary hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              <span>About Onyx OS</span>
            </div>
            <span className="font-mono text-[9px] opacity-70">v0.2</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              launchApp('system-settings');
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-content-secondary hover:bg-accent-primary hover:text-white transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>System Settings...</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              launchApp('task-manager');
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-content-secondary hover:bg-accent-primary hover:text-white transition-colors"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Activity Monitor</span>
          </button>

          <div className="my-1 border-t border-border-subtle/60" />

          {/* Screensaver */}
          <button
            onClick={() => {
              setIsOpen(false);
              useScreenSaverStore.getState().activate();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-content-secondary hover:bg-accent-primary hover:text-white transition-colors"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>Start Screensaver</span>
          </button>

          {/* Export System Image */}
          <button
            onClick={() => {
              setIsOpen(false);
              exportSystemImage();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-content-secondary hover:bg-accent-primary hover:text-white transition-colors"
          >
            <DownloadCloud className="h-3.5 w-3.5" />
            <span>Export System Image (.onyx)</span>
          </button>

          {/* Restore System Image */}
          <button
            onClick={() => {
              setIsOpen(false);
              fileInputRef.current?.click();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-content-secondary hover:bg-accent-primary hover:text-white transition-colors"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Restore System Image...</span>
          </button>

          <div className="my-1 border-t border-border-subtle/60" />

          <button
            onClick={() => {
              setIsOpen(false);
              window.dispatchEvent(new CustomEvent('flowos:lock'));
            }}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-content-secondary hover:bg-accent-primary hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              <span>Lock Screen</span>
            </div>
            <span className="font-mono text-[9px] opacity-70">⌃⌥L</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              window.location.reload();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-content-secondary hover:bg-accent-primary hover:text-white transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Restart Onyx OS...</span>
          </button>
        </div>
      )}

      {/* Hidden File Input for .flowos Restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".onyx,.flowos,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            restoreSystemImage(file);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
};
