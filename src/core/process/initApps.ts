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
import { flowshotManifest } from '@apps/flowshot';
import { appStoreManifest } from '@apps/app-store';
import { flow2048Manifest } from '@apps/retro-2048';
import { flowSweeperManifest } from '@apps/retro-sweeper';
import { synthManifest } from '@apps/synth';
import { flowcamManifest } from '@apps/flowcam';
import { flowtapeManifest } from '@apps/flowtape';
import { flowboardManifest } from '@apps/flowboard';
import { personalOsManifest } from '@apps/personal-os';

let initialized = false;

/**
 * Registers all core first-party applications into the AppRegistry.
 * Called once during OS initialization.
 */
export function initializeApplications(): void {
  if (initialized) return;

  appRegistry.register(personalOsManifest);
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
  appRegistry.register(flowshotManifest);
  appRegistry.register(appStoreManifest);
  appRegistry.register(flow2048Manifest);
  appRegistry.register(flowSweeperManifest);
  appRegistry.register(synthManifest);
  appRegistry.register(flowcamManifest);
  appRegistry.register(flowtapeManifest);
  appRegistry.register(flowboardManifest);

  initialized = true;
}
