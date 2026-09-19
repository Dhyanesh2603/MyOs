import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  Download,
  FileText,
  FileCode,
  Image as ImageIcon,
  Music as MusicIcon,
  Sparkles,
} from 'lucide-react';
import { useQuickLookStore } from '@core/quicklook/quickLookStore';
import { useProcessStore } from '@core/process/processStore';
import { downloadVFSToPC } from '@core/vfs/hostBridge';
import { soundEngine } from '@core/audio/soundEngine';

export const QuickLookModal: React.FC = () => {
  const {
    isOpen,
    filePath,
    fileName,
    fileContent,
    fileSize,
    fileExtension,
    appToLaunch,
    closeQuickLook,
  } = useQuickLookStore();

  const { launchApp } = useProcessStore();

  // Keyboard shortcut: Spacebar or Escape closes Quick Look
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't close if actively typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        closeQuickLook();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeQuickLook]);

  if (!isOpen || !filePath) return null;

  const isImage = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(fileExtension);
  const isAudio = ['mp3', 'wav', 'ogg'].includes(fileExtension);
  const isCode = ['js', 'ts', 'jsx', 'tsx', 'json', 'css', 'html', 'sh', 'env'].includes(fileExtension);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const handleOpenWithApp = () => {
    soundEngine.playClick();
    closeQuickLook();
    launchApp(appToLaunch.id, { filePath });
  };

  const handleDownload = () => {
    soundEngine.playClick();
    downloadVFSToPC(filePath);
  };

  const getHeaderIcon = () => {
    if (isImage) return <ImageIcon className="h-4 w-4 text-cyan-400" />;
    if (isAudio) return <MusicIcon className="h-4 w-4 text-emerald-400" />;
    if (isCode) return <FileCode className="h-4 w-4 text-amber-400" />;
    return <FileText className="h-4 w-4 text-accent-primary" />;
  };

  return (
    <AnimatePresence>
      <div
        onClick={closeQuickLook}
        className="fixed inset-0 z-[9800] flex items-center justify-center bg-black/60 p-6 backdrop-blur-md animate-in fade-in select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="flex h-full max-h-[580px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-panel/95 shadow-2xl backdrop-blur-2xl text-content-primary"
        >
          {/* Top Bar / Header */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtle bg-surface-overlay/80 px-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-subtle border border-border-subtle">
                {getHeaderIcon()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-content-primary">
                  {fileName}
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-content-tertiary">
                  <span>{formatBytes(fileSize)}</span>
                  <span>•</span>
                  <span className="truncate">{filePath}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleOpenWithApp}
                className="flex items-center gap-1.5 rounded-xl bg-accent-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Open in {appToLaunch.name}</span>
              </button>

              <button
                onClick={handleDownload}
                title="Download to Host PC"
                className="rounded-xl border border-border-subtle bg-surface-card p-1.5 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={closeQuickLook}
                title="Close (Space / Esc)"
                className="rounded-xl border border-border-subtle bg-surface-card p-1.5 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Preview Canvas / Body */}
          <div className="flex-1 overflow-auto p-4 bg-surface-canvas text-xs select-text">
            {isImage ? (
              <div className="flex h-full w-full items-center justify-center p-2">
                <img
                  src={fileContent || ''}
                  alt={fileName}
                  className="max-h-full max-w-full rounded-xl border border-border-subtle shadow-md object-contain"
                />
              </div>
            ) : isAudio ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg">
                  <MusicIcon className="h-10 w-10 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-content-primary">{fileName}</h3>
                  <p className="font-mono text-xs text-content-tertiary">Audio Track ({formatBytes(fileSize)})</p>
                </div>
                <button
                  onClick={handleOpenWithApp}
                  className="rounded-xl bg-accent-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
                >
                  Play in Music Player
                </button>
              </div>
            ) : isCode ? (
              <div className="font-mono text-[11px] leading-relaxed">
                <table className="w-full border-collapse">
                  <tbody>
                    {(fileContent || '').split('\n').map((line, idx) => (
                      <tr key={idx} className="hover:bg-surface-subtle/40">
                        <td className="w-10 select-none pr-3 text-right text-content-tertiary/60 border-r border-border-subtle/30 font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="pl-3 text-content-primary whitespace-pre-wrap break-all">
                          {line || ' '}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="whitespace-pre-wrap font-sans text-content-secondary leading-relaxed p-2">
                {fileContent || '(Empty file)'}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex h-8 shrink-0 items-center justify-between border-t border-border-subtle bg-surface-overlay/80 px-4 font-mono text-[10px] text-content-tertiary">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-accent-primary" />
              <span>Quick Look Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded border border-border-subtle bg-surface-subtle/60 px-1 py-0.5 text-[9px]">Space</kbd>
              <span>or</span>
              <kbd className="rounded border border-border-subtle bg-surface-subtle/60 px-1 py-0.5 text-[9px]">Esc</kbd>
              <span>to dismiss</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
