import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Save,
  Check,
  Eye,
  Edit3,
  BookOpen,
  Tag,
  Hash,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useWindowStore } from '@core/window/windowStore';

const NotesApp: React.FC<AppProps> = ({ windowId, processId }) => {
  const customState = useWindowStore(
    (state) => state.windows[windowId]?.customState as { initialData?: { filePath?: string } } | undefined
  );
  const filePath = customState?.initialData?.filePath || `/home/user/scratchpad-${processId.slice(-4)}.md`;
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const { writeFile, readFile, nodes } = useVFSStore();

  // Load existing file if present, or start with empty note
  useEffect(() => {
    if (nodes[filePath]) {
      readFile(filePath)
        .then((text) => setContent(text))
        .catch(() => {});
    } else {
      setContent('');
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

  // Metrics computation (Obsidian style)
  const wordsCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const charsCount = content.length;
  const readingTimeMin = Math.max(1, Math.ceil(wordsCount / 200));

  // Extract hashtags
  const tags = useMemo(() => {
    const matches = content.match(/#[a-zA-Z0-9_\-]+/g);
    return matches ? Array.from(new Set(matches)) : [];
  }, [content]);

  // Simple clean markdown renderer for Obsidian preview mode
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl font-semibold tracking-tight text-content-primary mb-3 mt-4 border-b border-border-subtle pb-1.5">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-base font-semibold tracking-tight text-content-primary mb-2 mt-3">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-semibold tracking-tight text-content-primary mb-1.5 mt-2.5">
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-2 border-accent-primary pl-3.5 py-1 text-content-secondary italic text-xs my-2 bg-surface-subtle/40 rounded-r">
            {line.slice(2)}
          </blockquote>
        );
      }
      if (line.startsWith('- [x] ')) {
        return (
          <div key={idx} className="flex items-center gap-2 text-xs text-content-secondary my-1">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-accent-primary text-[9px] text-white">✓</span>
            <span className="line-through opacity-75">{line.slice(6)}</span>
          </div>
        );
      }
      if (line.startsWith('- [ ] ')) {
        return (
          <div key={idx} className="flex items-center gap-2 text-xs text-content-primary my-1">
            <span className="h-3.5 w-3.5 rounded border border-border-subtle bg-surface-subtle/50" />
            <span>{line.slice(6)}</span>
          </div>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-content-primary my-0.5 ml-2">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-accent-primary shrink-0" />
            <span>{line.slice(2)}</span>
          </div>
        );
      }
      if (line.startsWith('```')) {
        return (
          <div key={idx} className="my-1 font-mono text-[10px] text-accent-primary">
            {line}
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs leading-relaxed text-content-secondary my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel text-content-primary">
      {/* Obsidian Document Header */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-overlay/90 px-3.5 py-2 text-xs select-none">
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-accent-primary" />
          <span className="font-mono text-[11px] font-medium text-content-primary">
            {filePath.split('/').pop()}
          </span>
          <span className="font-mono text-[9px] text-content-tertiary bg-surface-subtle border border-border-subtle px-1.5 py-0.5 rounded">
            MD
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher: Edit vs Reading View */}
          <div className="flex items-center rounded-md border border-border-subtle bg-surface-subtle/50 p-0.5">
            <button
              onClick={() => setViewMode('edit')}
              title="Edit Mode"
              className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
                viewMode === 'edit'
                  ? 'bg-surface-panel text-content-primary shadow-sm'
                  : 'text-content-tertiary hover:text-content-secondary'
              }`}
            >
              <Edit3 className="h-2.5 w-2.5" /> Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              title="Reading View"
              className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono transition-colors ${
                viewMode === 'preview'
                  ? 'bg-surface-panel text-content-primary shadow-sm'
                  : 'text-content-tertiary hover:text-content-secondary'
              }`}
            >
              <Eye className="h-2.5 w-2.5" /> Read
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 rounded border px-2 py-1 font-mono text-[10px] transition-colors ${
              isSaved
                ? 'bg-surface-subtle text-emerald-400 border-border-subtle'
                : 'bg-accent-primary border-accent-primary text-white hover:bg-accent-hover'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="h-3 w-3" /> Synced
              </>
            ) : (
              <>
                <Save className="h-3 w-3" /> Save VFS
              </>
            )}
          </button>
        </div>
      </div>

      {/* Obsidian Frontmatter Metadata Bar */}
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-subtle/20 px-4 py-1.5 select-none overflow-x-auto text-[10px] font-mono text-content-tertiary">
        <span className="flex items-center gap-1 text-content-secondary">
          <Tag className="h-2.5 w-2.5" /> Tags:
        </span>
        {tags.length === 0 ? (
          <span className="italic opacity-60">None (use #tag in note)</span>
        ) : (
          tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 rounded border border-border-subtle bg-surface-subtle/60 px-1.5 py-0.2 text-accent-primary"
            >
              <Hash className="h-2 w-2 opacity-50" />
              {tag.replace('#', '')}
            </span>
          ))
        )}
        <span className="ml-auto opacity-50">{wordsCount} words · {readingTimeMin} min read</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {viewMode === 'edit' ? (
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="h-full w-full resize-none bg-transparent font-mono text-xs leading-relaxed text-content-primary outline-none placeholder:text-content-tertiary"
            placeholder="Type your markdown notes here..."
            autoFocus
            spellCheck={false}
          />
        ) : (
          <div className="h-full w-full font-sans select-text">
            {renderMarkdown(content)}
          </div>
        )}
      </div>

      {/* Obsidian Technical Status Bar */}
      <div className="flex items-center justify-between border-t border-border-subtle bg-surface-overlay/90 px-3.5 py-1 text-[9px] font-mono text-content-tertiary select-none">
        <div className="flex items-center gap-3">
          <span>{wordsCount} words</span>
          <span>{charsCount} characters</span>
          <span>~{readingTimeMin}m read</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Win: {windowId.slice(-4)}</span>
          <span>UTF-8</span>
          <span>Markdown</span>
          <span className="text-accent-primary">VFS IndexedDB</span>
        </div>
      </div>
    </div>
  );
};

export const notesManifest: AppManifest = {
  id: 'notes',
  name: 'Notes',
  description: 'Obsidian-inspired markdown workspace with reading views and VFS persistence.',
  category: 'productivity',
  icon: FileText,
  defaultSize: { width: 560, height: 440 },
  constraints: { minWidth: 380, minHeight: 280, maxWidth: 900, maxHeight: 720 },
  allowMultipleInstances: true,
  permissions: ['vfs:read', 'vfs:write'],
  component: NotesApp,
};
