import React, { useRef, useState } from 'react';
import {
  motion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import type { AppManifest } from '@contracts/app';

export interface DockItemProps {
  manifest: AppManifest;
  mouseX: MotionValue<number>;
  isRunning: boolean;
  isFocused: boolean;
  onClick: () => void;
}

const BASE_SIZE = 44;
const PEAK_SIZE = 62;
const PROXIMITY_RADIUS = 130;

export const DockItem: React.FC<DockItemProps> = ({
  manifest,
  mouseX,
  isRunning,
  isFocused,
  onClick,
}) => {
  const itemRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Compute horizontal distance from mouse cursor to center of this dock item
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = itemRef.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return val - (bounds.x + bounds.width / 2);
  });

  // Calculate target dimension using a smooth proximity curve
  const widthSync = useTransform(
    distance,
    [-PROXIMITY_RADIUS, 0, PROXIMITY_RADIUS],
    [BASE_SIZE, PEAK_SIZE, BASE_SIZE]
  );

  // Apply responsive spring damping to the calculated dimension
  const size = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 240,
    damping: 15,
  });

  const IconComponent = manifest.icon;

  return (
    <div className="relative flex flex-col items-center">
      {/* Sleek Floated Tooltip */}
      <div
        role="tooltip"
        className={`pointer-events-none absolute -top-10 z-50 rounded-full border border-white/10 bg-surface-overlay/95 px-2.5 py-1 text-[11px] font-medium tracking-wide text-content-primary shadow-lg backdrop-blur-md transition-all duration-150 ${
          isHovered
            ? 'opacity-100 -translate-y-1 scale-100'
            : 'opacity-0 translate-y-1 scale-95'
        }`}
      >
        {manifest.name}
      </div>

      {/* Kinetic Magnetic Icon Button */}
      <motion.button
        ref={itemRef}
        style={{ width: size, height: size }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        whileTap={{ scale: 0.88 }}
        aria-label={`Open ${manifest.name}`}
        aria-haspopup="false"
        className="relative flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-content-primary shadow-sm backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      >
        <IconComponent className="h-5 w-5 transition-transform duration-150" />

        {/* Dynamic Running / Focus Indicator */}
        {isRunning && (
          <span
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 transition-all duration-200 ${
              isFocused
                ? 'h-1 w-3 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(99,102,241,0.85)]'
                : 'h-1 w-1 rounded-full bg-white/60'
            }`}
          />
        )}
      </motion.button>
    </div>
  );
};
