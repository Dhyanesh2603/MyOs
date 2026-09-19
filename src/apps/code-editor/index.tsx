import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  Save,
  Check,
  FilePlus,
  FolderOpen,
  FileCode,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useWindowStore } from '@core/window/windowStore';
import { normalizePath } from '@core/vfs/vfsService';

const getLanguageBadge = (path: string): { label: string; color: string } => {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'json':
      return { label: 'JSON', color: 'text-amber-400 border-amber-400/20 bg-amber-400/10' };
    case 'js':
    case 'jsx':
      return { label: 'JavaScript', color: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' };
    case 'ts':
    case 'tsx':
      return { label: 'TypeScript', color: 'text-sky-400 border-sky-400/20 bg-sky-400/10' };
    case 'css':
      return { label: 'CSS', color: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10' };
    case 'html':
      return { label: 'HTML', color: 'text-orange-400 border-orange-400/20 bg-orange-400/10' };
    case 'sh':
    case 'bash':
      return { label: 'Shell', color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' };
    case 'md':
      return { label: 'Markdown', color: 'text-purple-400 border-purple-400/20 bg-purple-400/10' };
    default:
      return { label: 'Plain Text', color: 'text-content-tertiary border-border-subtle bg-surface-subtle' };
  }
};

export const CodeEditorApp: React.FC<AppProps> = ({ windowId, processId }) => {
  const customState = useWindowStore(
    (state) => state.windows[windowId]?.customState as { initialData?: { filePath?: string } } | undefined
  );
  const activeWindowId = useWindowStore((state) => state.activeWindowId);

  const initialPath = customState?.initialData?.filePath || `/home/user/script-${processId.slice(-4)}.js`;
  const [filePath, setFilePath] = useState<string>(initialPath);
  const [content, setContent] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const { nodes, readFile, writeFile } = useVFSStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Load file content from VFS
  useEffect(() => {
    if (nodes[filePath]) {
      readFile(filePath)
        .then((text) => {
          setContent(text);
          setIsSaved(true);
        })
        .catch(() => {});
    } else {
      // Default boilerplate if new file
      const defaultContent = filePath.endsWith('.json')
        ? `{\n  "name": "flow-app",\n  "version": "1.0.0",\n  "private": true,\n  "scripts": {\n    "build": "flow-compiler"\n  }\n}`
        : filePath.endsWith('.js') || filePath.endsWith('.ts')
        ? `/**\n * FlowOS Script Engine\n * File: ${filePath}\n */\n\nfunction main() {\n  const message = "Hello from FlowOS Code Editor";\n  console.log(message);\n  return message;\n}\n\nmain();\n`
        : `// FlowOS Source File: ${filePath}\n`;

      setContent(defaultContent);
      setIsSaved(false);
    }
  }, [filePath, nodes, readFile]);

  // Synchronize scroll between textarea and line numbers gutter
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleCursorMove = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const textBefore = textarea.value.slice(0, pos);
    const lines = textBefore.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1]?.length ? lines[lines.length - 1]!.length + 1 : 1;
    setCursorPos({ line, col });
  };

  const handleSave = async () => {
    await writeFile(filePath, content);
    setIsSaved(true);
  };

  const handleNewFile = () => {
    const name = window.prompt('Enter new file path:', '/home/user/new-script.js');
    if (!name?.trim()) return;
    const normalized = normalizePath(name.trim());
    setFilePath(normalized);
  };

  const handleOpenFile = () => {
    const name = window.prompt('Enter file path to open:', filePath);
    if (!name?.trim()) return;
    const normalized = normalizePath(name.trim());
    setFilePath(normalized);
  };

  // Keyboard shortcut: Ctrl+S or Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeWindowId !== windowId) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWindowId, windowId, filePath, content]);

  const lines = content.split('\n');
  const lineCount = Math.max(1, lines.length);
  const badge = getLanguageBadge(filePath);
  const fileName = filePath.split('/').pop() || 'Untitled';

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel text-content-primary select-none text-xs font-mono">
      {/* Editor Action Header */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-overlay/90 px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <FileCode className="h-3.5 w-3.5 text-accent-primary" />
          <span className="font-sans font-medium text-content-primary">{fileName}</span>
          <span className={`rounded border px-1.5 py-0.2 font-mono text-[9px] font-medium ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-[10px] text-content-tertiary truncate max-w-[180px] sm:max-w-xs">
            {filePath}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleOpenFile}
            title="Open File"
            className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle/50 px-2 py-1 text-[10px] text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
          >
            <FolderOpen className="h-3 w-3" />
            <span className="hidden sm:inline">Open</span>
          </button>

          <button
            onClick={handleNewFile}
            title="New File"
            className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle/50 px-2 py-1 text-[10px] text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
          >
            <FilePlus className="h-3 w-3" />
            <span className="hidden sm:inline">New</span>
          </button>

          <button
            onClick={handleSave}
            title="Save (Ctrl+S)"
            className={`flex items-center gap-1 rounded border px-2.5 py-1 text-[10px] font-medium transition-all shadow-sm ${
              isSaved
                ? 'border-border-subtle bg-surface-subtle text-emerald-400'
                : 'border-accent-primary bg-accent-primary text-white hover:bg-accent-hover active:scale-95'
            }`}
          >
            {isSaved ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Code Editing Canvas with Line Numbers Gutter */}
      <div className="relative flex flex-1 overflow-hidden bg-surface-panel">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 select-none overflow-hidden border-r border-border-subtle bg-surface-overlay/50 py-3 pr-2 text-right font-mono text-xs text-content-tertiary"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              className={`h-5 leading-5 ${
                cursorPos.line === i + 1 ? 'font-bold text-accent-primary' : 'opacity-40'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setIsSaved(false);
          }}
          onScroll={handleScroll}
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          spellCheck={false}
          className="h-full flex-1 resize-none bg-transparent p-3 font-mono text-xs leading-5 text-content-primary focus:outline-none selection:bg-accent-primary/20 whitespace-pre"
        />
      </div>

      {/* Editor Status Bar */}
      <div className="flex items-center justify-between border-t border-border-subtle bg-surface-overlay/80 px-3 py-1 font-mono text-[10px] text-content-tertiary select-none">
        <div className="flex items-center gap-3">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>{lineCount} lines</span>
          <span>{content.length} chars</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>{badge.label}</span>
          <span>Ctrl+S to save</span>
        </div>
      </div>
    </div>
  );
};

export const codeEditorManifest: AppManifest = {
  id: 'code-editor',
  name: 'Code Editor',
  description: 'Monospaced developer code and config editor with syntax badges and line numbers.',
  category: 'development',
  icon: Code2,
  defaultSize: { width: 680, height: 490 },
  constraints: { minWidth: 420, minHeight: 300, maxWidth: 1200, maxHeight: 900 },
  allowMultipleInstances: true,
  permissions: ['vfs:read', 'vfs:write'],
  component: CodeEditorApp,
};
