import type { ComponentType } from 'react';
import type { WindowConstraints, WindowId, WindowSize, ProcessId } from './window';

export type { ProcessId };

/**
 * Onyx OS Application Registry & Process Contracts
 */

export type AppCategory =
  | 'system'
  | 'productivity'
  | 'utilities'
  | 'media'
  | 'development';

export type AppPermission =
  | 'vfs:read'
  | 'vfs:write'
  | 'notifications'
  | 'audio';

export interface AppProps {
  windowId: WindowId;
  processId: ProcessId;
  initialData?: unknown;
}

export interface AppManifest {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: AppCategory;
  readonly icon: ComponentType<{ className?: string }>;
  readonly defaultSize: WindowSize;
  readonly constraints: WindowConstraints;
  readonly allowMultipleInstances: boolean;
  readonly permissions: readonly AppPermission[];
  readonly component: ComponentType<AppProps>;
}

export type ProcessLifecycleState =
  | 'starting'
  | 'running'
  | 'suspended'
  | 'terminated';

export interface ProcessInstance {
  readonly id: ProcessId;
  readonly appId: string;
  readonly state: ProcessLifecycleState;
  readonly windowIds: readonly WindowId[];
  readonly startedAt: number;
}
