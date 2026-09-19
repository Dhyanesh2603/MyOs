import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause,
  Download,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useWindowStore } from '@core/window/windowStore';
import { downloadVFSToPC } from '@core/vfs/hostBridge';
import { soundEngine } from '@core/audio/soundEngine';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'];

export const GalleryApp: React.FC<AppProps> = ({ windowId }) => {
  const customState = useWindowStore(
    (state) => state.windows[windowId]?.customState as { initialData?: { filePath?: string } } | undefined
  );
  const activeWindowId = useWindowStore((state) => state.activeWindowId);

  const { nodes, readFile } = useVFSStore();

  // Find all image files in VFS
  const imageFiles = useMemo(() => {
    return Object.values(nodes).filter((node) => {
      if (node.type === 'directory') return false;
      const ext = node.name.split('.').pop()?.toLowerCase() || '';
      return IMAGE_EXTENSIONS.includes(ext);
    });
  }, [nodes]);

  const initialPath = customState?.initialData?.filePath;
  const initialIndex = initialPath
    ? Math.max(0, imageFiles.findIndex((f) => f.path === initialPath))
    : 0;

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [currentDataUrl, setCurrentDataUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentFile = imageFiles[currentIndex];

  // Load image content
  useEffect(() => {
    if (!currentFile) {
      setCurrentDataUrl(null);
      return;
    }

    readFile(currentFile.path)
      .then((content) => {
        // If content is already a data URL, use it directly
        if (content.startsWith('data:image')) {
          setCurrentDataUrl(content);
        } else {
          // If SVG or text, format as data URL
          if (currentFile.name.endsWith('.svg')) {
            setCurrentDataUrl(`data:image/svg+xml;utf8,${encodeURIComponent(content)}`);
          } else {
            setCurrentDataUrl(content);
          }
        }
        setZoom(1);
        setRotation(0);
      })
      .catch(() => {
        setCurrentDataUrl(null);
      });
  }, [currentFile, readFile]);

  // Slideshow timer
  useEffect(() => {
    if (!isPlaying || imageFiles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageFiles.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPlaying, imageFiles.length]);

  // Keyboard navigation when focused
  useEffect(() => {
    if (activeWindowId !== windowId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWindowId, windowId, imageFiles.length]);

  const handleNext = () => {
    if (imageFiles.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % imageFiles.length);
    soundEngine.playClick();
  };

  const handlePrevious = () => {
    if (imageFiles.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + imageFiles.length) % imageFiles.length);
    soundEngine.playClick();
  };

  const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel text-content-primary select-none text-xs">
      {/* Gallery Action Header */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-overlay/90 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5 text-accent-primary" />
          <span className="font-sans font-medium text-content-primary">
            {currentFile?.name ?? 'Photo Gallery'}
          </span>
          {currentFile && (
            <span className="font-mono text-[9px] text-content-tertiary bg-surface-subtle border border-border-subtle px-1.5 py-0.2 rounded">
              {currentIndex + 1} / {imageFiles.length}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="rounded p-1 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[10px] text-content-tertiary w-8 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="rounded p-1 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <div className="h-3.5 w-px bg-border-subtle/80 mx-1" />

          <button
            onClick={handleRotate}
            title="Rotate 90°"
            className="rounded p-1 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
            className={`flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] transition-colors ${
              isPlaying
                ? 'bg-accent-primary text-white font-semibold'
                : 'text-content-secondary hover:bg-surface-subtle'
            }`}
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {currentFile && (
            <button
              onClick={() => downloadVFSToPC(currentFile.path)}
              title="Download to PC"
              className="rounded p-1 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/40 p-4">
        {imageFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 text-center text-content-tertiary">
            <ImageIcon className="h-10 w-10 opacity-30" />
            <h4 className="font-sans text-sm font-semibold text-content-primary">No Images Found</h4>
            <p className="max-w-xs text-xs">
              Draw an image in FlowPaint or drag and drop photos from your PC to display them here.
            </p>
          </div>
        ) : currentDataUrl ? (
          <div className="flex h-full w-full items-center justify-center overflow-hidden">
            <img
              src={currentDataUrl}
              alt={currentFile?.name}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl pointer-events-none"
            />
          </div>
        ) : (
          <div className="text-content-tertiary">Loading image...</div>
        )}

        {/* Previous / Next Arrow Overlays */}
        {imageFiles.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-xl backdrop-blur-md hover:bg-black/80 active:scale-95 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-xl backdrop-blur-md hover:bg-black/80 active:scale-95 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnail Carousel Strip */}
      {imageFiles.length > 0 && (
        <div className="flex h-16 items-center gap-2 border-t border-border-subtle bg-surface-overlay/80 px-3 overflow-x-auto select-none">
          {imageFiles.map((file, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={file.path}
                onClick={() => { setCurrentIndex(idx); soundEngine.playClick(); }}
                className={`flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border overflow-hidden transition-all ${
                  isSelected
                    ? 'border-accent-primary ring-2 ring-accent-primary/40 scale-105 shadow-sm'
                    : 'border-border-subtle hover:border-accent-primary/40 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex flex-col items-center gap-0.5 p-1 text-[9px] font-mono text-content-tertiary truncate">
                  <ImageIcon className="h-3.5 w-3.5 text-accent-primary" />
                  <span className="truncate max-w-[50px]">{file.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const galleryManifest: AppManifest = {
  id: 'gallery',
  name: 'Gallery',
  description: 'High-resolution photo viewer, slideshow and picture browser for the FlowOS VFS.',
  category: 'media',
  icon: ImageIcon,
  defaultSize: { width: 740, height: 520 },
  constraints: { minWidth: 460, minHeight: 340, maxWidth: 1400, maxHeight: 1000 },
  allowMultipleInstances: true,
  permissions: ['vfs:read'],
  component: GalleryApp,
};
