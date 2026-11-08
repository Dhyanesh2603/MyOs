import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AppWindow } from 'lucide-react';
import type { AppManifest } from '@contracts/app';
import type { WindowState } from '@contracts/window';
import { soundEngine } from '@core/audio/soundEngine';
import { IosAppIcon } from '@shell/icons/IosAppIcon';

export interface DockHoverPreviewProps {
  manifest: AppManifest;
  windows: WindowState[];
  isOpen: boolean;
  onFocusWindow: (id: string) => void;
  onCloseWindow: (id: string) => void;
  onPeekWindow: (id: string | null) => void;
}

export const DockHoverPreview: React.FC<DockHoverPreviewProps> = ({
  manifest,
  windows,
  isOpen,
  onFocusWindow,
  onCloseWindow,
  onPeekWindow,
}) => {
  if (!isOpen || windows.length === 0) return null;

  const Icon = manifest.icon ?? AppWindow;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.94 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
        className="pointer-events-auto absolute bottom-14 left-1/2 -translate-x-1/2 z-[9500] flex gap-2.5 rounded-2xl border border-border-subtle bg-surface-panel/95 p-2.5 shadow-2xl backdrop-blur-2xl text-content-primary select-none"
        onMouseLeave={() => onPeekWindow(null)}
      >
        {windows.map((win) => (
          <div
            key={win.id}
            onMouseEnter={() => onPeekWindow(win.id)}
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playSnap();
              onPeekWindow(null);
              onFocusWindow(win.id);
            }}
            className="group/card relative flex w-44 flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-subtle/50 cursor-pointer hover:border-accent hover:shadow-lg transition-all"
          >
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between border-b border-border-subtle bg-surface-panel/60 px-2 py-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="h-3.5 w-3.5 shrink-0">
                  <IosAppIcon appId={manifest.id} className="h-full w-full" />
                </div>
                <span className="truncate font-mono text-[10px] font-medium text-content-primary">
                  {win.title}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playClick();
                  onPeekWindow(null);
                  onCloseWindow(win.id);
                }}
                className="rounded p-0.5 text-content-tertiary hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Close Window"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>

            {/* Scaled Visual Thumbnail Proxy */}
            <div className="flex h-24 w-full flex-col items-center justify-center bg-surface-canvas/60 p-2">
              <Icon className="h-8 w-8 text-content-tertiary/40 group-hover/card:text-accent group-hover/card:scale-110 transition-all" />
              <div className="mt-1.5 flex items-center gap-1 font-mono text-[9px] text-content-tertiary">
                <span>{win.size.width} × {win.size.height}</span>
                {win.isMinimized && (
                  <span className="rounded bg-surface-panel px-1 text-accent">
                    min
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
