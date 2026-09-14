import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';

const SettingsApp: React.FC<AppProps> = ({ windowId, processId }) => {
  return (
    <div className="flex h-full w-full flex-col bg-surface-panel p-5 text-content-primary">
      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
        <SettingsIcon className="h-5 w-5 text-accent-primary" />
        <h2 className="text-base font-semibold">System Settings</h2>
      </div>

      <div className="mt-4 space-y-3 text-xs text-content-secondary">
        <p>This is a single-instance system application.</p>
        <div className="rounded-control bg-surface-overlay/50 p-3 font-mono">
          <div>Process ID: {processId}</div>
          <div>Window ID: {windowId}</div>
        </div>
      </div>
    </div>
  );
};

export const settingsManifest: AppManifest = {
  id: 'system-settings',
  name: 'Settings',
  description: 'Customize FlowOS preferences, appearance, and accessibility.',
  category: 'system',
  icon: SettingsIcon,
  defaultSize: { width: 620, height: 460 },
  constraints: { minWidth: 480, minHeight: 360, maxWidth: 900, maxHeight: 720 },
  allowMultipleInstances: false,
  permissions: ['notifications'],
  component: SettingsApp,
};
