import React from 'react';
import { useWindowStore } from '@core/window/windowStore';
import { DEFAULT_INSETS } from '@core/window/geometry';

export const SnapPreviewOverlay: React.FC = () => {
  const snapPreview = useWindowStore((state) => state.snapPreview);

  if (!snapPreview) return null;

  const insets = DEFAULT_INSETS;
  const availWidth = window.innerWidth - insets.left - insets.right;
  const availHeight = window.innerHeight - insets.top - insets.bottom;
  const halfWidth = Math.floor(availWidth / 2);

  let style: React.CSSProperties = {};

  if (snapPreview === 'maximize') {
    style = {
      left: insets.left,
      top: insets.top,
      width: availWidth,
      height: availHeight,
    };
  } else if (snapPreview === 'left') {
    style = {
      left: insets.left,
      top: insets.top,
      width: halfWidth,
      height: availHeight,
    };
  } else if (snapPreview === 'right') {
    style = {
      left: insets.left + halfWidth,
      top: insets.top,
      width: availWidth - halfWidth,
      height: availHeight,
    };
  }

  return (
    <div
      style={style}
      className="pointer-events-none fixed z-[8500] rounded-xl border-2 border-accent-primary/60 bg-accent-primary/10 backdrop-blur-sm shadow-[0_0_30px_rgba(var(--accent-primary),0.15)] transition-all duration-150 animate-in fade-in"
    >
      <div className="flex h-full w-full items-center justify-center">
        <span className="rounded-full border border-accent-primary/30 bg-surface-panel/80 px-3 py-1 font-mono text-[11px] font-medium text-accent-hover shadow-sm">
          Snap to {snapPreview === 'maximize' ? 'Maximize' : `${snapPreview.toUpperCase()} Half`}
        </span>
      </div>
    </div>
  );
};
