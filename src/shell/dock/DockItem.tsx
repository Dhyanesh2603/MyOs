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
      {/* Sleek Linear Floated Tooltip */}
      <div
        role="tooltip"
        className={`pointer-events-none absolute -top-9 z-50 rounded border border-border-subtle bg-surface-panel/95 px-2 py-0.5 text-[10px] font-mono tracking-tight text-content-primary shadow-lg backdrop-blur-md transition-all duration-150 ${
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
        whileTap={{ scale: 0.9 }}
        aria-label={`Open ${manifest.name}`}
        aria-haspopup="false"
        className="relative flex items-center justify-center rounded-xl border border-border-subtle bg-surface-subtle/50 text-content-primary shadow-sm backdrop-blur-md transition-colors hover:border-border-strong hover:bg-surface-subtle/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary"
      >
        <IconComponent className="h-4.5 w-4.5 transition-transform duration-150" />

        {/* Linear / Nothing OS Active Indicator Pip */}
        {isRunning && (
          <span
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 transition-all duration-200 ${
              isFocused
                ? 'h-1 w-2.5 rounded-full bg-accent-primary'
                : 'h-1 w-1 rounded-full bg-content-primary/40'
            }`}
          />
        )}
      </motion.button>
    </div>
  );
};
