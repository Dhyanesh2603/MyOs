import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clipboard,
  Search,
  Pin,
  Trash2,
  X,
  Code2,
  Link,
  Palette,
  FileText,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  useClipboardStore,
  type ClipboardContentType,
  type ClipboardEntry,
} from '@core/clipboard/clipboardStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { soundEngine } from '@core/audio/soundEngine';

const TYPE_CONFIG: Record<
  ClipboardContentType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  text: { label: 'Text', icon: FileText, color: 'text-content-secondary bg-surface-subtle' },
  code: { label: 'Code', icon: Code2, color: 'text-sky-400 bg-sky-500/15' },
  url: { label: 'Link', icon: Link, color: 'text-emerald-400 bg-emerald-500/15' },
  color: { label: 'Color', icon: Palette, color: 'text-amber-400 bg-amber-500/15' },
  json: { label: 'JSON', icon: Code2, color: 'text-indigo-400 bg-indigo-500/15' },
};

export const ClipboardHistoryModal: React.FC = () => {
  const {
    isOpen,
    closeModal,
    entries,
    selectedId,
    setSelectedId,
    removeEntry,
    togglePin,
    clearHistory,
  } = useClipboardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'pinned'
          ? e.isPinned
          : e.type === activeFilter;

      const matchesSearch =
        !searchQuery.trim() ||
        e.content.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [entries, activeFilter, searchQuery]);

  const activeEntry =
    filteredEntries.find((e) => e.id === selectedId) ?? filteredEntries[0] ?? null;

  const handleCopy = (entry: ClipboardEntry) => {
    navigator.clipboard.writeText(entry.content).catch(() => {});
    setCopiedId(entry.id);
    soundEngine.playSnap();
    useNotificationStore.getState().notify({
      title: 'Copied to Clipboard',
      message: `${entry.content.slice(0, 35)}...`,
      type: 'success',
    });

    setTimeout(() => {
      setCopiedId(null);
      closeModal();
    }, 300);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = filteredEntries.findIndex((item) => item.id === activeEntry?.id);
        const nextIdx = (currentIndex + 1) % filteredEntries.length;
        const nextItem = filteredEntries[nextIdx];
        if (nextItem) setSelectedId(nextItem.id);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = filteredEntries.findIndex((item) => item.id === activeEntry?.id);
        const prevIdx = (currentIndex - 1 + filteredEntries.length) % filteredEntries.length;
        const prevItem = filteredEntries[prevIdx];
        if (prevItem) setSelectedId(prevItem.id);
        return;
      }

      if (e.key === 'Enter' && activeEntry) {
        e.preventDefault();
        handleCopy(activeEntry);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && (e.metaKey || e.ctrlKey) && activeEntry) {
        e.preventDefault();
        removeEntry(activeEntry.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredEntries, activeEntry, closeModal, setSelectedId, removeEntry]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9600] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="flex h-[520px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-panel/95 shadow-2xl backdrop-blur-2xl text-content-primary"
        >
          {/* Header & Search Bar */}
          <div className="flex flex-col border-b border-border-subtle p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clipboard className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold tracking-wide">
                  Clipboard Manager
                </span>
                <span className="rounded bg-surface-subtle px-2 py-0.5 font-mono text-[10px] text-content-tertiary">
                  Ctrl + Shift + V
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearHistory}
                  title="Clear unpinned clips"
                  className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-content-tertiary hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
                <button
                  onClick={closeModal}
                  className="rounded p-1 text-content-tertiary hover:bg-surface-hover hover:text-content-primary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Search Input Box */}
            <div className="relative mt-2.5 flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-content-tertiary" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search clips by keywords, colors, URLs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-surface-subtle/50 py-2 pl-9 pr-3 text-xs text-content-primary placeholder-content-tertiary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'pinned', label: 'Pinned' },
                { id: 'text', label: 'Text' },
                { id: 'code', label: 'Code' },
                { id: 'color', label: 'Colors' },
                { id: 'url', label: 'Links' },
                { id: 'json', label: 'JSON' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`rounded-lg px-2.5 py-0.5 font-medium transition-all ${
                    activeFilter === cat.id
                      ? 'bg-accent text-accent-fg shadow-xs'
                      : 'text-content-tertiary hover:bg-surface-hover hover:text-content-primary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Two-Pane Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Pane: Clip List */}
            <div className="w-1/2 overflow-y-auto border-r border-border-subtle p-2 space-y-1">
              {filteredEntries.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center text-content-tertiary text-xs">
                  No matching clips found.
                </div>
              ) : (
                filteredEntries.map((entry) => {
                  const isSelected = entry.id === activeEntry?.id;
                  const typeConf = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.text;
                  const TypeIcon = typeConf.icon;

                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedId(entry.id)}
                      onDoubleClick={() => handleCopy(entry)}
                      className={`group relative flex items-start justify-between rounded-xl p-2.5 cursor-pointer border transition-all ${
                        isSelected
                          ? 'border-accent/50 bg-accent/15 text-content-primary shadow-xs'
                          : 'border-transparent hover:border-border-subtle hover:bg-surface-subtle/50 text-content-secondary'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] ${typeConf.color}`}
                        >
                          <TypeIcon className="h-3 w-3" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-mono text-[11px] leading-tight text-content-primary break-all">
                            {entry.content}
                          </p>
                          <div className="mt-1 flex items-center gap-2 font-mono text-[9px] text-content-tertiary">
                            <span>{typeConf.label}</span>
                            <span>•</span>
                            <span>{entry.charCount} chars</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(entry.id);
                          }}
                          className={`rounded p-1 transition-colors ${
                            entry.isPinned
                              ? 'text-amber-400 opacity-100'
                              : 'text-content-tertiary hover:text-content-primary'
                          }`}
                          title={entry.isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin className={`h-3 w-3 ${entry.isPinned ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEntry(entry.id);
                          }}
                          className="rounded p-1 text-content-tertiary hover:text-red-400 transition-colors"
                          title="Delete clip"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Pane: Live Inspector & Preview */}
            <div className="flex w-1/2 flex-col justify-between p-4 bg-surface-subtle/20">
              {activeEntry ? (
                <>
                  <div className="flex-1 overflow-y-auto space-y-3">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-content-secondary">
                        {TYPE_CONFIG[activeEntry.type]?.label} Preview
                      </span>
                      <span className="font-mono text-[10px] text-content-tertiary">
                        {new Date(activeEntry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Color Swatch Special Inspector */}
                    {activeEntry.type === 'color' && (
                      <div className="flex flex-col gap-2">
                        <div
                          className="h-24 w-full rounded-xl border border-border-subtle shadow-inner"
                          style={{ backgroundColor: activeEntry.content }}
                        />
                        <div className="font-mono text-xs font-semibold text-content-primary">
                          {activeEntry.content.toUpperCase()}
                        </div>
                      </div>
                    )}

                    {/* URL Special Inspector */}
                    {activeEntry.type === 'url' && (
                      <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-subtle p-2.5">
                        <Link className="h-4 w-4 text-emerald-400 shrink-0" />
                        <a
                          href={activeEntry.content}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-xs text-accent hover:underline flex-1"
                        >
                          {activeEntry.content}
                        </a>
                        <ExternalLink className="h-3.5 w-3.5 text-content-tertiary shrink-0" />
                      </div>
                    )}

                    {/* Code & Text Inspector */}
                    <div className="rounded-xl border border-border-subtle bg-surface-panel p-3 font-mono text-xs leading-relaxed text-content-primary select-text overflow-x-auto whitespace-pre-wrap max-h-60">
                      {activeEntry.content}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3">
                    <span className="font-mono text-[10px] text-content-tertiary">
                      Press <kbd className="rounded bg-surface-subtle px-1 py-0.5">Enter</kbd> to copy
                    </span>

                    <button
                      onClick={() => handleCopy(activeEntry)}
                      className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-1.5 text-xs font-semibold text-accent-fg shadow-sm hover:scale-105 active:scale-95 transition-all"
                    >
                      {copiedId === activeEntry.id ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy & Paste</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-xs text-content-tertiary">
                  Select a clip to preview details
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
