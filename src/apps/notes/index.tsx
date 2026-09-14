import React, { useState, useEffect } from 'react';
import { FileText, Save, Check } from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';

const NotesApp: React.FC<AppProps> = ({ windowId, processId }) => {
  const filePath = `/home/user/scratchpad-${processId.slice(-4)}.md`;
  const [content, setContent] = useState(
    `# FlowOS Notes\n\nThis note is tied to Process: ${processId}\nSaved inside the Virtual File System in IndexedDB.`
  );
  const [isSaved, setIsSaved] = useState(true);

  const { writeFile, readFile, nodes } = useVFSStore();

  // Load existing file if present
  useEffect(() => {
    if (nodes[filePath]) {
      readFile(filePath)
        .then((text) => setContent(text))
        .catch(() => {});
    }
  }, [filePath, nodes, readFile]);

  const handleContentChange = (newText: string) => {
    setContent(newText);
    setIsSaved(false);
  };

  const handleSave = async () => {
    await writeFile(filePath, content);
    setIsSaved(true);
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel p-4 text-content-primary">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 text-xs text-content-secondary">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent-primary" />
          <span className="font-medium text-content-primary font-mono text-[11px]">
            {filePath}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] transition-colors ${
              isSaved
                ? 'bg-white/5 text-emerald-400'
                : 'bg-accent-primary text-white hover:bg-accent-hover'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="h-3 w-3" /> Saved
              </>
            ) : (
              <>
                <Save className="h-3 w-3" /> Save to VFS
              </>
            )}
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="mt-3 flex-1 resize-none bg-transparent font-mono text-xs leading-relaxed text-content-primary outline-none placeholder:text-content-tertiary"
        placeholder="Type markdown notes here..."
      />

      <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] font-mono text-content-tertiary">
        <span>Window: {windowId.slice(-8)}</span>
        <span>IndexedDB Backed</span>
      </div>
    </div>
  );
};

export const notesManifest: AppManifest = {
  id: 'notes',
  name: 'Notes',
  description: 'Fluid lightweight scratchpad and markdown editor backed by VFS.',
  category: 'productivity',
  icon: FileText,
  defaultSize: { width: 520, height: 420 },
  constraints: { minWidth: 360, minHeight: 280, maxWidth: 840, maxHeight: 680 },
  allowMultipleInstances: true,
  permissions: ['vfs:read', 'vfs:write'],
  component: NotesApp,
};
