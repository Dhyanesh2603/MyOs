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
import { MissionControl } from '@shell/switcher/MissionControl';
import { ClipboardHistoryModal } from '@shell/clipboard/ClipboardHistoryModal';
import { ScreenCaptureOverlay } from '@shell/capture/ScreenCaptureOverlay';
import { ScreenSaver } from '@shell/desktop/screensaver/ScreenSaver';
import { CopilotDrawer } from '@shell/copilot/CopilotDrawer';
import { CreateWebAppModal } from '@shell/dialogs/CreateWebAppModal';
import { QuickLookModal } from '@shell/quicklook/QuickLookModal';
import { StageManagerStrip } from '@shell/stage/StageManagerStrip';
import { FlowDropModal } from '@shell/airdrop/FlowDropModal';
import { FancyZonesOverlay } from '@shell/window/FancyZonesOverlay';
import { BatchRenamerModal } from '@shell/dialogs/BatchRenamerModal';
import { FocusModeOverlay } from '@shell/focus/FocusModeOverlay';
import { ScratchpadDrawer } from '@shell/scratchpad/ScratchpadDrawer';
import { SplitScreenDivider } from '@shell/window/SplitScreenDivider';
import { TopMenuBar } from '@shell/topbar/TopMenuBar';
import { ControlCenterShade } from '@shell/control-center/ControlCenterShade';
import { LockScreen } from '@shell/session/LockScreen';
import { AppMenu } from '@shell/menu/AppMenu';
import { useAppMenuStore } from '@shell/menu/appMenuStore';
import { useSessionStore } from '@core/session/sessionStore';
import { useControlCenterStore } from '@core/system/controlCenterStore';
import { useWorkspaceStore } from '@core/workspace/workspaceStore';
import { useStageManagerStore } from '@core/stage/stageManagerStore';
import { useClipboardStore } from '@core/clipboard/clipboardStore';
import { useCaptureStore } from '@shell/capture/captureStore';
import { useCopilotStore } from '@core/copilot/copilotStore';
import { useScratchpadStore } from '@core/scratchpad/scratchpadStore';
import { useSplitScreenStore } from '@core/window/splitScreenStore';
import { useCustomAppStore } from '@core/packages/customAppStore';
import { useVFSStore } from '@core/vfs/vfsStore';
import { soundEngine } from '@core/audio/soundEngine';
import { ErrorBoundary } from '@core/errors/ErrorBoundary';

export const App: React.FC = () => {
  useEffect(() => {
    initializeApplications();
    useVFSStore.getState().init();
    useCustomAppStore.getState().init();

    const timer = setTimeout(() => {
      useNotificationStore.getState().notify({
        title: 'FlowOS Initialized',
        message: 'All kernel subsystems operational. Press Ctrl+K for Spotlight.',
        type: 'success',
      });
    }, 600);

    const handleShortcuts = (e: KeyboardEvent) => {
      // Acoustic Keyboard Soundscapes
      if (!['Control', 'Shift', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
        soundEngine.playKeypress(e.key);
      }

      // Lock screen: Ctrl+Alt+L
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        useSessionStore.getState().lock();
        return;
      }

      // Mission Control: Ctrl+Up
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
        e.preventDefault();
        useWorkspaceStore.getState().toggleMissionControl();
        return;
      }

      // Workspace switching: Ctrl+1..4
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        useWorkspaceStore.getState().setActiveWorkspace(parseInt(e.key, 10));
        return;
      }

      // Workspace cycling: Ctrl+Alt+Left / Right
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        useWorkspaceStore.getState().nextWorkspace();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        useWorkspaceStore.getState().prevWorkspace();
        return;
      }

      // System Clipboard History: Ctrl+Shift+V
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        useClipboardStore.getState().toggleModal();
        return;
      }

      // FlowShot Screen Capture: Ctrl+Shift+S or PrintScreen
      if (
        e.key === 'PrintScreen' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's')
      ) {
        e.preventDefault();
        useCaptureStore.getState().startCapture();
        return;
      }

      // Copilot Assistant: Ctrl+J
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        useCopilotStore.getState().toggleCopilot();
        return;
      }

      // Stage Manager: Alt+S
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        useStageManagerStore.getState().toggleStageManager();
        return;
      }

      // Quick Scratchpad Drawer: Ctrl+\
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        useScratchpadStore.getState().toggleOpen();
        return;
      }

      // 2-Up Split Screen Tiling: Alt+T
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        useSplitScreenStore.getState().toggleSplitTopWindows();
        return;
      }

      // App Library / Mobile App Drawer: Alt+A or Ctrl+Alt+A
      if ((e.altKey && e.key.toLowerCase() === 'a') || ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        soundEngine.playClick();
        useAppMenuStore.getState().toggleAppMenu();
        return;
      }
    };
    window.addEventListener('keydown', handleShortcuts);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleShortcuts);
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

      {/* Interactive 2-Up Split Screen Divider */}
      <SplitScreenDivider />

      {/* Fluid Magnetic Dock */}
      <Dock />

      {/* Global Context Menu */}
      <ContextMenu />

      {/* Global Spotlight / Command Palette */}
      <CommandPalette />

      {/* Mobile App Menu (All Apps Drawer) */}
      <AppMenu />

      {/* Notifications & System Shade */}
      <NotificationToaster />
      <NotificationCenter />

      {/* Control Center Glass Shade */}
      <ErrorBoundary fallbackTitle="Control Center" onReset={() => useControlCenterStore.getState().closeControlCenter()}>
        <ControlCenterShade />
      </ErrorBoundary>

      {/* Visual Alt+Tab Task Switcher */}
      <TaskSwitcher />

      {/* Fullscreen Mission Control & Spaces Overview */}
      <MissionControl />

      {/* System Clipboard History Manager Modal */}
      <ClipboardHistoryModal />

      {/* FlowShot Screen Capture Marquee Overlay */}
      <ScreenCaptureOverlay />

      {/* Ambient Nothing-style ScreenSaver */}
      <ScreenSaver />

      {/* Raycast-style AI Copilot Sidecar Drawer */}
      <CopilotDrawer />

      {/* 1-Click PWA Web App Creator Modal */}
      <CreateWebAppModal />

      {/* macOS-style Spacebar Quick Look Modal */}
      <QuickLookModal />

      {/* Stage Manager Left Strip */}
      <StageManagerStrip />

      {/* Spatial FlowDrop AirBridge Radar Modal */}
      <FlowDropModal />

      {/* Spatial FancyZones Snap Wireframe Overlay */}
      <FancyZonesOverlay />

      {/* Smart Batch Renamer Studio Modal */}
      <BatchRenamerModal />

      {/* Global Distraction-Free Focus Mode Overlay */}
      <FocusModeOverlay />

      {/* Raycast-style Quick Scratchpad Drawer */}
      <ScratchpadDrawer />

      {/* Lock Screen & Session Auth Overlay */}
      <LockScreen />
    </DesktopSurface>
  );
};

export default App;
