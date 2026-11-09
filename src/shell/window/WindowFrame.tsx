import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ResizeDirection, WindowState } from '@contracts/window';
import { useWindowStore } from '@core/window/windowStore';
import { useWorkspaceStore } from '@core/workspace/workspaceStore';
import { useStageManagerStore } from '@core/stage/stageManagerStore';
import { appRegistry } from '@core/process/registry';
import { WindowHeader } from './WindowHeader';
import { ResizeHandle } from './ResizeHandle';
import { ErrorBoundary } from '@core/errors/ErrorBoundary';

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
  const { focusWindow, getZIndex, peekWindowId, activeWindowId } = useWindowStore();
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const isMissionControlOpen = useWorkspaceStore((state) => state.isMissionControlOpen);
  const isStageManagerEnabled = useStageManagerStore((s) => s.isEnabled);

  const zIndex = getZIndex(windowState.id);
  const manifest = appRegistry.get(windowState.appId);
  const AppComponent = manifest?.component;

  // Workspace visibility filter: hide if not in active workspace unless Mission Control is open
  const isCurrentWorkspace = (windowState.workspaceId ?? 1) === activeWorkspaceId;
  if (!isCurrentWorkspace && !isMissionControlOpen) {
    return null;
  }

  // Stage Manager: tuck non-active windows into left stage strip
  if (
    isStageManagerEnabled &&
    activeWindowId &&
    windowState.id !== activeWindowId &&
    !isMissionControlOpen
  ) {
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
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{
          duration: 0.16,
          ease: [0.16, 1, 0.3, 1],
        }}
        onPointerDown={() => {
          if (!windowState.isFocused) {
            focusWindow(windowState.id);
          }
        }}
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
        }}
        className={`group flex flex-col overflow-hidden ${
          windowState.isMaximized ? 'rounded-none border-0' : 'rounded-[14px] border border-white/[0.14]'
        } ${isInteracting ? 'transition-none shadow-xl' : 'transition-shadow duration-150'} ${
          windowState.isMaximized
            ? 'shadow-none'
            : windowState.isFocused
            ? 'shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.12)_inset]'
            : 'shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.06)_inset] opacity-[0.98]'
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
            <ErrorBoundary fallbackTitle={`${manifest?.name || 'Application'} Error`}>
              <AppComponent
                windowId={windowState.id}
                processId={windowState.processId}
                initialData={windowState.customState?.initialData}
              />
            </ErrorBoundary>
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
