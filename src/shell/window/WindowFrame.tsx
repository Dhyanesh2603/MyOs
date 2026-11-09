import React from 'react';
import { motion } from 'motion/react';
import type { ResizeDirection, WindowState } from '@contracts/window';
import { useWindowStore } from '@core/window/windowStore';
import { useWorkspaceStore } from '@core/workspace/workspaceStore';
import { useStageManagerStore } from '@core/stage/stageManagerStore';
import { appRegistry } from '@core/process/registry';
import { useThemeStore } from '@core/theme/themeStore';
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

interface WindowContentProps {
  appId: string;
  windowId: string;
  processId: string;
  initialData?: unknown;
  isInteracting: boolean;
  windowMaterial: string;
}

// Memoized Window Content: Never re-renders the underlying application (Monaco, Browser iframe, etc.)
// during window dragging or resizing. Guarantees 120 FPS performance.
const WindowContent = React.memo<WindowContentProps>(
  ({ appId, windowId, processId, initialData, isInteracting, windowMaterial }) => {
    const manifest = appRegistry.get(appId);
    const AppComponent = manifest?.component;

    const bgClass =
      windowMaterial === 'solid'
        ? 'bg-surface-panel'
        : windowMaterial === 'translucent'
        ? 'bg-surface-panel/80 backdrop-blur-xl'
        : 'bg-surface-panel/65 backdrop-blur-2xl';

    return (
      <div
        className={`relative flex-1 overflow-auto ${bgClass} text-content-primary ${
          isInteracting ? 'pointer-events-none select-none' : ''
        }`}
      >
        {AppComponent ? (
          <ErrorBoundary fallbackTitle={`${manifest?.name || 'Application'} Error`}>
            <AppComponent
              windowId={windowId}
              processId={processId}
              initialData={initialData}
            />
          </ErrorBoundary>
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6 text-center text-xs text-content-secondary">
            Application component &apos;{appId}&apos; could not be resolved.
          </div>
        )}
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.appId === next.appId &&
      prev.windowId === next.windowId &&
      prev.processId === next.processId &&
      prev.initialData === next.initialData &&
      prev.isInteracting === next.isInteracting &&
      prev.windowMaterial === next.windowMaterial
    );
  }
);

WindowContent.displayName = 'WindowContent';

export const WindowFrame: React.FC<WindowFrameProps> = React.memo(({ windowState }) => {
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const peekWindowId = useWindowStore((s) => s.peekWindowId);
  const activeWindowId = useWindowStore((s) => s.activeWindowId);

  const windowMaterial = useThemeStore((s) => s.windowMaterial ?? 'glass');
  const windowOpacity = useThemeStore((s) => s.windowOpacity ?? 0.95);

  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const isMissionControlOpen = useWorkspaceStore((state) => state.isMissionControlOpen);
  const isStageManagerEnabled = useStageManagerStore((s) => s.isEnabled);

  const zIndex = windowState.zIndex ?? 100;

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

  const materialClasses =
    windowMaterial === 'solid'
      ? 'bg-[#090a0f] border-white/[0.10]'
      : windowMaterial === 'translucent'
      ? 'bg-[#0e1017]/85 backdrop-blur-xl border-white/[0.14]'
      : 'bg-black/60 backdrop-blur-3xl border-white/[0.18]';

  return (
    <motion.div
      key={windowState.id}
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.98, opacity: 0 }}
      transition={{
        opacity: { duration: 0.12, ease: 'easeOut' },
        scale: { duration: 0.12, ease: [0.16, 1, 0.3, 1] },
        default: { duration: 0 },
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
        opacity: isGhosted ? 0.15 : windowOpacity,
        pointerEvents: isGhosted ? 'none' : 'auto',
        filter: isGhosted ? 'blur(1px)' : 'none',
        willChange: isInteracting ? 'left, top, width, height' : 'auto',
      }}
      className={`group flex flex-col overflow-hidden ${
        windowState.isMaximized ? 'rounded-none border-0' : `rounded-[14px] border ${materialClasses}`
      } ${isInteracting ? 'transition-none shadow-xl' : 'transition-shadow duration-150'} ${
        windowState.isMaximized
          ? 'shadow-none'
          : windowState.isFocused
          ? 'shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.12)_inset]'
          : 'shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)_inset]'
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

      {/* Memoized Application Content Viewport (Isolated from Drag & Resize updates) */}
      <WindowContent
        appId={windowState.appId}
        windowId={windowState.id}
        processId={windowState.processId}
        initialData={windowState.customState?.initialData}
        isInteracting={isInteracting}
        windowMaterial={windowMaterial}
      />
    </motion.div>
  );
});

WindowFrame.displayName = 'WindowFrame';
