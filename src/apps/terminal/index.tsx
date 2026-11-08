import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Copy,
  Check,
  Clock,
  GitBranch,
  Folder,
  ChevronRight,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { executeCommand } from './shell';
import { vfs } from '@core/vfs/vfsService';

interface TerminalBlock {
  id: string;
  command: string;
  output: string;
  cwd: string;
  timestamp: string;
  durationMs: number;
}

const COMMAND_SUGGESTIONS = [
  'help', 'pwd', 'ls', 'cd', 'cat', 'cp', 'mv', 'rm', 'touch', 'mkdir',
  'echo', 'tree', 'find', 'grep', 'wc', 'head', 'tail', 'sort', 'uniq',
  'tr', 'which', 'whoami', 'hostname', 'uname', 'date', 'uptime', 'env',
  'export', 'unset', 'ping', 'curl', 'calc', 'df', 'free', 'device', 'mount', 'open',
  'eval', 'run', 'node', 'python', 'python3', 'git', 'npm', 'neofetch', 'fastfetch',
  'history', 'man', 'code', 'nano', 'vim', 'ps', 'kill', 'pkg', 'clear', 'cls',
];

const TerminalApp: React.FC<AppProps> = ({ windowId }) => {
  const [cwd, setCwd] = useState('/home/user');
  const [blocks, setBlocks] = useState<TerminalBlock[]>([
    {
      id: 'block-welcome',
      command: 'flowsh --version',
      output:
        'FlowOS Warp Terminal (flowsh) v0.2.0-pro\nArchitecture: x86_64-synthetic-wasm\nVirtual File System: IndexedDB (POSIX Compliant)\nType "help" to view all available commands.',
      cwd: '/home/user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      durationMs: 1,
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new output
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [blocks]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const line = inputVal.trim();
      if (!line) return;

      if (line === 'clear' || line === 'cls') {
        setBlocks([]);
        setInputVal('');
        setCommandHistory((prev) => [...prev, line]);
        setHistoryIdx(-1);
        return;
      }

      const startTime = performance.now();
      const res = await executeCommand(line, cwd, [...commandHistory, line]);
      const durationMs = Math.max(1, Math.round(performance.now() - startTime));

      const newBlock: TerminalBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        command: line,
        output: res.output,
        cwd,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        durationMs,
      };

      if (res.newCwd) {
        setCwd(res.newCwd);
      }

      setBlocks((prev) => [...prev, newBlock]);
      setCommandHistory((prev) => [...prev, line]);
      setHistoryIdx(-1);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx =
        historyIdx === -1 ? commandHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(commandHistory[nextIdx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(commandHistory[nextIdx] ?? '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputVal;
      if (!current) return;
      const parts = current.split(' ');
      if (parts.length === 1) {
        const prefix = (parts[0] ?? '').toLowerCase();
        const matches = COMMAND_SUGGESTIONS.filter((cmd) => cmd.startsWith(prefix));
        if (matches.length === 1 && matches[0]) {
          setInputVal(matches[0] + ' ');
        } else if (matches.length > 1) {
          let common = prefix;
          let idx = prefix.length;
          while (true) {
            const nextChar = matches[0]?.[idx];
            if (!nextChar) break;
            if (matches.every((m) => m[idx] === nextChar)) {
              common += nextChar;
              idx++;
            } else {
              break;
            }
          }
          setInputVal(common);
        }
      } else {
        const lastPart = parts[parts.length - 1] ?? '';
        try {
          const isSlash = lastPart.includes('/');
          let dirToSearch = cwd;
          let filePrefix = lastPart;
          if (isSlash) {
            const lastSlash = lastPart.lastIndexOf('/');
            const dirPart = lastPart.slice(0, lastSlash);
            filePrefix = lastPart.slice(lastSlash + 1);
            dirToSearch = dirPart.startsWith('/') ? dirPart : `${cwd}/${dirPart}`;
          }
          const nodes = await vfs.readDir(dirToSearch);
          const matches = nodes.filter((n) => n.name.toLowerCase().startsWith(filePrefix.toLowerCase()));
          if (matches.length === 1 && matches[0]) {
            const completed = matches[0].name + (matches[0].type === 'directory' ? '/' : ' ');
            const prefixPath = isSlash ? lastPart.slice(0, lastPart.lastIndexOf('/') + 1) : '';
            parts[parts.length - 1] = prefixPath + completed;
            setInputVal(parts.join(' '));
          }
        } catch {
          // ignore autocomplete errors
        }
      }
    }
  };

  const handleCopyOutput = (block: TerminalBlock) => {
    navigator.clipboard.writeText(block.output);
    setCopiedBlockId(block.id);
    setTimeout(() => setCopiedBlockId(null), 1500);
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex h-full w-full flex-col bg-surface-canvas text-content-primary select-text"
    >
      {/* Warp Top Session Bar */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-overlay/90 px-3.5 py-1.5 font-mono text-[10px] text-content-tertiary select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-3.5 w-3.5 text-accent-primary" />
          <span className="text-content-primary font-medium">flowsh</span>
          <span className="opacity-40">//</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            zsh-mode
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-content-secondary">
            <GitBranch className="h-3 w-3 text-accent-primary" />
            main
          </span>
          <span>win: {windowId.slice(-4)}</span>
        </div>
      </div>

      {/* Warp Block Command Execution Feed */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs"
      >
        {blocks.map((block) => (
          <div
            key={block.id}
            className="group relative rounded-lg border border-border-subtle bg-surface-panel/90 shadow-sm transition-all hover:border-border-strong"
          >
            {/* Warp Block Header Bar */}
            <div className="flex items-center justify-between border-b border-border-subtle/60 bg-surface-subtle/30 px-3 py-1.5 text-[10px] text-content-tertiary select-none">
              <div className="flex items-center gap-2 truncate">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="flex items-center gap-1 text-content-secondary">
                  <Folder className="h-2.5 w-2.5 text-accent-primary" />
                  {block.cwd.replace('/home/user', '~')}
                </span>
                <span className="text-content-primary font-semibold truncate">
                  {block.command}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1 opacity-75">
                  <Clock className="h-2.5 w-2.5" />
                  {block.durationMs}ms
                </span>
                <span className="text-[9px] opacity-40">{block.timestamp}</span>

                {/* Warp Copy Action on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyOutput(block);
                  }}
                  title="Copy Block Output"
                  className="ml-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 rounded bg-surface-subtle border border-border-subtle px-1.5 py-0.5 text-[9px] text-content-secondary hover:bg-surface-overlay hover:text-content-primary transition-all"
                >
                  {copiedBlockId === block.id ? (
                    <>
                      <Check className="h-2.5 w-2.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-2.5 w-2.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Block Output Body */}
            {block.output && (
              <div className="p-3">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-content-secondary">
                  {block.output}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Warp Prompt Bar (Modern Developer Input) */}
      <div className="border-t border-border-subtle bg-surface-overlay/90 p-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-panel px-3 py-2 shadow-inner focus-within:border-accent-primary/60 focus-within:ring-1 focus-within:ring-accent-primary/30 transition-all">
          {/* Path Badge */}
          <div className="flex items-center gap-1 rounded bg-surface-subtle border border-border-subtle px-2 py-0.5 font-mono text-[10px] text-content-secondary select-none shrink-0">
            <Folder className="h-3 w-3 text-accent-primary" />
            <span>{cwd.replace('/home/user', '~')}</span>
          </div>

          {/* Git Branch Badge */}
          <div className="flex items-center gap-1 rounded bg-accent-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-accent-hover select-none shrink-0">
            <GitBranch className="h-2.5 w-2.5" />
            <span>main</span>
          </div>

          <ChevronRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />

          {/* Terminal Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command (try 'ls', 'ps', 'help')..."
            autoFocus
            className="flex-1 bg-transparent font-mono text-xs text-content-primary placeholder:text-content-tertiary outline-none caret-accent-primary"
          />
        </div>
      </div>
    </div>
  );
};

export const terminalManifest: AppManifest = {
  id: 'terminal',
  name: 'Terminal',
  description: 'Warp-inspired developer terminal with block-based command execution cards.',
  category: 'development',
  icon: TerminalIcon,
  defaultSize: { width: 620, height: 420 },
  constraints: { minWidth: 400, minHeight: 280, maxWidth: 1100, maxHeight: 850 },
  allowMultipleInstances: true,
  permissions: ['vfs:read', 'vfs:write'],
  component: TerminalApp,
};
