import { useVFSStore } from '@core/vfs/vfsStore';
import { vfs } from '@core/vfs/vfsService';
import { useWallpaperStore } from '@core/theme/wallpaperStore';
import { useThemeStore } from '@core/theme/themeStore';
import { useDockStore } from '@shell/dock/dockStore';
import { useWidgetStore } from '@core/widgets/widgetStore';
import { useClipboardStore } from '@core/clipboard/clipboardStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { soundEngine } from '@core/audio/soundEngine';

export interface FlowOSSystemImage {
  version: string;
  exportedAt: number;
  vfsFiles: Record<string, string>;
  wallpaperId: string;
  themeId: string;
  dockPinned: string[];
  widgets: any[];
  clipboard: any[];
}

export async function exportSystemImage(): Promise<void> {
  try {
    soundEngine.playClick();
    const vfsStore = useVFSStore.getState();
    const nodes = vfsStore.nodes;
    const vfsFiles: Record<string, string> = {};

    // Read all file contents
    for (const [path, node] of Object.entries(nodes)) {
      if (node.type === 'file') {
        try {
          const content = await vfs.readFile(path);
          vfsFiles[path] = content;
        } catch {
          // Skip corrupt file
        }
      }
    }

    const image: FlowOSSystemImage = {
      version: '0.2.0',
      exportedAt: Date.now(),
      vfsFiles,
      wallpaperId: useWallpaperStore.getState().currentWallpaperId,
      themeId: useThemeStore.getState().themeId,
      dockPinned: useDockStore.getState().pinnedAppIds,
      widgets: useWidgetStore.getState().widgets,
      clipboard: useClipboardStore.getState().entries,
    };

    const json = JSON.stringify(image, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowos-system-image-${new Date().toISOString().slice(0, 10)}.flowos`;
    a.click();
    URL.revokeObjectURL(url);

    soundEngine.playChime();
    useNotificationStore.getState().notify({
      title: 'System Image Exported',
      message: `Complete FlowOS state archived (${Object.keys(vfsFiles).length} files).`,
      type: 'success',
    });
  } catch (err: any) {
    soundEngine.playAlert();
    useNotificationStore.getState().notify({
      title: 'Export Failed',
      message: err.message || 'Failed to export system image.',
      type: 'error',
    });
  }
}

export async function restoreSystemImage(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const image = JSON.parse(text) as FlowOSSystemImage;

    if (!image.version || !image.vfsFiles) {
      throw new Error('Invalid .flowos system image format.');
    }

    const vfsStore = useVFSStore.getState();

    // Restore VFS files
    for (const [path, content] of Object.entries(image.vfsFiles)) {
      await vfsStore.writeFile(path, content);
    }

    // Restore wallpaper
    if (image.wallpaperId) {
      useWallpaperStore.getState().setWallpaper(image.wallpaperId);
    }

    // Restore theme
    if (image.themeId === 'dark' || image.themeId === 'light') {
      useThemeStore.getState().setTheme(image.themeId);
    }

    // Restore widgets
    if (Array.isArray(image.widgets)) {
      localStorage.setItem('flowos_desktop_widgets_v1', JSON.stringify(image.widgets));
    }

    // Restore clipboard
    if (Array.isArray(image.clipboard)) {
      localStorage.setItem('flowos_clipboard_history_v1', JSON.stringify(image.clipboard));
    }

    soundEngine.playChime();
    useNotificationStore.getState().notify({
      title: 'System Restored Successfully',
      message: `Reloading FlowOS environment...`,
      type: 'success',
    });

    setTimeout(() => {
      window.location.reload();
    }, 800);

    return true;
  } catch (err: any) {
    soundEngine.playAlert();
    useNotificationStore.getState().notify({
      title: 'Restore Failed',
      message: err.message || 'Corrupted or incompatible system image.',
      type: 'error',
    });
    return false;
  }
}
