import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Copy,
  Check,
  Terminal,
  Code2,
  FileText,
  Activity,
  Cpu,
} from 'lucide-react';
import { useCopilotStore } from '@core/copilot/copilotStore';
import { useWindowStore } from '@core/window/windowStore';
import { soundEngine } from '@core/audio/soundEngine';

export const CopilotDrawer: React.FC = () => {
  const { isOpen, closeCopilot, messages, isThinking, sendMessage, clearHistory } = useCopilotStore();
  const { activeWindowId, windows } = useWindowStore();

  const [inputVal, setInputVal] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeWin = activeWindowId ? windows[activeWindowId] : undefined;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    soundEngine.playClick();
    const txt = inputVal;
    setInputVal('');
    sendMessage(txt);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    soundEngine.playClick();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptChips = [
    { label: 'Explain Active Window', icon: Code2, prompt: 'Explain the active window and context' },
    { label: 'Terminal Automation Script', icon: Terminal, prompt: 'Generate a flowsh terminal script' },
    { label: 'Draft Sprint Notes', icon: FileText, prompt: 'Draft a quick structured note' },
    { label: 'System Health Check', icon: Activity, prompt: 'Run a system health and process diagnosis' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCopilot}
            className="fixed inset-0 z-[9600] bg-black/40 backdrop-blur-sm"
          />

          {/* Slide-out Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-8 right-0 bottom-0 z-[9650] flex w-full max-w-[420px] flex-col border-l border-border-subtle bg-surface-panel/95 text-content-primary shadow-2xl backdrop-blur-2xl"
          >
            {/* Top Bar Header */}
            <div className="flex h-12 items-center justify-between border-b border-border-subtle/80 px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-primary/15 text-accent-primary border border-accent-primary/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-content-primary">
                    <span>FlowOS Copilot</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d71921]" />
                  </div>
                  <div className="font-mono text-[10px] text-content-tertiary">
                    Raycast Intelligence sidecar
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    clearHistory();
                  }}
                  title="Clear conversation"
                  className="rounded p-1.5 text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    closeCopilot();
                  }}
                  title="Close (Esc)"
                  className="rounded p-1.5 text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Context Badge */}
            <div className="flex items-center gap-2 border-b border-border-subtle/40 bg-surface-subtle/30 px-4 py-2 text-[11px] text-content-secondary">
              <Cpu className="h-3.5 w-3.5 text-accent-primary" />
              <span className="truncate">
                Context: <strong className="font-medium text-content-primary">{activeWin ? activeWin.title : 'Desktop Surface'}</strong>
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-accent-primary text-white shadow-sm rounded-br-none'
                        : 'border border-border-subtle/80 bg-surface-card/90 text-content-primary rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.codeBlock && (
                      <div className="mt-2.5 overflow-hidden rounded-xl border border-border-subtle bg-black/40 text-[11px]">
                        <div className="flex items-center justify-between border-b border-border-subtle/60 bg-white/5 px-2.5 py-1 text-content-tertiary font-mono text-[10px]">
                          <span>{msg.codeLanguage || 'code'}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyCode(msg.id, msg.codeBlock!)}
                              className="flex items-center gap-1 hover:text-content-primary transition-colors"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <pre className="overflow-x-auto p-3 font-mono text-content-secondary">
                          <code>{msg.codeBlock}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                  <span className="mt-1 font-mono text-[9px] text-content-tertiary px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-content-tertiary text-xs">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-subtle border border-border-subtle">
                    <Sparkles className="h-3.5 w-3.5 text-accent-primary animate-spin" />
                  </div>
                  <span className="font-mono text-[11px] animate-pulse">Copilot reasoning...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="border-t border-border-subtle/60 px-3 py-2">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {promptChips.map((chip, idx) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        soundEngine.playClick();
                        sendMessage(chip.prompt);
                      }}
                      className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-border-subtle bg-surface-card/60 px-2.5 py-1 text-[10px] text-content-secondary hover:border-accent-primary/40 hover:bg-surface-subtle hover:text-content-primary transition-colors"
                    >
                      <Icon className="h-3 w-3 text-accent-primary" />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Input Field */}
            <div className="border-t border-border-subtle p-3 bg-surface-panel/90">
              <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-3 py-1.5 focus-within:border-accent-primary transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                  placeholder="Ask Copilot or type a command..."
                  className="flex-1 bg-transparent text-xs text-content-primary placeholder:text-content-tertiary focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputVal.trim()}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent-primary text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between px-1 font-mono text-[9px] text-content-tertiary">
                <span>Press Enter to send • Shift+Esc to close</span>
                <span>FlowOS Enclave Safe</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
