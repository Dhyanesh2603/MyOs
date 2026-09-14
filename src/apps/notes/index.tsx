import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';

const NotesApp: React.FC<AppProps> = ({ windowId, processId }) => {
  const [content, setContent] = useState(
    'FlowOS Scratchpad\n\nNotes are independent process instances.'
  );

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel p-4 text-content-primary">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs text-content-secondary">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent-primary" />
          <span className="font-medium text-content-primary">Scratchpad</span>
        </div>
        <span className="font-mono text-[10px] text-content-tertiary">
          {processId.slice(-8)}
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mt-3 flex-1 resize-none bg-transparent font-mono text-xs text-content-primary outline-none placeholder:text-content-tertiary"
        placeholder="Type notes here..."
      />

      <div className="mt-2 border-t border-white/5 pt-2 text-[10px] font-mono text-content-tertiary">
        Window: {windowId.slice(-8)}
      </div>
    </div>
  );
};

export const notesManifest: AppManifest = {
  id: 'notes',
  name: 'Notes',
  description: 'Fluid lightweight scratchpad and markdown editor.',
  category: 'productivity',
  icon: FileText,
  defaultSize: { width: 500, height: 400 },
  constraints: { minWidth: 360, minHeight: 280, maxWidth: 800, maxHeight: 650 },
  allowMultipleInstances: true,
  permissions: ['vfs:read', 'vfs:write'],
  component: NotesApp,
};
