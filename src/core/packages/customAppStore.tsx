import React, { useState } from 'react';
import { create } from 'zustand';
import type { AppCategory, AppManifest, AppProps } from '@contracts/app';
import { appRegistry } from '@core/process/registry';
import { useDockStore } from '@shell/dock/dockStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { soundEngine } from '@core/audio/soundEngine';
import {
  Globe,
  Palette,
  Code2,
  Film,
  Music,
  Layers,
  Sparkles,
  Compass,
  ExternalLink,
  RotateCw,
  LucideIcon,
} from 'lucide-react';

export const WEB_APP_ICONS: Record<string, LucideIcon> = {
  Globe,
  Palette,
  Code2,
  Film,
  Music,
  Layers,
  Sparkles,
  Compass,
};

export interface CustomWebAppDef {
  id: string;
  name: string;
  url: string;
  description: string;
  category: AppCategory;
  iconName: string;
  accentColor: string;
  createdAt: number;
}

interface CustomAppStoreState {
  customApps: CustomWebAppDef[];
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  createWebApp: (def: Omit<CustomWebAppDef, 'id' | 'createdAt'>) => string;
  deleteWebApp: (id: string) => void;
  init: () => void;
}

const STORAGE_KEY = 'flowos_custom_web_apps_v1';

// Sandboxed Iframe Web App Container
const CustomWebAppViewer: React.FC<AppProps & { appDef: CustomWebAppDef }> = ({ appDef }) => {
  const [iframeKey, setIframeKey] = useState(0);

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel text-content-primary">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-overlay/80 px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: appDef.accentColor }} />
          <span className="font-semibold truncate text-[11px]">{appDef.name}</span>
          <span className="font-mono text-[10px] text-content-tertiary truncate max-w-[200px]">
            {appDef.url}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              setIframeKey((k) => k + 1);
            }}
            title="Reload Frame"
            className="rounded p-1 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
          >
            <RotateCw className="h-3 w-3" />
          </button>
          <a
            href={appDef.url}
            target="_blank"
            rel="noreferrer"
            title="Open in new browser tab"
            className="rounded p-1 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Frame Content */}
      <div className="relative flex-1 w-full h-full bg-surface-canvas overflow-hidden">
        <iframe
          key={iframeKey}
          src={appDef.url}
          title={appDef.name}
          className="h-full w-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write;"
        />
      </div>
    </div>
  );
};

function registerManifestForApp(appDef: CustomWebAppDef) {
  const IconComp = WEB_APP_ICONS[appDef.iconName] ?? Globe;

  const manifest: AppManifest = {
    id: appDef.id,
    name: appDef.name,
    description: appDef.description || `Custom Web App (${appDef.url})`,
    category: appDef.category,
    icon: IconComp,
    defaultSize: { width: 920, height: 600 },
    constraints: { minWidth: 480, minHeight: 320 },
    allowMultipleInstances: true,
    permissions: ['notifications', 'audio'],
    component: (props: AppProps) => <CustomWebAppViewer {...props} appDef={appDef} />,
  };

  appRegistry.register(manifest);
}

export const useCustomAppStore = create<CustomAppStoreState>((set, get) => ({
  customApps: [],
  isCreateModalOpen: false,

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  init: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CustomWebAppDef[] = JSON.parse(stored);
        set({ customApps: parsed });
        parsed.forEach((app) => registerManifestForApp(app));
      }
    } catch (e) {
      console.error('[CustomAppStore] Failed to load custom apps:', e);
    }
  },

  createWebApp: (def) => {
    const slug = def.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const id = `webapp-${slug}-${Date.now().toString().slice(-4)}`;

    const newApp: CustomWebAppDef = {
      ...def,
      id,
      createdAt: Date.now(),
    };

    registerManifestForApp(newApp);

    const updated = [...get().customApps, newApp];
    set({ customApps: updated, isCreateModalOpen: false });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Pin to dock
    useDockStore.getState().pinApp(id);

    soundEngine.playSnap();
    useNotificationStore.getState().notify({
      title: 'Web App Packaged!',
      message: `"${def.name}" added to your Desktop & Dock`,
      type: 'success',
    });

    return id;
  },

  deleteWebApp: (id) => {
    const updated = get().customApps.filter((a) => a.id !== id);
    set({ customApps: updated });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    useDockStore.getState().unpinApp(id);

    useNotificationStore.getState().notify({
      title: 'App Uninstalled',
      message: 'Custom web app removed from FlowOS',
      type: 'info',
    });
  },
}));
