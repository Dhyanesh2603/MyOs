import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PenLine,
  Code2,
  History,
  X,
  Copy,
  Check,
  Trash2,
  Sparkles,
  ArrowUpRight,
  FolderGit2,
  Binary,
  Target,
  FileDown,
} from 'lucide-react';
import { useScratchpadStore } from '@core/scratchpad/scratchpadStore';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { soundEngine } from '@core/audio/soundEngine';

export const ScratchpadDrawer: React.FC = () => {
  const {
    isOpen,
    setOpen,
    activeMode,
    setActiveMode,
    scratchText,
    setScratchText,
    codeText,
    setCodeText,
    codeLanguage,
    setCodeLanguage,
    history,
    saveCurrentToHistory,
    deleteHistoryItem,
    loadHistoryItem,
    clearCurrent,
  } = useScratchpadStore();

  const { addMission, addProjectIssue, addDsaMistakeNote, projects } = usePersonalOsStore();
  const { notify } = useNotificationStore();

  const [copied, setCopied] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-focus editor when drawer opens
  useEffect(() => {
    if (isOpen) {
      soundEngine.playSnap();
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeMode]);

  // Keyboard accessibility inside drawer
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
    }
    // Ctrl+Enter / Cmd+Enter: Save to History
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      saveCurrentToHistory();
      soundEngine.playClick();
      notify({
        title: 'Scratchpad Saved',
        message: 'Current note added to scratch history.',
        type: 'success',
      });
    }
  };

  const handleCopy = () => {
    const text = activeMode === 'code' ? codeText : scratchText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundEngine.playClick();
    notify({
      title: 'Copied to Clipboard',
      message: `${text.length} characters copied.`,
      type: 'info',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Promotion Actions to Onyx OS v2 Personal Operating System
  const handlePromoteToMission = () => {
    const content = (activeMode === 'code' ? codeText : scratchText).trim();
    if (!content) return;

    const firstLine = content.split('\n')[0]?.replace(/^[#\s\-/]+/, '') || 'Personal OS Objective';
    const title = firstLine.slice(0, 60);
    const tagline = content.split('\n').slice(1, 4).join(' ').trim().slice(0, 100) || 'Promoted from Quick Scratchpad';

    addMission(title, tagline);
    saveCurrentToHistory();
    soundEngine.playSnap();
    notify({
      title: 'Promoted to Mission',
      message: `Mission "${title}" initialized in Personal OS.`,
      type: 'success',
    });
  };

  const handlePromoteToProjectIssue = () => {
    const content = (activeMode === 'code' ? codeText : scratchText).trim();
    if (!content) return;

    const firstLine = content.split('\n')[0]?.replace(/^[#\s\-/]+/, '') || 'Issue captured in scratchpad';
    const targetProject = projects[0];
    const projectId = targetProject?.id || 'proj-flow-os-v2';

    addProjectIssue(projectId, firstLine.slice(0, 80));
    saveCurrentToHistory();
    soundEngine.playClick();
    notify({
      title: 'Logged to Project Studio',
      message: `Issue attached to "${targetProject?.name || 'Onyx OS'}".`,
      type: 'success',
    });
  };

  const handlePromoteToDsaNote = () => {
    const content = (activeMode === 'code' ? codeText : scratchText).trim();
    if (!content) return;

    const firstLine = content.split('\n')[0]?.replace(/^[#\s\-/]+/, '') || 'DSA Takeaway';
    const mistakeNote = content.slice(0, 200);

    addDsaMistakeNote(firstLine.slice(0, 60), mistakeNote);
    saveCurrentToHistory();
    soundEngine.playClick();
    notify({
      title: 'Logged to DSA Mistake Notebook',
      message: `Key pattern recorded for revision review.`,
      type: 'success',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Backdrop Dimmer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[9600] bg-black/40 backdrop-blur-[2px]"
          />

          {/* Slide-in Scratchpad Drawer from Right Edge */}
          <motion.aside
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            onKeyDown={handleKeyDown}
            className="fixed top-0 right-0 bottom-0 z-[9700] flex w-full max-w-[480px] flex-col border-l border-border-subtle bg-surface-panel/95 shadow-2xl backdrop-blur-2xl text-content-primary"
          >
            {/* Header Rail */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtle px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                  <PenLine className="h-3.5 w-3.5" />
                </div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-content-primary">
                  Scratchpad
                </span>
                <span className="rounded bg-surface-subtle px-1.5 py-0.5 font-mono text-[10px] text-content-tertiary">
                  Ctrl + \
                </span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center rounded-lg border border-border-subtle bg-surface-base/80 p-0.5 text-xs">
                <button
                  onClick={() => {
                    setActiveMode('scratch');
                    soundEngine.playClick();
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                    activeMode === 'scratch'
                      ? 'bg-surface-panel text-content-primary shadow-sm'
                      : 'text-content-secondary hover:text-content-primary'
                  }`}
                >
                  <PenLine className="h-3 w-3" />
                  Notes
                </button>
                <button
                  onClick={() => {
                    setActiveMode('code');
                    soundEngine.playClick();
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                    activeMode === 'code'
                      ? 'bg-surface-panel text-content-primary shadow-sm'
                      : 'text-content-secondary hover:text-content-primary'
                  }`}
                >
                  <Code2 className="h-3 w-3" />
                  Code
                </button>
                <button
                  onClick={() => {
                    setActiveMode('history');
                    soundEngine.playClick();
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                    activeMode === 'history'
                      ? 'bg-surface-panel text-content-primary shadow-sm'
                      : 'text-content-secondary hover:text-content-primary'
                  }`}
                >
                  <History className="h-3 w-3" />
                  History
                  {history.length > 0 && (
                    <span className="ml-0.5 rounded-full bg-accent-primary/20 px-1 text-[9px] text-accent-primary">
                      {history.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close Scratchpad"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-content-tertiary transition-colors hover:bg-surface-subtle hover:text-content-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sub-toolbar for Code/Notes modes */}
            {activeMode !== 'history' && (
              <div className="flex h-9 shrink-0 items-center justify-between border-b border-border-subtle/80 bg-surface-subtle/30 px-4 text-xs">
                {activeMode === 'scratch' ? (
                  <div className="flex items-center gap-2 text-content-secondary text-[11px]">
                    <span className="font-mono">Markdown Engine</span>
                    <button
                      onClick={() => setIsPreview(!isPreview)}
                      className="rounded border border-border-subtle bg-surface-panel px-2 py-0.5 font-mono text-[10px] text-content-primary transition-colors hover:border-accent-primary"
                    >
                      {isPreview ? 'Edit Source' : 'Live Preview'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-content-secondary">Language:</span>
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="rounded border border-border-subtle bg-surface-panel px-2 py-0.5 font-mono text-[10px] text-content-primary focus:outline-none focus:border-accent-primary"
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="rust">Rust</option>
                      <option value="sql">SQL</option>
                      <option value="json">JSON</option>
                      <option value="bash">Bash</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] text-content-secondary transition-colors hover:bg-surface-panel hover:text-content-primary"
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => {
                      saveCurrentToHistory();
                      soundEngine.playClick();
                      notify({
                        title: 'Saved to History',
                        message: 'Snapshot created in scratch history.',
                        type: 'info',
                      });
                    }}
                    className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] text-content-secondary transition-colors hover:bg-surface-panel hover:text-content-primary"
                    title="Save Snapshot (Ctrl+Enter)"
                  >
                    <FileDown className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={clearCurrent}
                    className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] text-content-secondary transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                    title="Clear Buffer"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Central Content Area */}
            <div className="relative flex-1 overflow-auto p-4">
              {activeMode === 'scratch' ? (
                isPreview ? (
                  <div className="prose prose-invert max-w-none font-sans text-xs leading-relaxed text-content-primary">
                    {scratchText.split('\n').map((line, idx) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={idx} className="mt-2 mb-3 text-base font-bold text-content-primary">{line.replace('# ', '')}</h1>;
                      }
                      if (line.startsWith('## ')) {
                        return <h2 key={idx} className="mt-3 mb-2 text-sm font-semibold text-content-primary">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
                        const checked = line.startsWith('- [x] ');
                        return (
                          <div key={idx} className="my-1.5 flex items-center gap-2 font-mono text-xs">
                            <input type="checkbox" readOnly checked={checked} className="rounded border-border-strong text-accent-primary" />
                            <span className={checked ? 'line-through text-content-tertiary' : 'text-content-primary'}>
                              {line.slice(6)}
                            </span>
                          </div>
                        );
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <blockquote key={idx} className="my-2 border-l-2 border-accent-primary/60 pl-3 italic text-content-secondary">
                            {line.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      if (!line.trim()) {
                        return <div key={idx} className="h-2" />;
                      }
                      return <p key={idx} className="my-1">{line}</p>;
                    })}
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    value={scratchText}
                    onChange={(e) => setScratchText(e.target.value)}
                    placeholder="Capture quick thoughts, architecture decisions, code notes... (Markdown supported)"
                    className="h-full w-full resize-none bg-transparent font-sans text-xs leading-relaxed text-content-primary placeholder:text-content-tertiary focus:outline-none"
                    spellCheck={false}
                  />
                )
              ) : activeMode === 'code' ? (
                <textarea
                  ref={textareaRef}
                  value={codeText}
                  onChange={(e) => setCodeText(e.target.value)}
                  placeholder={`// Paste or draft quick ${codeLanguage} code snippets here...`}
                  className="h-full w-full resize-none bg-transparent font-mono text-xs leading-relaxed text-accent-primary placeholder:text-content-tertiary focus:outline-none"
                  spellCheck={false}
                />
              ) : (
                /* History Mode View */
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-[11px] text-content-secondary">
                    <span>Saved Snapshots ({history.length})</span>
                    <span className="font-mono text-[10px] text-content-tertiary">Stored locally</span>
                  </div>

                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-content-tertiary">
                      <History className="h-8 w-8 mb-2 opacity-40" />
                      <p>No saved snapshots yet.</p>
                      <p className="mt-1 text-[11px]">Press Ctrl+Enter while typing to save snapshots.</p>
                    </div>
                  ) : (
                    history.map((item) => (
                      <div
                        key={item.id}
                        className="group relative flex flex-col gap-1.5 rounded-lg border border-border-subtle bg-surface-base/60 p-3 transition-colors hover:border-border-strong hover:bg-surface-base"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-surface-subtle px-1.5 py-0.2 font-mono text-[9px] uppercase text-content-secondary">
                              {item.type === 'code' ? (item.language || 'code') : 'markdown'}
                            </span>
                            <span className="truncate font-medium text-xs text-content-primary">
                              {item.title}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-content-tertiary">
                            {item.timestamp}
                          </span>
                        </div>

                        <p className="line-clamp-2 font-mono text-[11px] text-content-secondary">
                          {item.content}
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => {
                              loadHistoryItem(item.id);
                              soundEngine.playClick();
                              notify({
                                title: 'Snapshot Loaded',
                                message: `Loaded into ${item.type} editor.`,
                                type: 'info',
                              });
                            }}
                            className="flex items-center gap-1 rounded bg-surface-subtle px-2 py-0.5 font-mono text-[10px] text-content-primary hover:bg-accent-primary hover:text-white transition-colors"
                          >
                            <ArrowUpRight className="h-3 w-3" />
                            Load
                          </button>
                          <button
                            onClick={() => {
                              deleteHistoryItem(item.id);
                              soundEngine.playClick();
                            }}
                            className="rounded p-1 text-content-tertiary hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                            title="Delete snapshot"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Bottom Linear-Style Personal OS Promotion Rail */}
            {activeMode !== 'history' && (
              <div className="shrink-0 border-t border-border-subtle bg-surface-base/90 p-3">
                <div className="flex items-center justify-between pb-2 text-[10px] font-mono text-content-tertiary uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-accent-primary" />
                    Promote to Onyx Personal OS
                  </span>
                  <span>1-Click Momentum</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handlePromoteToMission}
                    className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border-subtle bg-surface-panel/80 p-2 text-center transition-all hover:border-accent-primary/60 hover:bg-accent-primary/10 hover:text-accent-primary"
                    title="Promote first line to a high-priority Mission in Personal OS"
                  >
                    <Target className="h-4 w-4" />
                    <span className="font-mono text-[10px] font-medium">To Mission</span>
                  </button>

                  <button
                    onClick={handlePromoteToProjectIssue}
                    className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border-subtle bg-surface-panel/80 p-2 text-center transition-all hover:border-sky-500/60 hover:bg-sky-500/10 hover:text-sky-400"
                    title="Add as issue/task in Project Studio"
                  >
                    <FolderGit2 className="h-4 w-4" />
                    <span className="font-mono text-[10px] font-medium">To Project</span>
                  </button>

                  <button
                    onClick={handlePromoteToDsaNote}
                    className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border-subtle bg-surface-panel/80 p-2 text-center transition-all hover:border-amber-500/60 hover:bg-amber-500/10 hover:text-amber-400"
                    title="Log mistake pattern into DSA Workspace"
                  >
                    <Binary className="h-4 w-4" />
                    <span className="font-mono text-[10px] font-medium">To DSA Log</span>
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
