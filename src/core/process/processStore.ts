import { create } from 'zustand';
import type { ProcessId, ProcessInstance } from '@contracts/app';
import type { WindowId, WindowSize } from '@contracts/window';
import { appRegistry } from './registry';
import { useWindowStore } from '@core/window/windowStore';

export interface ProcessStoreState {
  processes: Record<ProcessId, ProcessInstance>;
  activeProcessId: ProcessId | null;

  // Selectors
  getProcess: (id: ProcessId) => ProcessInstance | undefined;
  getRunningProcesses: () => ProcessInstance[];
  isAppRunning: (appId: string) => boolean;
  getProcessesByAppId: (appId: string) => ProcessInstance[];

  // Actions
  launchApp: (
    appId: string,
    initialData?: unknown,
    viewportSize?: WindowSize
  ) => ProcessId | null;
  terminateProcess: (processId: ProcessId) => void;
  attachWindow: (processId: ProcessId, windowId: WindowId) => void;
  detachWindow: (processId: ProcessId, windowId: WindowId) => void;
  setActiveProcess: (processId: ProcessId | null) => void;
}

let processSequence = 0;
function generateProcessId(appId: string): ProcessId {
  processSequence += 1;
  return `proc-${appId}-${processSequence}-${Math.random().toString(36).slice(2, 6)}`;
}

export const useProcessStore = create<ProcessStoreState>((set, get) => ({
  processes: {},
  activeProcessId: null,

  getProcess: (id) => get().processes[id],

  getRunningProcesses: () => Object.values(get().processes),

  isAppRunning: (appId) => {
    return Object.values(get().processes).some((proc) => proc.appId === appId);
  },

  getProcessesByAppId: (appId) => {
    return Object.values(get().processes).filter((proc) => proc.appId === appId);
  },

  launchApp: (appId, initialData, viewportSize) => {
    const manifest = appRegistry.get(appId);
    if (!manifest) {
      console.error(`[ProcessStore] App '${appId}' is not registered in AppRegistry.`);
      return null;
    }

    const { allowMultipleInstances } = manifest;

    // Single-instance enforcement: if already running, focus existing window
    if (!allowMultipleInstances) {
      const existingProcess = get().getProcessesByAppId(appId)[0];
      if (existingProcess && existingProcess.windowIds.length > 0) {
        const targetWinId = existingProcess.windowIds[0];
        if (targetWinId) {
          useWindowStore.getState().focusWindow(targetWinId);
          set({ activeProcessId: existingProcess.id });
          return existingProcess.id;
        }
      }
    }

    // Allocate new process
    const processId = generateProcessId(appId);
    const newProcess: ProcessInstance = {
      id: processId,
      appId,
      state: 'running',
      windowIds: [],
      startedAt: Date.now(),
    };

    // Store process first
    set((state) => ({
      processes: {
        ...state.processes,
        [processId]: newProcess,
      },
      activeProcessId: processId,
    }));

    // Request Window Manager to spawn initial window for this process
    const windowId = useWindowStore.getState().createWindow({
      appId,
      processId,
      title: manifest.name,
      initialSize: manifest.defaultSize,
      constraints: manifest.constraints,
      customState: initialData ? { initialData } : {},
      viewportSize,
    });

    // Attach window to process
    get().attachWindow(processId, windowId);

    return processId;
  },

  terminateProcess: (processId) => {
    const proc = get().processes[processId];
    if (!proc) return;

    // Close all associated windows in the Window Manager
    const winStore = useWindowStore.getState();
    proc.windowIds.forEach((winId) => {
      winStore.closeWindow(winId);
    });

    // Clean up process from memory
    set((state) => {
      const remaining = { ...state.processes };
      delete remaining[processId];

      const newActive =
        state.activeProcessId === processId ? null : state.activeProcessId;

      return {
        processes: remaining,
        activeProcessId: newActive,
      };
    });
  },

  attachWindow: (processId, windowId) => {
    set((state) => {
      const proc = state.processes[processId];
      if (!proc) return state;

      if (proc.windowIds.includes(windowId)) return state;

      return {
        processes: {
          ...state.processes,
          [processId]: {
            ...proc,
            windowIds: [...proc.windowIds, windowId],
          },
        },
      };
    });
  },

  detachWindow: (processId, windowId) => {
    const proc = get().processes[processId];
    if (!proc) return;

    const remainingWindows = proc.windowIds.filter((id) => id !== windowId);

    // If the process has no more windows left, terminate the process
    if (remainingWindows.length === 0) {
      get().terminateProcess(processId);
      return;
    }

    set((state) => ({
      processes: {
        ...state.processes,
        [processId]: {
          ...proc,
          windowIds: remainingWindows,
        },
      },
    }));
  },

  setActiveProcess: (processId) => {
    set({ activeProcessId: processId });
  },
}));
