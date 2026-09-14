import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ResizeDirection, WindowState } from '@contracts/window';
import { useWindowStore } from '@core/window/windowStore';
import { appRegistry } from '@core/process/registry';
import { WindowHeader } from './WindowHeader';
import { ResizeHandle } from './ResizeHandle';

export interface WindowFrameProps {
  windowState: WindowState;
}

const RESIZE_DIRECTIONS: ResizeDirection[] = [
  'n',
  's',
  'e',
  'w',
  'ne',
  'nw',
  'se',
  'sw',
];

export const WindowFrame: React.FC<WindowFrameProps> = ({ windowState }) => {
  const { focusWindow, getZIndex } = useWindowStore();
  const zIndex = getZIndex(windowState.id);

  const manifest = appRegistry.get(windowState.appId);
  const AppComponent = manifest?.component;

  if (windowState.isMinimized) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key={windowState.id}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 28,
        }}
        onPointerDown={() => focusWindow(windowState.id)}
        style={{
          position: 'absolute',
          left: `${windowState.position.x}px`,
          top: `${windowState.position.y}px`,
          width: `${windowState.size.width}px`,
          height: `${windowState.size.height}px`,
          zIndex,
        }}
        className={`group flex flex-col overflow-hidden rounded-window border transition-colors duration-150 ${
          windowState.isFocused
            ? 'border-accent-primary/50 shadow-window ring-1 ring-accent-primary/20'
            : 'border-white/10 shadow-lg opacity-[0.96]'
        } ${windowState.isDragging ? 'select-none pointer-events-auto' : ''}`}
      >
        {/* 8-Axis Resize Frame */}
        {RESIZE_DIRECTIONS.map((dir) => (
          <ResizeHandle
            key={dir}
            direction={dir}
            windowState={windowState}
          />
        ))}

        {/* Window Command Rail / Titlebar */}
        <WindowHeader windowState={windowState} />

        {/* Application Content Viewport */}
        <div className="relative flex-1 overflow-auto bg-surface-panel/95 backdrop-blur-window">
          {AppComponent ? (
            <AppComponent
              windowId={windowState.id}
              processId={windowState.processId}
              initialData={windowState.customState?.initialData}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-center text-xs text-content-secondary">
              Application component &apos;{windowState.appId}&apos; could not be resolved.
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
