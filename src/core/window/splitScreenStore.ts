import { create } from 'zustand';
import type { WindowId } from '@contracts/window';
import { useWindowStore } from './windowStore';
import { useWorkspaceStore } from '@core/workspace/workspaceStore';
import { soundEngine } from '@core/audio/soundEngine';
import { useNotificationStore } from '@core/notifications/notificationStore';

export interface SplitScreenState {
  isSplitActive: boolean;
  leftWindowId: WindowId | null;
  rightWindowId: WindowId | null;
  splitRatio: number; // 0.2 to 0.8, default 0.5

  // Actions
  enableSplit: (leftId: WindowId, rightId: WindowId, initialRatio?: number) => void;
  updateRatio: (ratio: number, viewportWidth?: number, viewportHeight?: number) => void;
  closeSplit: () => void;
  toggleSplitTopWindows: () => void;
}

export const useSplitScreenStore = create<SplitScreenState>((set, get) => ({
  isSplitActive: false,
  leftWindowId: null,
  rightWindowId: null,
  splitRatio: 0.5,

  enableSplit: (leftId, rightId, initialRatio = 0.5) => {
    const winStore = useWindowStore.getState();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const topInset = 32;

    const leftWidth = Math.floor(viewportWidth * initialRatio);
    const rightWidth = viewportWidth - leftWidth;
    const height = Math.max(240, viewportHeight - topInset);

    winStore.updatePosition(leftId, { x: 0, y: topInset });
    winStore.updateSize(leftId, { width: leftWidth, height });

    winStore.updatePosition(rightId, { x: leftWidth, y: topInset });
    winStore.updateSize(rightId, { width: rightWidth, height });

    soundEngine.playSnap();
    useNotificationStore.getState().notify({
      title: 'Split-Screen Active',
      message: 'Windows paired in 2-Up split. Drag divider to resize.',
      type: 'info',
    });

    set({
      isSplitActive: true,
      leftWindowId: leftId,
      rightWindowId: rightId,
      splitRatio: initialRatio,
    });
  },

  updateRatio: (rawRatio, viewportWidth = window.innerWidth, viewportHeight = window.innerHeight) => {
    const { leftWindowId, rightWindowId, isSplitActive } = get();
    if (!isSplitActive || !leftWindowId || !rightWindowId) return;

    const clampedRatio = Math.max(0.2, Math.min(0.8, rawRatio));
    const winStore = useWindowStore.getState();
    const topInset = 32;
    const height = Math.max(240, viewportHeight - topInset);

    const leftWidth = Math.floor(viewportWidth * clampedRatio);
    const rightWidth = viewportWidth - leftWidth;

    winStore.updatePosition(leftWindowId, { x: 0, y: topInset });
    winStore.updateSize(leftWindowId, { width: leftWidth, height });

    winStore.updatePosition(rightWindowId, { x: leftWidth, y: topInset });
    winStore.updateSize(rightWindowId, { width: rightWidth, height });

    set({ splitRatio: clampedRatio });
  },

  closeSplit: () => {
    soundEngine.playClick();
    set({
      isSplitActive: false,
      leftWindowId: null,
      rightWindowId: null,
      splitRatio: 0.5,
    });
  },

  toggleSplitTopWindows: () => {
    const { isSplitActive, closeSplit, enableSplit } = get();
    if (isSplitActive) {
      closeSplit();
      return;
    }

    const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId ?? 1;
    const windows = useWindowStore.getState().windows;
    const focusStack = useWindowStore.getState().focusStack;

    // Filter unminimized windows in active workspace
    const workspaceWins = focusStack
      .map((id) => windows[id])
      .filter((w): w is NonNullable<typeof w> => Boolean(w && !w.isMinimized && (w.workspaceId ?? 1) === activeWorkspaceId));

    if (workspaceWins.length >= 2) {
      const topWin = workspaceWins[workspaceWins.length - 1]!;
      const secondWin = workspaceWins[workspaceWins.length - 2]!;
      enableSplit(topWin.id, secondWin.id, 0.5);
    } else if (workspaceWins.length === 1) {
      const topWin = workspaceWins[0]!;
      useWindowStore.getState().snapWindow(topWin.id, 'left', {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      useNotificationStore.getState().notify({
        title: 'Snapped Left Half',
        message: 'Open a second app to form an interactive 2-Up split.',
        type: 'info',
      });
    }
  },
}));
