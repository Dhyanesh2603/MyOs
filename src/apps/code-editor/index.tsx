import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  Save,
  Check,
  FilePlus,
  FolderOpen,
  FileCode,
  Play,
  RotateCw,
  Terminal as TerminalIcon,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useWindowStore } from '@core/window/windowStore';
import { normalizePath } from '@core/vfs/vfsService';
import { executeCode, type ExecutionResult } from '@core/runtime/codeRunner';
import { soundEngine } from '@core/audio/soundEngine';

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

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

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
        ? `/**\n * FlowOS Script Execution Engine\n * File: ${filePath}\n */\n\nfunction calculateMetrics() {\n  const startTime = Date.now();\n  const numbers = [12, 45, 68, 23, 89, 91, 14];\n  const sum = numbers.reduce((a, b) => a + b, 0);\n  const avg = Math.round(sum / numbers.length);\n\n  console.log("Processing array:", numbers);\n  console.info("Sum calculated:", sum);\n  console.info("Average:", avg);\n\n  return { sum, avg, count: numbers.length, duration: Date.now() - startTime };\n}\n\ncalculateMetrics();\n`
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
    soundEngine.playSnap();
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

  const handleRunCode = async () => {
    setIsRunning(true);
    setShowConsole(true);
    soundEngine.playClick();
    try {
      const result = await executeCode(content);
      setExecutionResult(result);
      if (result.success) {
        soundEngine.playSnap();
      } else {
        soundEngine.playAlert();
      }
    } catch (e: any) {
      setExecutionResult({
        success: false,
        logs: [],
        durationMs: 0,
        error: String(e?.message || e),
      });
      soundEngine.playAlert();
    } finally {
      setIsRunning(false);
    }
  };

  // Keyboard shortcut: Ctrl+S to save, Alt+R or Ctrl+Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeWindowId !== windowId) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      if ((e.altKey && e.key.toLowerCase() === 'r') || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        handleRunCode();
        return;
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
          <FileCode className="h-3.5 w-3.5 text-accent" />
          <span className="font-sans font-medium text-content-primary">{fileName}</span>
          <span className={`rounded border px-1.5 py-0.2 font-mono text-[9px] font-medium ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-[10px] text-content-tertiary truncate max-w-[140px] sm:max-w-xs">
            {filePath}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            title="Run Code (Alt+R or Ctrl+Enter)"
            className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-500/60 active:scale-95 transition-all shadow-xs"
          >
            {isRunning ? (
              <RotateCw className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3 fill-current" />
            )}
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          {/* Console Drawer Toggle */}
          <button
            onClick={() => setShowConsole(!showConsole)}
            title="Toggle Console Drawer"
            className={`flex items-center gap-1 rounded border border-border-subtle px-2 py-1 text-[10px] transition-colors ${
              showConsole
                ? 'bg-surface-panel text-accent border-accent/40'
                : 'bg-surface-subtle/50 text-content-secondary hover:bg-surface-subtle hover:text-content-primary'
            }`}
          >
            <TerminalIcon className="h-3 w-3" />
            <span className="hidden sm:inline">Console</span>
            {showConsole ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>

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
                : 'border-accent bg-accent text-accent-fg hover:opacity-90 active:scale-95'
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
                cursorPos.line === i + 1 ? 'font-bold text-accent' : 'opacity-40'
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
          className="h-full flex-1 resize-none bg-transparent p-3 font-mono text-xs leading-5 text-content-primary focus:outline-none selection:bg-accent/20 whitespace-pre"
        />

        {/* Slide-Up Execution Output Console Drawer */}
        {showConsole && (
          <div className="absolute bottom-0 left-0 right-0 z-30 flex max-h-[48%] min-h-[160px] flex-col border-t border-border-subtle bg-surface-panel/95 shadow-2xl backdrop-blur-xl transition-all">
            {/* Console Header */}
            <div className="flex items-center justify-between border-b border-border-subtle bg-surface-subtle/70 px-3 py-1.5">
              <div className="flex items-center gap-2">
                <TerminalIcon className="h-3.5 w-3.5 text-accent" />
                <span className="font-sans font-semibold text-[11px] text-content-primary">
                  Execution Output
                </span>
                {executionResult && (
                  <span
                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-mono ${
                      executionResult.success
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {executionResult.success ? (
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    ) : (
                      <AlertCircle className="h-2.5 w-2.5" />
                    )}
                    <span>{executionResult.durationMs}ms</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExecutionResult(null)}
                  title="Clear Console Output"
                  className="rounded p-1 text-content-tertiary hover:bg-surface-hover hover:text-content-primary transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setShowConsole(false)}
                  className="rounded p-1 text-content-tertiary hover:bg-surface-hover hover:text-content-primary transition-colors"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Console Log Body */}
            <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1 select-text">
              {!executionResult && !isRunning && (
                <div className="text-content-tertiary">
                  Ready. Click &quot;Run&quot; or press Alt+R to execute code.
                </div>
              )}

              {isRunning && (
                <div className="flex items-center gap-2 text-accent animate-pulse">
                  <RotateCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Executing script inside isolated worker sandbox...</span>
                </div>
              )}

              {executionResult?.logs.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${
                    log.level === 'error'
                      ? 'text-red-400'
                      : log.level === 'warn'
                      ? 'text-amber-300'
                      : 'text-content-primary'
                  }`}
                >
                  <span className="opacity-40 text-[9px]">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span className="opacity-60 text-[9px] uppercase">[{log.level}]</span>
                  <span className="whitespace-pre-wrap">{log.message}</span>
                </div>
              ))}

              {executionResult?.error && (
                <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-red-400 whitespace-pre-wrap">
                  {executionResult.error}
                </div>
              )}

              {executionResult?.returnValue !== undefined && (
                <div className="mt-2 flex items-start gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-300">
                  <span className="font-bold opacity-75">=&gt; Return:</span>
                  <span className="whitespace-pre-wrap">{executionResult.returnValue}</span>
                </div>
              )}
            </div>
          </div>
        )}
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
          <span>Alt+R to run • Ctrl+S to save</span>
        </div>
      </div>
    </div>
  );
};

export const codeEditorManifest: AppManifest = {
  id: 'code-editor',
  name: 'Code Editor',
  description: 'Monospaced developer code and config editor with live WebWorker runner and console output.',
  category: 'development',
  icon: Code2,
  defaultSize: { width: 720, height: 520 },
  constraints: { minWidth: 460, minHeight: 320, maxWidth: 1400, maxHeight: 1000 },
  allowMultipleInstances: true,
  permissions: ['vfs:read', 'vfs:write'],
  component: CodeEditorApp,
};
