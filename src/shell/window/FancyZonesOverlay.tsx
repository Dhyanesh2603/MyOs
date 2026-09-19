import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Sparkles } from 'lucide-react';
import {
  useFancyZonesStore,
  type FancyZoneId,
} from '@core/window/fancyZonesStore';

export const FancyZonesOverlay: React.FC = () => {
  const { isOverlayVisible, activeZoneId, draggedWindowId, setActiveZone, snapWindowToZone } =
    useFancyZonesStore();

  if (!isOverlayVisible || !draggedWindowId) return null;

  const handleDropInZone = (zoneId: FancyZoneId) => {
    if (draggedWindowId) {
      snapWindowToZone(draggedWindowId, zoneId);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[8800] pointer-events-auto bg-black/40 backdrop-blur-[2px] p-6 select-none flex flex-col justify-between"
      >
        {/* Top Hint Bar */}
        <div className="flex items-center justify-between rounded-xl border border-white/20 bg-[#14161b]/90 px-4 py-2 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-accent-primary" />
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              SPATIAL FANCYZONES SNAP
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-300">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>DROP IN ANY GLOWING WIREFRAME ZONE</span>
          </div>
        </div>

        {/* Interactive Zone Wireframe Matrix */}
        <div className="relative my-4 flex-1 grid grid-cols-2 grid-rows-2 gap-4">
          {/* Top-Left Quadrant */}
          <div
            onPointerEnter={() => setActiveZone('top-left')}
            onPointerLeave={() => setActiveZone(null)}
            onPointerUp={() => handleDropInZone('top-left')}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
              activeZoneId === 'top-left'
                ? 'border-accent-primary bg-accent-primary/20 shadow-[0_0_24px_rgba(56,189,248,0.4)] scale-[1.01]'
                : 'border-white/20 bg-white/[0.03] hover:border-white/40'
            }`}
          >
            <span className="font-mono text-xs font-bold tracking-wider text-white">
              TOP LEFT (1/4)
            </span>
            <span className="font-mono text-[10px] text-neutral-400">50% W × 50% H</span>
          </div>

          {/* Top-Right Quadrant */}
          <div
            onPointerEnter={() => setActiveZone('top-right')}
            onPointerLeave={() => setActiveZone(null)}
            onPointerUp={() => handleDropInZone('top-right')}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
              activeZoneId === 'top-right'
                ? 'border-accent-primary bg-accent-primary/20 shadow-[0_0_24px_rgba(56,189,248,0.4)] scale-[1.01]'
                : 'border-white/20 bg-white/[0.03] hover:border-white/40'
            }`}
          >
            <span className="font-mono text-xs font-bold tracking-wider text-white">
              TOP RIGHT (1/4)
            </span>
            <span className="font-mono text-[10px] text-neutral-400">50% W × 50% H</span>
          </div>

          {/* Bottom-Left Quadrant */}
          <div
            onPointerEnter={() => setActiveZone('bottom-left')}
            onPointerLeave={() => setActiveZone(null)}
            onPointerUp={() => handleDropInZone('bottom-left')}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
              activeZoneId === 'bottom-left'
                ? 'border-accent-primary bg-accent-primary/20 shadow-[0_0_24px_rgba(56,189,248,0.4)] scale-[1.01]'
                : 'border-white/20 bg-white/[0.03] hover:border-white/40'
            }`}
          >
            <span className="font-mono text-xs font-bold tracking-wider text-white">
              BOTTOM LEFT (1/4)
            </span>
            <span className="font-mono text-[10px] text-neutral-400">50% W × 50% H</span>
          </div>

          {/* Bottom-Right Quadrant */}
          <div
            onPointerEnter={() => setActiveZone('bottom-right')}
            onPointerLeave={() => setActiveZone(null)}
            onPointerUp={() => handleDropInZone('bottom-right')}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
              activeZoneId === 'bottom-right'
                ? 'border-accent-primary bg-accent-primary/20 shadow-[0_0_24px_rgba(56,189,248,0.4)] scale-[1.01]'
                : 'border-white/20 bg-white/[0.03] hover:border-white/40'
            }`}
          >
            <span className="font-mono text-xs font-bold tracking-wider text-white">
              BOTTOM RIGHT (1/4)
            </span>
            <span className="font-mono text-[10px] text-neutral-400">50% W × 50% H</span>
          </div>

          {/* Floating Center Stage Zone Target in Middle */}
          <div
            onPointerEnter={() => setActiveZone('center-focus')}
            onPointerLeave={() => setActiveZone(null)}
            onPointerUp={() => handleDropInZone('center-focus')}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-72 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed shadow-2xl transition-all cursor-pointer z-10 ${
              activeZoneId === 'center-focus'
                ? 'border-emerald-400 bg-emerald-950/70 shadow-[0_0_32px_rgba(52,211,153,0.5)] scale-105'
                : 'border-white/30 bg-[#171920]/85 hover:border-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <span className="font-mono text-xs font-bold tracking-wider text-emerald-300">
              CENTER STAGE (ZEN)
            </span>
            <span className="font-mono text-[10px] text-neutral-400">72% W × 85% H Centered</span>
          </div>
        </div>

        {/* Bottom Quick Switch Row: 50/50 Split Snap */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onPointerEnter={() => setActiveZone('left-half')}
            onPointerLeave={() => setActiveZone(null)}
            onPointerUp={() => handleDropInZone('left-half')}
            className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 font-mono text-xs font-semibold transition-all ${
              activeZoneId === 'left-half'
                ? 'border-sky-400 bg-sky-500/20 text-white shadow-lg'
                : 'border-white/15 bg-white/5 text-neutral-300 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            <span>LEFT HALF (50%)</span>
          </button>

          <button
            onPointerEnter={() => setActiveZone('right-half')}
            onPointerLeave={() => setActiveZone(null)}
            onPointerUp={() => handleDropInZone('right-half')}
            className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 font-mono text-xs font-semibold transition-all ${
              activeZoneId === 'right-half'
                ? 'border-sky-400 bg-sky-500/20 text-white shadow-lg'
                : 'border-white/15 bg-white/5 text-neutral-300 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            <span>RIGHT HALF (50%)</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
