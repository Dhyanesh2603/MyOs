import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { executeCommand } from './shell';

interface TerminalHistoryItem {
  command: string;
  output: string;
}

const TerminalApp: React.FC<AppProps> = ({ windowId }) => {
  const [cwd, setCwd] = useState('/home/user');
  const [history, setHistory] = useState<TerminalHistoryItem[]>([
    {
      command: '',
      output:
        'FlowOS Synthetic Shell (flowsh) v0.1.0\nType "help" for available commands.\nFilesystem backed by IndexedDB VFS.',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new output
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const line = inputVal.trim();
      if (!line) {
        setHistory((prev) => [...prev, { command: '', output: '' }]);
        return;
      }

      if (line === 'clear') {
        setHistory([]);
        setInputVal('');
        setCommandHistory((prev) => [...prev, line]);
        setHistoryIdx(-1);
        return;
      }

      const res = await executeCommand(line, cwd);
      if (res.newCwd) {
        setCwd(res.newCwd);
      }

      setHistory((prev) => [...prev, { command: line, output: res.output }]);
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
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex h-full w-full flex-col bg-[#0b0c10] p-3.5 font-mono text-xs text-content-primary"
    >
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 select-text"
      >
        {history.map((item, index) => (
          <div key={index} className="space-y-1">
            {item.command && (
              <div className="flex items-center gap-1.5 text-content-tertiary">
                <span className="text-emerald-400 font-semibold">user@flow:</span>
                <span className="text-accent-primary">{cwd}$</span>
                <span className="text-content-primary">{item.command}</span>
              </div>
            )}
            {item.output && (
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-content-secondary">
                {item.output}
              </pre>
            )}
          </div>
        ))}

        {/* Active Command Line Input */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-emerald-400 font-semibold">user@flow:</span>
          <span className="text-accent-primary">{cwd}$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent text-xs text-content-primary outline-none font-mono caret-accent-primary"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px] text-content-tertiary">
        <span>flowsh 0.1</span>
        <span>win: {windowId.slice(-6)}</span>
      </div>
    </div>
  );
};

export const terminalManifest: AppManifest = {
  id: 'terminal',
  name: 'Terminal',
  description: 'Interactive UNIX-like shell connected directly to the browser VFS.',
  category: 'development',
  icon: TerminalIcon,
  defaultSize: { width: 560, height: 380 },
  constraints: { minWidth: 380, minHeight: 260, maxWidth: 1000, maxHeight: 800 },
  allowMultipleInstances: true,
  permissions: ['vfs:read', 'vfs:write'],
  component: TerminalApp,
};
