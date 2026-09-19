import { useVFSStore } from './vfsStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { normalizePath } from './vfsService';

/**
 * Downloads a file stored in the FlowOS IndexedDB VFS directly to the user's physical computer.
 */
export async function downloadVFSToPC(filePath: string): Promise<void> {
  const { readFile, nodes } = useVFSStore.getState();
  const { notify } = useNotificationStore.getState();

  const node = nodes[filePath];
  if (!node || node.type === 'directory') {
    notify({
      title: 'Download Failed',
      message: `Cannot export directory or non-existent file: ${filePath}`,
      type: 'error',
    });
    return;
  }

  try {
    const content = await readFile(filePath);
    const fileName = filePath.split('/').pop() || 'download.txt';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    let mimeType = 'text/plain;charset=utf-8';
    if (ext === 'json') mimeType = 'application/json';
    else if (ext === 'js' || ext === 'ts') mimeType = 'application/javascript';
    else if (ext === 'html') mimeType = 'text/html';
    else if (ext === 'css') mimeType = 'text/css';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notify({
      title: 'File Exported to PC',
      message: `Saved ${fileName} to your physical Downloads folder.`,
      type: 'success',
    });
  } catch (err) {
    notify({
      title: 'Export Failed',
      message: `Could not export file: ${String(err)}`,
      type: 'error',
    });
  }
}

/**
 * Imports a real file dragged from the physical host machine into the FlowOS IndexedDB VFS.
 */
export async function importHostFileToVFS(
  file: File,
  destinationDir = '/home/user/Desktop'
): Promise<string> {
  const { writeFile } = useVFSStore.getState();
  const { notify } = useNotificationStore.getState();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = (e.target?.result as string) || '';
        const targetPath = normalizePath(`${destinationDir}/${file.name}`);
        await writeFile(targetPath, text);

        notify({
          title: 'Imported from PC',
          message: `Saved '${file.name}' into ${destinationDir}.`,
          type: 'success',
        });

        resolve(targetPath);
      } catch (err) {
        notify({
          title: 'Import Failed',
          message: `Failed saving '${file.name}': ${String(err)}`,
          type: 'error',
        });
        reject(err);
      }
    };

    reader.onerror = (err) => {
      notify({
        title: 'Read Error',
        message: `Could not read physical file '${file.name}'.`,
        type: 'error',
      });
      reject(err);
    };

    // For images, read as Data URL; for code/text, read as text
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext)) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
}
