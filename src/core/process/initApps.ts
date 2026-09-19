import { appRegistry } from './registry';
import { settingsManifest } from '@apps/system-settings';
import { notesManifest } from '@apps/notes';
import { terminalManifest } from '@apps/terminal';
import { fileExplorerManifest } from '@apps/file-explorer';
import { calculatorManifest } from '@apps/calculator';
import { musicManifest } from '@apps/music';
import { taskManagerManifest } from '@apps/task-manager';
import { codeEditorManifest } from '@apps/code-editor';
import { browserManifest } from '@apps/browser';
import { paintManifest } from '@apps/paint';
import { galleryManifest } from '@apps/gallery';

let initialized = false;

/**
 * Registers all core first-party applications into the AppRegistry.
 * Called once during OS initialization.
 */
export function initializeApplications(): void {
  if (initialized) return;

  appRegistry.register(settingsManifest);
  appRegistry.register(notesManifest);
  appRegistry.register(terminalManifest);
  appRegistry.register(fileExplorerManifest);
  appRegistry.register(calculatorManifest);
  appRegistry.register(musicManifest);
  appRegistry.register(taskManagerManifest);
  appRegistry.register(codeEditorManifest);
  appRegistry.register(browserManifest);
  appRegistry.register(paintManifest);
  appRegistry.register(galleryManifest);

  initialized = true;
}
