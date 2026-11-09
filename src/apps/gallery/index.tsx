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
    <div className="flex h-full w-full flex-col bg-[#07080b] text-neutral-100 select-none text-xs">
      {/* Gallery Action Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0e1017] px-3.5 py-2">
        <div className="flex items-center gap-2.5">
          <ImageIcon className="h-4 w-4 text-white" />
          <span className="font-sans font-semibold text-white">
            {currentFile?.name ?? 'Photo Gallery'}
          </span>
          {currentFile && (
            <span className="font-mono text-[9px] text-neutral-400 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-md font-medium">
              {currentIndex + 1} / {imageFiles.length}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[10px] text-neutral-300 w-8 text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={handleRotate}
            title="Rotate 90°"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[10px] transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-white text-black font-bold shadow'
                : 'text-neutral-300 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {isPlaying ? <Pause className="h-3 w-3 fill-black text-black" /> : <Play className="h-3 w-3" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {currentFile && (
            <button
              onClick={() => downloadVFSToPC(currentFile.path)}
              title="Download to PC"
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/80 p-4">
        {imageFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 text-center text-neutral-500">
            <ImageIcon className="h-10 w-10 opacity-30" />
            <h4 className="font-sans text-sm font-semibold text-white">No Images Found</h4>
            <p className="max-w-xs text-xs text-neutral-400">
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
          <div className="text-neutral-400">Loading image...</div>
        )}

        {/* Previous / Next Arrow Overlays */}
        {imageFiles.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-xl backdrop-blur-md hover:bg-black active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-xl backdrop-blur-md hover:bg-black active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnail Carousel Strip */}
      {imageFiles.length > 0 && (
        <div className="flex h-16 items-center gap-2.5 border-t border-white/[0.08] bg-[#0c0e14] px-3.5 overflow-x-auto select-none scrollbar-none no-scrollbar">
          {imageFiles.map((file, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={file.path}
                onClick={() => { setCurrentIndex(idx); soundEngine.playClick(); }}
                className={`flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border overflow-hidden transition-all cursor-pointer ${
                  isSelected
                    ? 'border-white ring-2 ring-white/30 scale-105 shadow-md bg-white/10'
                    : 'border-white/10 hover:border-white/20 opacity-60 hover:opacity-100 bg-[#12141c]'
                }`}
              >
                <div className="flex flex-col items-center gap-0.5 p-1 text-[9px] font-mono text-neutral-300 truncate">
                  <ImageIcon className="h-3.5 w-3.5 text-neutral-400" />
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
