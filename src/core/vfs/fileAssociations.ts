import { useProcessStore } from '@core/process/processStore';
import type { WindowSize } from '@contracts/window';

/**
 * Registry mapping file extensions to their default FlowOS application ID.
 */
export const FILE_EXTENSIONS_MAP: Record<string, string> = {
  // Notes & Markdown
  md: 'notes',
  markdown: 'notes',
  txt: 'notes',
  log: 'notes',

  // Developer Code & Configs
  json: 'code-editor',
  js: 'code-editor',
  jsx: 'code-editor',
  ts: 'code-editor',
  tsx: 'code-editor',
  css: 'code-editor',
  html: 'code-editor',
  sh: 'code-editor',
  bash: 'code-editor',
  env: 'code-editor',
  yml: 'code-editor',
  yaml: 'code-editor',

  // Audio & Synthesizers
  mp3: 'music',
  wav: 'music',
  ogg: 'music',
};

/**
 * Determines the preferred application ID for a given file path based on its extension.
 */
export function getAppForFile(filePath: string): string {
  const parts = filePath.split('.');
  if (parts.length > 1) {
    const ext = parts[parts.length - 1]!.toLowerCase();
    if (FILE_EXTENSIONS_MAP[ext]) {
      return FILE_EXTENSIONS_MAP[ext]!;
    }
  }
  return 'notes';
}

/**
 * Universal file opener: resolves the handler app and launches it with filePath in initialData.
 */
export function openVFSFile(filePath: string, viewportSize?: WindowSize): string | null {
  const appId = getAppForFile(filePath);
  return useProcessStore.getState().launchApp(appId, { filePath }, viewportSize);
}
