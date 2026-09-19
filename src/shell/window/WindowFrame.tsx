import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ResizeDirection, WindowState } from '@contracts/window';
import { useWindowStore } from '@core/window/windowStore';
import { useWorkspaceStore } from '@core/workspace/workspaceStore';
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

export const WindowFrame: React.FC<WindowFrameProps> = React.memo(({ windowState }) => {
  const { focusWindow, getZIndex, peekWindowId } = useWindowStore();
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const isMissionControlOpen = useWorkspaceStore((state) => state.isMissionControlOpen);

  const zIndex = getZIndex(windowState.id);
  const manifest = appRegistry.get(windowState.appId);
  const AppComponent = manifest?.component;

  // Workspace visibility filter: hide if not in active workspace unless Mission Control is open
  const isCurrentWorkspace = (windowState.workspaceId ?? 1) === activeWorkspaceId;
  if (!isCurrentWorkspace && !isMissionControlOpen) {
    return null;
  }

  if (windowState.isMinimized) {
    return null;
  }

  const isInteracting = windowState.isDragging || windowState.isResizing;
  const isGhosted = peekWindowId !== null && peekWindowId !== windowState.id;
  const isPeekTarget = peekWindowId === windowState.id;

  return (
    <AnimatePresence>
      <motion.div
        key={windowState.id}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{
          scale: { type: 'spring', stiffness: 400, damping: 30 },
          opacity: { duration: 0.15 },
        }}
        onPointerDown={() => focusWindow(windowState.id)}
        style={{
          position: 'absolute',
          left: `${windowState.position.x}px`,
          top: `${windowState.position.y}px`,
          width: `${windowState.size.width}px`,
          height: `${windowState.size.height}px`,
          zIndex: isPeekTarget ? 9999 : zIndex,
          opacity: isGhosted ? 0.15 : 1,
          pointerEvents: isGhosted ? 'none' : 'auto',
          filter: isGhosted ? 'blur(1px)' : 'none',
          willChange: isInteracting ? 'left, top, width, height' : 'auto',
          transition: 'opacity 0.2s ease, filter 0.2s ease',
        }}
        className={`group flex flex-col overflow-hidden rounded-window border transition-colors duration-150 ${
          isPeekTarget
            ? 'border-accent shadow-[0_0_30px_rgba(var(--accent-rgb),0.5)] ring-2 ring-accent'
            : windowState.isFocused
            ? 'border-border-strong shadow-window'
            : 'border-border-subtle shadow-lg opacity-[0.99]'
        } ${isInteracting ? 'select-none pointer-events-auto' : ''}`}
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

        {/* Application Content Viewport (Disable pointer events during drag/resize for 120 FPS performance) */}
        <div
          className={`relative flex-1 overflow-auto bg-surface-panel/95 backdrop-blur-window text-content-primary ${
            isInteracting ? 'pointer-events-none select-none' : ''
          }`}
        >
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
});

WindowFrame.displayName = 'WindowFrame';
