import type { ComponentType } from 'react';

export type CommandCategory = 'apps' | 'windows' | 'system' | 'appearance' | 'files';

export interface CommandAction {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly category: CommandCategory;
  readonly icon?: ComponentType<{ className?: string }>;
  readonly shortcut?: string;
  readonly handler: () => void;
}
