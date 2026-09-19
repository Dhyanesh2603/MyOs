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
import { TopMenuBar } from '@shell/topbar/TopMenuBar';
import { ControlCenterShade } from '@shell/control-center/ControlCenterShade';
import { LockScreen } from '@shell/session/LockScreen';
import { useSessionStore } from '@core/session/sessionStore';
import { useControlCenterStore } from '@core/system/controlCenterStore';
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

    const handleLockShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        useSessionStore.getState().lock();
      }
    };
    window.addEventListener('keydown', handleLockShortcut);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleLockShortcut);
    };
  }, []);

  const windows = useWindowStore((state) => state.windows);
  const windowList = Object.values(windows);
  const { brightness, isNightShift } = useControlCenterStore();

  return (
    <DesktopSurface>
      {/* Screen Brightness & Night Shift Hardware Filter Overlay */}
      {(brightness < 1 || isNightShift) && (
        <div
          className="pointer-events-none fixed inset-0 z-[8900] transition-colors duration-200"
          style={{
            backgroundColor: isNightShift
              ? `rgba(255, 140, 0, ${0.12 + (1 - brightness) * 0.25})`
              : `rgba(0, 0, 0, ${1 - brightness})`,
            mixBlendMode: isNightShift ? 'multiply' : 'normal',
          }}
        />
      )}

      {/* Unified Global Top Menu Bar */}
      <TopMenuBar />

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

      {/* Control Center Glass Shade */}
      <ControlCenterShade />

      {/* Visual Alt+Tab Task Switcher */}
      <TaskSwitcher />

      {/* Lock Screen & Session Auth Overlay */}
      <LockScreen />
    </DesktopSurface>
  );
};

export default App;
