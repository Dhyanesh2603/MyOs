import { create } from 'zustand';
import type {
  ProcessId,
  WindowConstraints,
  WindowCreateOptions,
  WindowId,
  WindowPosition,
  WindowSize,
  WindowState,
} from '@contracts/window';
import {
  BASE_Z_INDEX,
  DEFAULT_INSETS,
  computeInitialPosition,
  type ViewportInsets,
} from './geometry';

export interface WindowStoreState {
  windows: Record<WindowId, WindowState>;
  focusStack: WindowId[];
  activeWindowId: WindowId | null;

  // Selectors / Helpers
  getZIndex: (id: WindowId) => number;
  getWindow: (id: WindowId) => WindowState | undefined;

  // Actions
  createWindow: (
    options: WindowCreateOptions & {
      processId: ProcessId;
      viewportSize?: WindowSize;
      insets?: ViewportInsets;
    }
  ) => WindowId;
  closeWindow: (id: WindowId) => void;
  focusWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  restoreWindow: (id: WindowId) => void;
  toggleMaximize: (
    id: WindowId,
    viewportSize: WindowSize,
    insets?: ViewportInsets
  ) => void;
  updatePosition: (id: WindowId, position: WindowPosition) => void;
  updateSize: (id: WindowId, size: WindowSize) => void;
  setDragging: (id: WindowId, isDragging: boolean) => void;
  setResizing: (id: WindowId, isResizing: boolean) => void;
}

const DEFAULT_CONSTRAINTS: WindowConstraints = {
  minWidth: 320,
  minHeight: 240,
  maxWidth: 2560,
  maxHeight: 1440,
};

const DEFAULT_SIZE: WindowSize = {
  width: 680,
  height: 480,
};

let windowSequence = 0;
function generateWindowId(appId: string): WindowId {
  windowSequence += 1;
  return `win-${appId}-${windowSequence}-${Math.random().toString(36).slice(2, 6)}`;
}

export const useWindowStore = create<WindowStoreState>((set, get) => ({
  windows: {},
  focusStack: [],
  activeWindowId: null,

  getZIndex: (id: WindowId): number => {
    const { focusStack } = get();
    const index = focusStack.indexOf(id);
    return index >= 0 ? BASE_Z_INDEX + index : BASE_Z_INDEX;
  },

  getWindow: (id: WindowId): WindowState | undefined => {
    return get().windows[id];
  },

  createWindow: (options) => {
    const {
      appId,
      processId,
      title = appId,
      initialSize = DEFAULT_SIZE,
      constraints = {},
      customState = {},
      viewportSize = { width: window.innerWidth || 1280, height: window.innerHeight || 800 },
      insets = DEFAULT_INSETS,
    } = options;

    const winId = generateWindowId(appId);
    const activeWin = get().activeWindowId ? get().windows[get().activeWindowId!] : undefined;

    const mergedConstraints: WindowConstraints = {
      ...DEFAULT_CONSTRAINTS,
      ...constraints,
    };

    const initialPosition =
      options.initialPosition ??
      computeInitialPosition(initialSize, viewportSize, activeWin, insets);

    const newWindow: WindowState = {
      id: winId,
      processId,
      appId,
      title,
      position: initialPosition,
      size: initialSize,
      constraints: mergedConstraints,
      zIndex: BASE_Z_INDEX + get().focusStack.length,
      isFocused: true,
      isMinimized: false,
      isMaximized: false,
      isDragging: false,
      isResizing: false,
      customState,
    };

    set((state) => {
      // Mark previous active window as not focused
      const updatedWindows: Record<WindowId, WindowState> = {};
      for (const [key, win] of Object.entries(state.windows)) {
        updatedWindows[key] = win.isFocused ? { ...win, isFocused: false } : win;
      }
      updatedWindows[winId] = newWindow;

      return {
        windows: updatedWindows,
        focusStack: [...state.focusStack, winId],
        activeWindowId: winId,
      };
    });

    return winId;
  },

  closeWindow: (id) => {
    set((state) => {
      const windowToClose = state.windows[id];
      if (!windowToClose) return state;

      const remainingWindows = { ...state.windows };
      delete remainingWindows[id];

      const newFocusStack = state.focusStack.filter((winId) => winId !== id);

      // If we closed the active window, focus the next top-most unminimized window
      let nextActiveId: WindowId | null = null;
      if (state.activeWindowId === id) {
        for (let i = newFocusStack.length - 1; i >= 0; i--) {
          const candidateId = newFocusStack[i];
          if (candidateId && remainingWindows[candidateId] && !remainingWindows[candidateId].isMinimized) {
            nextActiveId = candidateId;
            break;
          }
        }
      } else {
        nextActiveId = state.activeWindowId;
      }

      // Update focus states
      if (nextActiveId) {
        const nextWin = remainingWindows[nextActiveId];
        if (nextWin) {
          remainingWindows[nextActiveId] = {
            ...nextWin,
            isFocused: true,
          };
        }
      }

      return {
        windows: remainingWindows,
        focusStack: newFocusStack,
        activeWindowId: nextActiveId,
      };
    });
  },

  focusWindow: (id) => {
    set((state) => {
      const targetWindow = state.windows[id];
      if (!targetWindow) return state;

      // Already focused and top of stack?
      if (
        state.activeWindowId === id &&
        state.focusStack[state.focusStack.length - 1] === id &&
        !targetWindow.isMinimized
      ) {
        return state;
      }

      // Reorder focus stack: remove id and push to top
      const filteredStack = state.focusStack.filter((winId) => winId !== id);
      const newFocusStack = [...filteredStack, id];

      const updatedWindows: Record<WindowId, WindowState> = {};
      for (const [key, win] of Object.entries(state.windows)) {
        if (key === id) {
          updatedWindows[key] = {
            ...win,
            isFocused: true,
            isMinimized: false, // Focusing automatically un-minimizes
          };
        } else if (win.isFocused) {
          updatedWindows[key] = {
            ...win,
            isFocused: false,
          };
        } else {
          updatedWindows[key] = win;
        }
      }

      return {
        windows: updatedWindows,
        focusStack: newFocusStack,
        activeWindowId: id,
      };
    });
  },

  minimizeWindow: (id) => {
    set((state) => {
      const targetWindow = state.windows[id];
      if (!targetWindow || targetWindow.isMinimized) return state;

      const updatedWindows: Record<WindowId, WindowState> = {
        ...state.windows,
        [id]: {
          ...targetWindow,
          isMinimized: true,
          isFocused: false,
        },
      };

      // Determine new active window if minimized was active
      let nextActiveId: WindowId | null = null;
      if (state.activeWindowId === id) {
        for (let i = state.focusStack.length - 1; i >= 0; i--) {
          const candidateId = state.focusStack[i];
          if (
            candidateId &&
            candidateId !== id &&
            updatedWindows[candidateId] &&
            !updatedWindows[candidateId].isMinimized
          ) {
            nextActiveId = candidateId;
            break;
          }
        }

        if (nextActiveId) {
          const targetWin = updatedWindows[nextActiveId];
          if (targetWin) {
            updatedWindows[nextActiveId] = {
              ...targetWin,
              isFocused: true,
            };
          }
        }
      } else {
        nextActiveId = state.activeWindowId;
      }

      return {
        windows: updatedWindows,
        activeWindowId: nextActiveId,
      };
    });
  },

  restoreWindow: (id) => {
    get().focusWindow(id);
  },

  toggleMaximize: (id, viewportSize, insets = DEFAULT_INSETS) => {
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;

      if (!win.isMaximized) {
        // Maximize: save snapshot and expand to fill workspace within insets
        return {
          windows: {
            ...state.windows,
            [id]: {
              ...win,
              isMaximized: true,
              preMaximizedState: {
                position: { ...win.position },
                size: { ...win.size },
              },
              position: {
                x: insets.left,
                y: insets.top,
              },
              size: {
                width: Math.max(320, viewportSize.width - insets.left - insets.right),
                height: Math.max(240, viewportSize.height - insets.top - insets.bottom),
              },
            },
          },
        };
      } else {
        // Restore from preMaximizedState
        const restoredPos = win.preMaximizedState?.position ?? { x: 40, y: 40 };
        const restoredSize = win.preMaximizedState?.size ?? DEFAULT_SIZE;

        return {
          windows: {
            ...state.windows,
            [id]: {
              ...win,
              isMaximized: false,
              preMaximizedState: undefined,
              position: restoredPos,
              size: restoredSize,
            },
          },
        };
      }
    });
  },

  updatePosition: (id, position) => {
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return {
        windows: {
          ...state.windows,
          [id]: { ...win, position },
        },
      };
    });
  },

  updateSize: (id, size) => {
    set((state) => {
      const win = state.windows[id];
      if (!win) return state;
      return {
        windows: {
          ...state.windows,
          [id]: { ...win, size },
        },
      };
    });
  },

  setDragging: (id, isDragging) => {
    set((state) => {
      const win = state.windows[id];
      if (!win || win.isDragging === isDragging) return state;
      return {
        windows: {
          ...state.windows,
          [id]: { ...win, isDragging },
        },
      };
    });
  },

  setResizing: (id, isResizing) => {
    set((state) => {
      const win = state.windows[id];
      if (!win || win.isResizing === isResizing) return state;
      return {
        windows: {
          ...state.windows,
          [id]: { ...win, isResizing },
        },
      };
    });
  },
}));
