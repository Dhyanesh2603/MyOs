import { appRegistry } from './registry';
import { settingsManifest } from '@apps/system-settings';
import { notesManifest } from '@apps/notes';

let initialized = false;

/**
 * Registers all core first-party applications into the AppRegistry.
 * Called once during OS initialization.
 */
export function initializeApplications(): void {
  if (initialized) return;

  appRegistry.register(settingsManifest);
  appRegistry.register(notesManifest);

  initialized = true;
}
