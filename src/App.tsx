import React, { useEffect } from 'react';
import { initializeApplications } from '@core/process/initApps';
import { useWindowStore } from '@core/window/windowStore';
import { Dock } from '@shell/dock/Dock';
import { WindowFrame } from '@shell/window/WindowFrame';
import { DesktopSurface } from '@shell/desktop/DesktopSurface';
import { ContextMenu } from '@shell/context-menu/ContextMenu';
import { CommandPalette } from '@shell/command/CommandPalette';
import { NotificationToaster } from '@shell/notifications/NotificationToaster';
import { NotificationCenter } from '@shell/notifications/NotificationCenter';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { TaskSwitcher } from '@shell/switcher/TaskSwitcher';
import { useVFSStore } from '@core/vfs/vfsStore';

export const App: React.FC = () => {
  useEffect(() => {
    initializeApplications();
    useVFSStore.getState().init();

    const timer = setTimeout(() => {
      useNotificationStore.getState().notify({
        title: 'FlowOS Initialized',
        message: 'All kernel subsystems operational. Press Ctrl+K for Spotlight.',
        type: 'success',
      });
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const windows = useWindowStore((state) => state.windows);
  const windowList = Object.values(windows);

  return (
    <DesktopSurface>
      {/* Interactive Rendered Windows */}
      {windowList.map((win) => (
        <WindowFrame key={win.id} windowState={win} />
      ))}

      {/* Fluid Magnetic Dock */}
      <Dock />

      {/* Global Context Menu */}
      <ContextMenu />

      {/* Global Spotlight / Command Palette */}
      <CommandPalette />

      {/* Notifications & System Shade */}
      <NotificationToaster />
      <NotificationCenter />

      {/* Visual Alt+Tab Task Switcher */}
      <TaskSwitcher />
    </DesktopSurface>
  );
};

export default App;
