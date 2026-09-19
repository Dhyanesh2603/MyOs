import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Radio,
  FileText,
  CheckCircle2,
  Share2,
  Sparkles,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react';
import { useFlowDropStore, type FlowDropDevice } from '@core/airdrop/airdropStore';

export const FlowDropModal: React.FC = () => {
  const {
    isOpen,
    closeFlowDrop,
    devices,
    selectedFile,
    activeTransfer,
    sendToDevice,
  } = useFlowDropStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeFlowDrop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeFlowDrop]);

  if (!isOpen) return null;

  const getDeviceIcon = (type: FlowDropDevice['type']) => {
    switch (type) {
      case 'laptop':
        return Laptop;
      case 'phone':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
        return Monitor;
      default:
        return Radio;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 select-none">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#121316]/95 p-6 shadow-2xl backdrop-blur-2xl text-content-primary"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Radio className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-sm font-bold text-white tracking-wide">
                    FLOWDROP RADAR
                  </h3>
                  <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>BROADCASTING</span>
                  </span>
                </div>
                <p className="font-mono text-[10px] text-neutral-400">
                  TAP ANY NEARBY BEACON TO TRANSMIT
                </p>
              </div>
            </div>

            <button
              onClick={closeFlowDrop}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Selected File Badge */}
          {selectedFile && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-sky-400 shrink-0" />
                <div className="truncate">
                  <div className="truncate font-mono text-xs font-semibold text-white">
                    {selectedFile.name}
                  </div>
                  <div className="font-mono text-[9px] text-neutral-400">
                    {Math.round(selectedFile.size / 1024)} KB · READY TO DROP
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                <Share2 className="h-3 w-3" />
                <span>ACTIVE PAYLOAD</span>
              </div>
            </div>
          )}

          {/* Radar Scanner Field (360px circular arena) */}
          <div className="relative mx-auto flex h-80 w-80 items-center justify-center rounded-full border border-sky-500/20 bg-radial from-sky-950/20 via-black/40 to-transparent shadow-inner overflow-hidden my-1">
            {/* Concentric distance rings */}
            <div className="absolute h-64 w-64 rounded-full border border-white/5" />
            <div className="absolute h-48 w-48 rounded-full border border-white/10" />
            <div className="absolute h-32 w-32 rounded-full border border-sky-500/15" />
            <div className="absolute h-16 w-16 rounded-full border border-sky-500/20" />

            {/* Rotating Sonar Radar Beam */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full animate-spin"
              style={{
                animationDuration: '6s',
                background: 'conic-gradient(from 0deg, rgba(56, 189, 248, 0.25) 0deg, transparent 60deg, transparent 360deg)',
              }}
            />

            {/* Radar Crosshairs */}
            <div className="pointer-events-none absolute h-full w-px bg-white/5" />
            <div className="pointer-events-none absolute w-full h-px bg-white/5" />

            {/* Center Local Device Beacon */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-sky-400 bg-sky-950 text-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.5)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-mono text-[9px] font-bold text-sky-300 mt-1">
                YOU
              </span>
            </div>

            {/* Nearby Spatial Device Beacons */}
            {devices.map((dev) => {
              const rad = (dev.angle * Math.PI) / 180;
              const x = Math.cos(rad) * dev.distance;
              const y = Math.sin(rad) * dev.distance;

              const isTarget = activeTransfer?.targetDeviceId === dev.id;
              const isCompleted = isTarget && activeTransfer?.status === 'completed';
              const IconComp = getDeviceIcon(dev.type);

              return (
                <motion.div
                  key={dev.id}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!activeTransfer) {
                      sendToDevice(dev.id);
                    }
                  }}
                  className="group absolute z-20 flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  {/* Outer Progress Ring during transfer */}
                  <div className="relative flex items-center justify-center">
                    {isTarget && (
                      <svg className="absolute -inset-2 h-14 w-14 -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          className="stroke-white/10"
                          strokeWidth="3"
                          fill="transparent"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          className={isCompleted ? 'stroke-emerald-400' : 'stroke-sky-400'}
                          strokeWidth="3"
                          strokeDasharray={150}
                          strokeDashoffset={150 - (150 * (activeTransfer?.progress ?? 0)) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                          style={{ transition: 'stroke-dashoffset 0.25s ease-out' }}
                        />
                      </svg>
                    )}

                    {/* Device Icon Avatar */}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                        isCompleted
                          ? 'border-emerald-400 bg-emerald-950 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.6)]'
                          : isTarget
                          ? 'border-sky-400 bg-sky-950 text-sky-200 animate-pulse'
                          : 'border-white/20 bg-neutral-900/90 text-white hover:border-sky-400 hover:shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <IconComp className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Device Name Label */}
                  <div className="mt-1 flex flex-col items-center text-center">
                    <span className="font-sans text-[10px] font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {dev.name}
                    </span>
                    <span className="font-mono text-[8px] text-neutral-400">
                      {isCompleted
                        ? 'SENT ✓'
                        : isTarget
                        ? `${activeTransfer?.progress}%`
                        : dev.os}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] text-neutral-400">
            <span>AirBridge Protocol v2.5</span>
            <span className="text-sky-400">Visible to Everyone Nearby</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
