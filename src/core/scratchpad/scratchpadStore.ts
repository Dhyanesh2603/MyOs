import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ScratchpadMode = 'scratch' | 'code' | 'history';

export interface ScratchpadHistoryItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  type: 'scratch' | 'code';
  language?: string;
}

export interface ScratchpadState {
  isOpen: boolean;
  activeMode: ScratchpadMode;
  scratchText: string;
  codeText: string;
  codeLanguage: string;
  history: ScratchpadHistoryItem[];

  // Actions
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setActiveMode: (mode: ScratchpadMode) => void;
  setScratchText: (text: string) => void;
  setCodeText: (code: string) => void;
  setCodeLanguage: (lang: string) => void;
  saveCurrentToHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  loadHistoryItem: (id: string) => void;
  clearCurrent: () => void;
}

const DEFAULT_SCRATCH = `# Quick Scratchpad
- [ ] Align architecture spec for Flow OS v2 Personal Operating System
- [ ] Review Monotonic Stack hard problem template
- [ ] Draft database indexing checklist for CAT exam

> Momentum answers: "What should I work on next?"
`;

const DEFAULT_CODE = `// Flow OS Scratch Buffer
export function calculateVelocity(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
`;

export const useScratchpadStore = create<ScratchpadState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      activeMode: 'scratch',
      scratchText: DEFAULT_SCRATCH,
      codeText: DEFAULT_CODE,
      codeLanguage: 'typescript',
      history: [
        {
          id: 'hist-seed-1',
          title: 'Initial Architecture Scoping',
          content: DEFAULT_SCRATCH,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          type: 'scratch',
        },
      ],

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (isOpen) => set({ isOpen }),
      setActiveMode: (activeMode) => set({ activeMode }),
      setScratchText: (scratchText) => set({ scratchText }),
      setCodeText: (codeText) => set({ codeText }),
      setCodeLanguage: (codeLanguage) => set({ codeLanguage }),

      saveCurrentToHistory: () => {
        const { activeMode, scratchText, codeText, codeLanguage, history } = get();
        const content = activeMode === 'code' ? codeText : scratchText;
        if (!content.trim()) return;

        const firstLine = content.trim().split('\n')[0]?.replace(/^[#\s\-/]+/, '') || 'Untitled Note';
        const title = firstLine.slice(0, 40) + (firstLine.length > 40 ? '...' : '');

        const newItem: ScratchpadHistoryItem = {
          id: `hist-${Date.now()}`,
          title,
          content,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          type: activeMode === 'code' ? 'code' : 'scratch',
          language: activeMode === 'code' ? codeLanguage : undefined,
        };

        set({ history: [newItem, ...history.slice(0, 30)] });
      },

      deleteHistoryItem: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),

      loadHistoryItem: (id) => {
        const item = get().history.find((h) => h.id === id);
        if (!item) return;

        if (item.type === 'code') {
          set({
            codeText: item.content,
            codeLanguage: item.language || 'typescript',
            activeMode: 'code',
          });
        } else {
          set({
            scratchText: item.content,
            activeMode: 'scratch',
          });
        }
      },

      clearCurrent: () => {
        const { activeMode } = get();
        if (activeMode === 'code') {
          set({ codeText: '' });
        } else {
          set({ scratchText: '' });
        }
      },
    }),
    {
      name: 'flow_os_scratchpad_v1',
      partialize: (state) => ({
        scratchText: state.scratchText,
        codeText: state.codeText,
        codeLanguage: state.codeLanguage,
        history: state.history,
      }),
    }
  )
);
