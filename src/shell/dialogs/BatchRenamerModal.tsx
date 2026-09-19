import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Tag,
  ArrowRight,
  Check,
  AlertTriangle,
  CaseSensitive,
  Binary,
  Search,
  Plus,
} from 'lucide-react';
import {
  useBatchRenamerStore,
  type RenamePatternType,
  type CaseMode,
} from '@core/vfs/batchRenamerStore';
import { soundEngine } from '@core/audio/soundEngine';

export const BatchRenamerModal: React.FC = () => {
  const {
    isOpen,
    closeRenamer,
    patternType,
    setPatternType,
    caseMode,
    setCaseMode,
    findText,
    setFindText,
    replaceText,
    setReplaceText,
    prefixText,
    setPrefixText,
    suffixText,
    setSuffixText,
    sequencePrefix,
    setSequencePrefix,
    sequenceStart,
    setSequenceStart,
    getPreviews,
    executeRename,
  } = useBatchRenamerStore();

  const previews = getPreviews();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeRenamer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeRenamer]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#14151a]/95 shadow-2xl backdrop-blur-2xl text-content-primary p-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Tag className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-bold text-white tracking-wide">
                  BATCH RENAMER STUDIO
                </h3>
                <p className="font-mono text-[10px] text-neutral-400">
                  {previews.length} ITEM{previews.length === 1 ? '' : 'S'} SELECTED
                </p>
              </div>
            </div>

            <button
              onClick={closeRenamer}
              className="rounded-full p-1 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 mb-3">
            {[
              { id: 'case', label: 'Case Convert', icon: CaseSensitive },
              { id: 'sequence', label: 'Sequence #', icon: Binary },
              { id: 'replace', label: 'Find & Replace', icon: Search },
              { id: 'prefix_suffix', label: 'Prefix / Suffix', icon: Plus },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = patternType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setPatternType(tab.id as RenamePatternType);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-black font-bold shadow'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Parameters Bay */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 mb-3">
            {patternType === 'case' && (
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-neutral-400 mr-1">FORMAT:</span>
                {(['kebab', 'snake', 'lower', 'upper', 'title'] as CaseMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      soundEngine.playClick();
                      setCaseMode(mode);
                    }}
                    className={`rounded px-2.5 py-1 font-mono text-xs transition-colors ${
                      caseMode === mode
                        ? 'bg-emerald-500 text-black font-bold shadow'
                        : 'border border-white/10 bg-white/5 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {mode === 'kebab'
                      ? 'kebab-case'
                      : mode === 'snake'
                      ? 'snake_case'
                      : mode === 'lower'
                      ? 'lowercase'
                      : mode === 'upper'
                      ? 'UPPERCASE'
                      : 'Title Case'}
                  </button>
                ))}
              </div>
            )}

            {patternType === 'sequence' && (
              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-neutral-400 text-[10px]">PREFIX:</span>
                  <input
                    type="text"
                    value={sequencePrefix}
                    onChange={(e) => setSequencePrefix(e.target.value)}
                    placeholder="e.g. photo"
                    className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-400 text-[10px]">START AT:</span>
                  <input
                    type="number"
                    min={1}
                    value={sequenceStart}
                    onChange={(e) => setSequenceStart(parseInt(e.target.value, 10) || 1)}
                    className="w-16 rounded border border-white/10 bg-black/40 px-2 py-1 text-white focus:border-emerald-500 outline-none text-center"
                  />
                </div>
              </div>
            )}

            {patternType === 'replace' && (
              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-neutral-400 text-[10px]">FIND:</span>
                  <input
                    type="text"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    placeholder="e.g. copy"
                    className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-neutral-400 text-[10px]">REPLACE WITH:</span>
                  <input
                    type="text"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="e.g. final"
                    className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            {patternType === 'prefix_suffix' && (
              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-neutral-400 text-[10px]">ADD PREFIX:</span>
                  <input
                    type="text"
                    value={prefixText}
                    onChange={(e) => setPrefixText(e.target.value)}
                    placeholder="v1_"
                    className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-neutral-400 text-[10px]">ADD SUFFIX:</span>
                  <input
                    type="text"
                    value={suffixText}
                    onChange={(e) => setSuffixText(e.target.value)}
                    placeholder="_backup"
                    className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Before / After Comparison Table */}
          <div className="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-2 mb-4 font-mono text-xs">
            {previews.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">
                No files selected to rename.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {previews.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5"
                  >
                    <span className="truncate text-neutral-400 max-w-[42%]">
                      {item.originalName}
                    </span>

                    <ArrowRight className="h-3.5 w-3.5 text-neutral-600 shrink-0 mx-2" />

                    <div className="flex items-center gap-1.5 truncate max-w-[48%] justify-end">
                      {item.hasConflict && (
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      )}
                      <span
                        className={`truncate font-semibold ${
                          item.hasConflict
                            ? 'text-rose-400'
                            : item.originalName !== item.newName
                            ? 'text-emerald-400'
                            : 'text-neutral-300'
                        }`}
                      >
                        {item.newName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="font-mono text-[10px] text-neutral-400">
              Press Escape to dismiss
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={closeRenamer}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-neutral-300 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={executeRename}
                disabled={previews.length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 font-mono text-xs font-bold text-black hover:bg-emerald-400 transition-colors shadow-lg disabled:opacity-40"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Rename {previews.length} File{previews.length === 1 ? '' : 's'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
