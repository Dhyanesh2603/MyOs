import { useVFSStore } from './vfsStore';
import { vfs } from './vfsService';

export interface FileContentMatch {
  path: string;
  name: string;
  isNameMatch: boolean;
  snippet?: string;
  lineNumber?: number;
  matchedTerm: string;
}

export async function searchVFSContent(
  rawQuery: string,
  limit = 12
): Promise<FileContentMatch[]> {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const nodes = useVFSStore.getState().nodes;
  const results: FileContentMatch[] = [];

  for (const [path, node] of Object.entries(nodes)) {
    if (node.type === 'directory') continue;

    const fileNameLower = node.name.toLowerCase();
    const isNameMatch = fileNameLower.includes(query);

    // If filename matches, add right away
    if (isNameMatch) {
      results.push({
        path,
        name: node.name,
        isNameMatch: true,
        matchedTerm: query,
      });
      if (results.length >= limit) break;
      continue;
    }

    // Try reading text content for deep full-text inspection
    const ext = node.name.split('.').pop()?.toLowerCase() || '';
    const isTextReadable = ['txt', 'md', 'js', 'ts', 'jsx', 'tsx', 'json', 'css', 'html', 'sh', 'cfg'].includes(ext);

    if (isTextReadable) {
      try {
        const text = await vfs.readFile(path);
        const lowerText = text.toLowerCase();
        const matchIdx = lowerText.indexOf(query);

        if (matchIdx !== -1) {
          // Find line number
          const textBefore = text.slice(0, matchIdx);
          const lineNumber = textBefore.split('\n').length;

          // Extract contextual snippet around matched keyword
          const start = Math.max(0, matchIdx - 35);
          const end = Math.min(text.length, matchIdx + query.length + 45);
          let snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
          if (start > 0) snippet = '...' + snippet;
          if (end < text.length) snippet = snippet + '...';

          results.push({
            path,
            name: node.name,
            isNameMatch: false,
            snippet,
            lineNumber,
            matchedTerm: query,
          });

          if (results.length >= limit) break;
        }
      } catch {
        // Skip unreadable binary or corrupt nodes
      }
    }
  }

  return results;
}
