import { useProcessStore } from '@core/process/processStore';
import { useWindowStore } from '@core/window/windowStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useThemeStore } from '@core/theme/themeStore';
import type { ToastOptions } from '@contracts/notification';

/**
 * Onyx OS Application SDK
 * Universal hook providing decoupled access to all OS subsystems.
 */
export function useOnyxOS() {
  const { launchApp, terminateProcess, processes } = useProcessStore();
  const { windows, activeWindowId, focusWindow, closeWindow, minimizeWindow } =
    useWindowStore();
  const { notify } = useNotificationStore();
  const { readFile, writeFile, mkdir, deleteNode, nodes } = useVFSStore();
  const { themeId, accentColor, setTheme, setAccentColor } = useThemeStore();

  return {
    // Process & Application Management
    launchApp,
    terminateProcess,
    runningProcesses: Object.values(processes),

    // Window Management
    windows: Object.values(windows),
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,

    // Notifications
    notify: (options: ToastOptions) => notify(options),

    // Virtual File System
    fs: {
      readFile,
      writeFile,
      mkdir,
      deleteNode,
      nodes,
    },

    // Personalization & Themes
    theme: {
      themeId,
      accentColor,
      setTheme,
      setAccentColor,
    },
  };
}

export const useFlowOS = useOnyxOS;
