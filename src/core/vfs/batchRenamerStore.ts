import { create } from 'zustand';
import { useVFSStore } from './vfsStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { soundEngine } from '@core/audio/soundEngine';

export type RenamePatternType = 'case' | 'sequence' | 'replace' | 'prefix_suffix';
export type CaseMode = 'lower' | 'upper' | 'title' | 'kebab' | 'snake';

export interface RenamePreviewItem {
  originalPath: string;
  originalName: string;
  newName: string;
  newPath: string;
  hasConflict: boolean;
}

interface BatchRenamerState {
  isOpen: boolean;
  selectedPaths: string[];
  patternType: RenamePatternType;
  caseMode: CaseMode;
  findText: string;
  replaceText: string;
  prefixText: string;
  suffixText: string;
  sequencePrefix: string;
  sequenceStart: number;
  sequenceDigits: number;

  openRenamer: (paths: string[]) => void;
  closeRenamer: () => void;
  setPatternType: (type: RenamePatternType) => void;
  setCaseMode: (mode: CaseMode) => void;
  setFindText: (text: string) => void;
  setReplaceText: (text: string) => void;
  setPrefixText: (text: string) => void;
  setSuffixText: (text: string) => void;
  setSequencePrefix: (text: string) => void;
  setSequenceStart: (num: number) => void;
  executeRename: () => Promise<void>;
  getPreviews: () => RenamePreviewItem[];
}

function transformName(
  name: string,
  index: number,
  state: BatchRenamerState
): string {
  // Separate extension
  const lastDot = name.lastIndexOf('.');
  const hasExt = lastDot > 0;
  const baseName = hasExt ? name.slice(0, lastDot) : name;
  const ext = hasExt ? name.slice(lastDot) : '';

  let transformedBase = baseName;

  if (state.patternType === 'case') {
    if (state.caseMode === 'lower') {
      transformedBase = baseName.toLowerCase();
    } else if (state.caseMode === 'upper') {
      transformedBase = baseName.toUpperCase();
    } else if (state.caseMode === 'title') {
      transformedBase = baseName.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      );
    } else if (state.caseMode === 'kebab') {
      transformedBase = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    } else if (state.caseMode === 'snake') {
      transformedBase = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_|_$)/g, '');
    }
  } else if (state.patternType === 'sequence') {
    const seqNum = (state.sequenceStart + index)
      .toString()
      .padStart(state.sequenceDigits, '0');
    transformedBase = state.sequencePrefix ? `${state.sequencePrefix}_${seqNum}` : `${seqNum}`;
  } else if (state.patternType === 'replace') {
    if (state.findText) {
      transformedBase = baseName.replaceAll(state.findText, state.replaceText);
    }
  } else if (state.patternType === 'prefix_suffix') {
    transformedBase = `${state.prefixText}${baseName}${state.suffixText}`;
  }

  return `${transformedBase}${ext}`;
}

export const useBatchRenamerStore = create<BatchRenamerState>((set, get) => ({
  isOpen: false,
  selectedPaths: [],
  patternType: 'case',
  caseMode: 'kebab',
  findText: '',
  replaceText: '',
  prefixText: '',
  suffixText: '',
  sequencePrefix: 'item',
  sequenceStart: 1,
  sequenceDigits: 3,

  openRenamer: (paths) => {
    soundEngine.playClick();
    set({
      isOpen: true,
      selectedPaths: paths,
      findText: '',
      replaceText: '',
      prefixText: '',
      suffixText: '',
    });
  },

  closeRenamer: () => {
    soundEngine.playClick();
    set({ isOpen: false, selectedPaths: [] });
  },

  setPatternType: (patternType) => set({ patternType }),
  setCaseMode: (caseMode) => set({ caseMode }),
  setFindText: (findText) => set({ findText }),
  setReplaceText: (replaceText) => set({ replaceText }),
  setPrefixText: (prefixText) => set({ prefixText }),
  setSuffixText: (suffixText) => set({ suffixText }),
  setSequencePrefix: (sequencePrefix) => set({ sequencePrefix }),
  setSequenceStart: (sequenceStart) => set({ sequenceStart }),

  getPreviews: () => {
    const state = get();
    const seenNewNames = new Set<string>();

    return state.selectedPaths.map((originalPath, index) => {
      const parts = originalPath.split('/');
      const originalName = parts[parts.length - 1] ?? '';
      const parentDir = parts.slice(0, -1).join('/');

      const newName = transformName(originalName, index, state);
      const newPath = `${parentDir}/${newName}`;

      const hasConflict = seenNewNames.has(newName);
      seenNewNames.add(newName);

      return {
        originalPath,
        originalName,
        newName,
        newPath,
        hasConflict,
      };
    });
  },

  executeRename: async () => {
    const previews = get().getPreviews();
    const { readFile, writeFile, deleteNode } = useVFSStore.getState();

    let count = 0;
    for (const item of previews) {
      if (item.originalPath !== item.newPath && !item.hasConflict) {
        try {
          const content = await readFile(item.originalPath);
          await writeFile(item.newPath, content);
          await deleteNode(item.originalPath);
          count++;
        } catch (e) {
          console.warn('Batch rename failed for:', item.originalPath, e);
        }
      }
    }

    soundEngine.playSnap();
    useNotificationStore.getState().notify({
      title: 'Batch Rename Complete',
      message: `Successfully renamed ${count} file${count === 1 ? '' : 's'}.`,
      type: 'success',
    });

    set({ isOpen: false, selectedPaths: [] });
  },
}));
