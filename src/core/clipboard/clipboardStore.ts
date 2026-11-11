import { create } from 'zustand';
import { soundEngine } from '@core/audio/soundEngine';

export type ClipboardContentType = 'text' | 'code' | 'url' | 'color' | 'json';

export interface ClipboardEntry {
  id: string;
  content: string;
  type: ClipboardContentType;
  timestamp: number;
  isPinned: boolean;
  charCount: number;
}

export interface ClipboardStoreState {
  entries: ClipboardEntry[];
  isOpen: boolean;
  selectedId: string | null;

  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  setSelectedId: (id: string | null) => void;
  addEntry: (content: string) => void;
  removeEntry: (id: string) => void;
  togglePin: (id: string) => void;
  clearHistory: () => void;
}

const STORAGE_KEY = 'flowos_clipboard_history_v1';

function detectType(text: string): ClipboardContentType {
  const trimmed = text.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed) || /^rgba?\(/.test(trimmed)) {
    return 'color';
  }
  if (/^https?:\/\/[^\s]+$/.test(trimmed)) {
    return 'url';
  }
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid json
    }
  }
  if (
    trimmed.includes('function') ||
    trimmed.includes('const ') ||
    trimmed.includes('let ') ||
    trimmed.includes('import ') ||
    trimmed.includes('export ') ||
    trimmed.includes('class ') ||
    trimmed.includes('=>') ||
    trimmed.split('\n').length > 3
  ) {
    return 'code';
  }
  return 'text';
}

const INITIAL_ENTRIES: ClipboardEntry[] = [
  {
    id: 'clip-1',
    content: 'https://os-onyx.vercel.app',
    type: 'url',
    timestamp: Date.now() - 1000 * 60 * 5,
    isPinned: true,
    charCount: 36,
  },
  {
    id: 'clip-2',
    content: '#00f0ff',
    type: 'color',
    timestamp: Date.now() - 1000 * 60 * 12,
    isPinned: true,
    charCount: 7,
  },
  {
    id: 'clip-3',
    content: 'const kernel = new MicroKernel({ memory: "512MB", threads: 4 });\nkernel.boot();',
    type: 'code',
    timestamp: Date.now() - 1000 * 60 * 30,
    isPinned: false,
    charCount: 79,
  },
  {
    id: 'clip-4',
    content: 'Onyx OS: Tactile ambient web desktop operating system',
    type: 'text',
    timestamp: Date.now() - 1000 * 60 * 60,
    isPinned: false,
    charCount: 52,
  },
];

function loadEntries(): ClipboardEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load clipboard history', e);
  }
  return INITIAL_ENTRIES;
}

function persistEntries(entries: ClipboardEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to persist clipboard history', e);
  }
}

export const useClipboardStore = create<ClipboardStoreState>((set, get) => ({
  entries: loadEntries(),
  isOpen: false,
  selectedId: null,

  openModal: () => {
    const entries = get().entries;
    soundEngine.playClick();
    set({ isOpen: true, selectedId: entries[0]?.id ?? null });
  },

  closeModal: () => {
    set({ isOpen: false });
  },

  toggleModal: () => {
    const next = !get().isOpen;
    const entries = get().entries;
    soundEngine.playClick();
    set({ isOpen: next, selectedId: next ? (entries[0]?.id ?? null) : null });
  },

  setSelectedId: (id) => {
    set({ selectedId: id });
  },

  addEntry: (content: string) => {
    if (!content || !content.trim()) return;
    const trimmed = content.trim();
    const existing = get().entries;

    // Avoid duplicate of identical top clip
    if (existing[0]?.content === trimmed) return;

    const newEntry: ClipboardEntry = {
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content: trimmed,
      type: detectType(trimmed),
      timestamp: Date.now(),
      isPinned: false,
      charCount: trimmed.length,
    };

    // Keep top 50
    const nextList = [newEntry, ...existing.filter((e) => e.content !== trimmed)].slice(0, 50);
    set({ entries: nextList, selectedId: newEntry.id });
    persistEntries(nextList);
  },

  removeEntry: (id: string) => {
    const nextList = get().entries.filter((e) => e.id !== id);
    soundEngine.playClick();
    set({ entries: nextList, selectedId: nextList[0]?.id ?? null });
    persistEntries(nextList);
  },

  togglePin: (id: string) => {
    const nextList = get().entries.map((e) =>
      e.id === id ? { ...e, isPinned: !e.isPinned } : e
    );
    soundEngine.playSnap();
    set({ entries: nextList });
    persistEntries(nextList);
  },

  clearHistory: () => {
    // Keep pinned items
    const nextList = get().entries.filter((e) => e.isPinned);
    soundEngine.playClick();
    set({ entries: nextList, selectedId: nextList[0]?.id ?? null });
    persistEntries(nextList);
  },
}));
