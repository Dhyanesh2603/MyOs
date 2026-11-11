import React from 'react';
import { useThemeStore } from '@core/theme/themeStore';
import type { IconShape } from '@contracts/theme';

export interface IosIconProps {
  className?: string;
  size?: number | string;
  appId?: string;
}

const SHAPE_CLASSES: Record<IconShape, string> = {
  squircle: 'rounded-[22.5%]',
  circle: 'rounded-full',
  rounded: 'rounded-xl',
  smooth: 'rounded-3xl',
};

interface IconWrapperProps {
  children: React.ReactNode;
  vibrantBg: string;
  pastelBg: string;
  neonColor?: string;
  className?: string;
  size?: number | string;
}

/**
 * Universal Morphable App Icon Tile Wrapper
 * Supports 5 distinct icon packs:
 * 1. Vibrant (Authentic iOS gradients, colors & specular highlights)
 * 2. Monochrome (Nothing OS deep matte obsidian, dot-matrix & titanium white)
 * 3. Neon (Cyberpunk midnight violet, electric cyan/magenta glow & neon shadows)
 * 4. Golden (Luxury Onyx carbon, 24K champagne gold foil & amber luster)
 * 5. Pastel (Nordic clean minimalist soft pastel gradients & frosted acrylic)
 */
const IconWrapper: React.FC<IconWrapperProps> = ({
  children,
  vibrantBg,
  pastelBg,
  neonColor = '#06b6d4',
  className = '',
  size,
}) => {
  const iconShape = useThemeStore((s) => s.iconShape);
  const iconPack = useThemeStore((s) => s.iconPack) || 'vibrant';
  const shapeClass = SHAPE_CLASSES[iconShape] || 'rounded-[22.5%]';
  const style = size ? { width: size, height: size } : undefined;

  // 1. Monochrome Pack (Nothing OS Obsidian)
  if (iconPack === 'monochrome') {
    return (
      <div
        style={style}
        className={`relative select-none overflow-hidden ${shapeClass} bg-[#0c0d12] border border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_1px_3px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out transform ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1c24] via-[#111218] to-[#090a0e]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.12] via-transparent to-transparent" />
        <div className={`pointer-events-none absolute inset-0 ${shapeClass} ring-1 ring-inset ring-white/[0.08]`} />
        <div className="relative flex h-full w-full items-center justify-center p-[20%] text-white">
          {children}
        </div>
      </div>
    );
  }

  // 2. Neon Pack (Cyberpunk Glowing Midnight)
  if (iconPack === 'neon') {
    return (
      <div
        style={style}
        className={`relative select-none overflow-hidden ${shapeClass} bg-[#0b0717] border border-[${neonColor}]/40 shadow-[0_0_16px_rgba(6,182,212,0.25),0_2px_8px_rgba(0,0,0,0.8)] transition-all duration-300 ease-out transform ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c0f33] via-[#0d071a] to-[#06030c]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.15] via-transparent to-transparent" />
        <div className={`pointer-events-none absolute inset-0 ${shapeClass} ring-1 ring-inset ring-cyan-400/25`} />
        <div className="relative flex h-full w-full items-center justify-center p-[18%] text-cyan-200 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
          {children}
        </div>
      </div>
    );
  }

  // 3. Golden Pack (Onyx Luxury Champagne Gold)
  if (iconPack === 'golden') {
    return (
      <div
        style={style}
        className={`relative select-none overflow-hidden ${shapeClass} bg-[#11100d] border border-amber-400/35 shadow-[0_4px_18px_rgba(245,158,11,0.2),0_1px_3px_rgba(0,0,0,0.7)] transition-all duration-300 ease-out transform ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#241e12] via-[#16130b] to-[#0a0906]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-200/25 via-transparent to-transparent" />
        <div className={`pointer-events-none absolute inset-0 ${shapeClass} ring-1 ring-inset ring-amber-300/30`} />
        <div className="relative flex h-full w-full items-center justify-center p-[19%] text-amber-300 drop-shadow-[0_1px_4px_rgba(245,158,11,0.4)]">
          {children}
        </div>
      </div>
    );
  }

  // 4. Pastel Pack (Nordic Minimalist Soft Watercolor)
  if (iconPack === 'pastel') {
    return (
      <div
        style={style}
        className={`relative select-none overflow-hidden ${shapeClass} ${pastelBg} border border-white/60 shadow-[0_3px_12px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out transform ${className}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/[0.04]" />
        <div className={`pointer-events-none absolute inset-0 ${shapeClass} ring-1 ring-inset ring-white/40`} />
        <div className="relative flex h-full w-full items-center justify-center p-[18%] text-neutral-800 drop-shadow-sm">
          {children}
        </div>
      </div>
    );
  }

  // 5. Vibrant Pack (Default: Authentic Apple iOS Rich Chromatic)
  return (
    <div
      style={style}
      className={`relative select-none overflow-hidden ${shapeClass} shadow-[0_4px_14px_rgba(0,0,0,0.38),0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out transform ${className}`}
    >
      <div className={`absolute inset-0 ${vibrantBg}`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-white/5 to-transparent" />
      <div className={`pointer-events-none absolute inset-0 ${shapeClass} ring-1 ring-inset ring-white/25`} />
      <div className="relative flex h-full w-full items-center justify-center p-[15%] text-white">
        {children}
      </div>
    </div>
  );
};

// ─── 1. Safari / Browser ──────────────────────────────────────────────────────
export const IosSafariIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#1d4ed8]"
    pastelBg="bg-gradient-to-b from-[#bae6fd] to-[#7dd3fc]"
    neonColor="#06b6d4"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-sm" fill="none">
      <circle cx="50" cy="50" r="43" stroke="currentColor" strokeWidth="2.5" opacity="0.85" />
      <circle cx="50" cy="50" r="39" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeDasharray="1.5 3.5" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="50"
          y1="9"
          x2="50"
          y2={deg % 90 === 0 ? '14' : '12'}
          stroke="currentColor"
          strokeWidth={deg % 90 === 0 ? '2' : '1'}
          opacity={deg % 90 === 0 ? '0.9' : '0.5'}
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      <g transform="rotate(45 50 50)">
        <polygon points="50,14 43.5,50 50,46" fill="#ef4444" />
        <polygon points="50,14 56.5,50 50,46" fill="#dc2626" />
        <polygon points="50,86 43.5,50 50,54" fill="#e2e8f0" />
        <polygon points="50,86 56.5,50 50,54" fill="#ffffff" />
        <circle cx="50" cy="50" r="4.5" fill="#0f172a" />
        <circle cx="50" cy="50" r="2.2" fill="#ffffff" />
      </g>
    </svg>
  </IconWrapper>
);

// ─── 2. Finder / Files ────────────────────────────────────────────────────────
export const IosFilesIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#60a5fa] via-[#3b82f6] to-[#1d4ed8]"
    pastelBg="bg-gradient-to-b from-[#bfdbfe] to-[#93c5fd]"
    neonColor="#3b82f6"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <path
        d="M16 32 C16 28, 19 25, 23 25 L40 25 C43 25, 46 28, 48 31 L52 36 C54 39, 57 41, 61 41 L77 41 C81 41, 84 44, 84 48 L84 73 C84 77, 81 80, 77 80 L23 80 C19 80, 16 77, 16 73 Z"
        fill="#93c5fd"
        opacity="0.9"
      />
      <rect x="25" y="32" width="50" height="34" rx="3" fill="#ffffff" opacity="0.95" />
      <line x1="32" y1="41" x2="52" y2="41" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="48" x2="68" y2="48" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="55" x2="60" y2="55" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16 45 C16 41, 19 38, 23 38 L77 38 C81 38, 84 41, 84 45 L84 74 C84 78, 81 81, 77 81 L23 81 C19 81, 16 78, 16 74 Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  </IconWrapper>
);

// ─── 3. Settings ──────────────────────────────────────────────────────────────
export const IosSettingsIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#94a3b8] via-[#64748b] to-[#334155]"
    pastelBg="bg-gradient-to-b from-[#e2e8f0] to-[#cbd5e1]"
    neonColor="#94a3b8"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="50" cy="50" r="35" fill="currentColor" opacity="0.3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="44.5"
          y="10"
          width="11"
          height="14"
          rx="3"
          fill="currentColor"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="28" fill="currentColor" opacity="0.8" />
      <circle cx="50" cy="50" r="18" fill="#1e293b" />
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.9" />
    </svg>
  </IconWrapper>
);

// ─── 4. Music ─────────────────────────────────────────────────────────────────
export const IosMusicIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#fb7185] via-[#f43f5e] to-[#e11d48]"
    pastelBg="bg-gradient-to-b from-[#fecdd3] to-[#fda4af]"
    neonColor="#f43f5e"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="currentColor">
      <path d="M72 23 C72 20.8, 70.2 19, 68 19 L42 24 C40 24.4, 38.5 26.2, 38.5 28.2 L38.5 63.5 C36.5 61.5, 33 60.5, 29.5 60.5 C22.5 60.5, 17 65, 17 71 C17 77, 22.5 81.5, 29.5 81.5 C36.5 81.5, 42 77, 42 71 L42 41 L68.5 36 L68.5 56.5 C66.5 54.5, 63 53.5, 59.5 53.5 C52.5 53.5, 47 58, 47 64 C47 70, 52.5 74.5, 59.5 74.5 C66.5 74.5, 72 70, 72 64 L72 23 Z" />
    </svg>
  </IconWrapper>
);

// ─── 5. Terminal ──────────────────────────────────────────────────────────────
export const IosTerminalIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#18181b] via-[#09090b] to-[#000000]"
    pastelBg="bg-gradient-to-b from-[#f1f5f9] to-[#e2e8f0]"
    neonColor="#22c55e"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow" fill="none">
      <rect x="14" y="16" width="72" height="68" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="14" y1="28" x2="86" y2="28" stroke="#27272a" strokeWidth="1.5" />
      <circle cx="23" cy="22" r="2.5" fill="#ef4444" />
      <circle cx="31" cy="22" r="2.5" fill="#f59e0b" />
      <circle cx="39" cy="22" r="2.5" fill="#10b981" />
      <path d="M26 42 L42 54 L26 66" stroke="#4ade80" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="48" y="61" width="22" height="6" rx="2" fill="#4ade80" />
    </svg>
  </IconWrapper>
);

// ─── 6. Notes ─────────────────────────────────────────────────────────────────
export const IosNotesIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#fbbf24] via-[#f59e0b] to-[#d97706]"
    pastelBg="bg-gradient-to-b from-[#fef08a] to-[#fde047]"
    neonColor="#f59e0b"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="18" y="16" width="64" height="68" rx="7" fill="#ffffff" />
      <path d="M18 16 H82 V34 H18 Z" fill="#fbbf24" />
      <line x1="18" y1="34" x2="82" y2="34" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="26" y1="44" x2="74" y2="44" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="54" x2="74" y2="54" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="64" x2="74" y2="64" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="74" x2="58" y2="74" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </IconWrapper>
);

// ─── 7. Code Editor ───────────────────────────────────────────────────────────
export const IosCodeIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#1e3a8a]"
    pastelBg="bg-gradient-to-b from-[#bae6fd] to-[#93c5fd]"
    neonColor="#38bdf8"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="50" cy="50" r="36" stroke="#38bdf8" strokeWidth="1" opacity="0.4" strokeDasharray="2 3" />
      <path d="M34 38 L22 50 L34 62" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66 38 L78 50 L66 62" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="55" y1="34" x2="45" y2="66" stroke="#38bdf8" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  </IconWrapper>
);

// ─── 8. Calculator ────────────────────────────────────────────────────────────
export const IosCalculatorIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#292524] via-[#1c1917] to-[#0c0a09]"
    pastelBg="bg-gradient-to-b from-[#fed7aa] to-[#fdba74]"
    neonColor="#f97316"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="32" cy="32" r="14" fill="#57534e" />
      <text x="32" y="37" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">C</text>
      <circle cx="68" cy="32" r="14" fill="#f97316" />
      <text x="68" y="37" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">÷</text>
      <circle cx="32" cy="68" r="14" fill="#57534e" />
      <text x="32" y="74" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">+</text>
      <circle cx="68" cy="68" r="14" fill="#f97316" />
      <text x="68" y="74" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">=</text>
    </svg>
  </IconWrapper>
);

// ─── 9. Photos / Gallery ──────────────────────────────────────────────────────
export const IosPhotosIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#e2e8f0]"
    pastelBg="bg-gradient-to-b from-[#fce7f3] to-[#ede9fe]"
    neonColor="#ec4899"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-sm" fill="none">
      <g transform="translate(50, 50)">
        {[
          { angle: 0, color: '#f43f5e' },
          { angle: 45, color: '#f97316' },
          { angle: 90, color: '#eab308' },
          { angle: 135, color: '#22c55e' },
          { angle: 180, color: '#06b6d4' },
          { angle: 225, color: '#3b82f6' },
          { angle: 270, color: '#8b5cf6' },
          { angle: 315, color: '#ec4899' },
        ].map((petal) => (
          <ellipse
            key={petal.angle}
            cx="0"
            cy="-17"
            rx="9"
            ry="18"
            fill={petal.color}
            opacity="0.85"
            transform={`rotate(${petal.angle})`}
          />
        ))}
        <circle cx="0" cy="0" r="7" fill="#ffffff" />
      </g>
    </svg>
  </IconWrapper>
);

// ─── 10. Camera / OnyxCam ─────────────────────────────────────────────────────
export const IosCameraIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#94a3b8] via-[#64748b] to-[#475569]"
    pastelBg="bg-gradient-to-b from-[#cbd5e1] to-[#94a3b8]"
    neonColor="#06b6d4"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="14" y="26" width="72" height="54" rx="10" fill="#1e293b" />
      <path d="M36 26 L42 18 L58 18 L64 26 Z" fill="#1e293b" />
      <circle cx="72" cy="38" r="4.5" fill="#fbbf24" />
      <circle cx="50" cy="53" r="23" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />
      <circle cx="50" cy="53" r="17" fill="#1e1b4b" stroke="#3b82f6" strokeWidth="1.5" />
      <circle cx="50" cy="53" r="10" fill="#0284c7" />
      <circle cx="46" cy="49" r="4" fill="#ffffff" opacity="0.75" />
    </svg>
  </IconWrapper>
);

// ─── 11. Activity / Task Manager ──────────────────────────────────────────────
export const IosActivityIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#18181b] via-[#09090b] to-[#000000]"
    pastelBg="bg-gradient-to-b from-[#fecdd3] to-[#fed7aa]"
    neonColor="#f43f5e"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow" fill="none">
      <circle cx="50" cy="50" r="34" stroke="#f43f5e" strokeWidth="5.5" strokeLinecap="round" opacity="0.3" />
      <path d="M50 16 A 34 34 0 1 1 24 74" stroke="#f43f5e" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="50" cy="50" r="24" stroke="#22c55e" strokeWidth="5.5" strokeLinecap="round" opacity="0.3" />
      <path d="M50 26 A 24 24 0 1 1 32 67" stroke="#22c55e" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="50" cy="50" r="14" stroke="#06b6d4" strokeWidth="5.5" strokeLinecap="round" opacity="0.3" />
      <path d="M50 36 A 14 14 0 1 1 40 60" stroke="#06b6d4" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  </IconWrapper>
);

// ─── 12. App Store ────────────────────────────────────────────────────────────
export const IosAppStoreIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#1d4ed8]"
    pastelBg="bg-gradient-to-b from-[#bae6fd] to-[#7dd3fc]"
    neonColor="#38bdf8"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <g stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <line x1="50" y1="20" x2="22" y2="76" />
        <line x1="50" y1="20" x2="78" y2="76" />
        <line x1="28" y1="60" x2="72" y2="60" />
      </g>
    </svg>
  </IconWrapper>
);

// ─── 13. Personal OS Core ─────────────────────────────────────────────────────
export const IosPersonalOsIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#4f46e5] via-[#4338ca] to-[#1e1b4b]"
    pastelBg="bg-gradient-to-b from-[#c7d2fe] to-[#a5b4fc]"
    neonColor="#818cf8"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" opacity="0.6" />
      <circle cx="50" cy="50" r="23" stroke="currentColor" strokeWidth="2" opacity="0.8" />
      <circle cx="50" cy="50" r="10" fill="currentColor" />
      <circle cx="50" cy="16" r="4.5" fill="#38bdf8" />
      <circle cx="73" cy="50" r="4.5" fill="#ec4899" />
      <circle cx="50" cy="84" r="4.5" fill="#f59e0b" />
      <circle cx="27" cy="50" r="4.5" fill="#10b981" />
    </svg>
  </IconWrapper>
);

// ─── 14. Paint / Canvas ───────────────────────────────────────────────────────
export const IosPaintIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]"
    pastelBg="bg-gradient-to-b from-[#fed7aa] to-[#fbcfe8]"
    neonColor="#a855f7"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <path
        d="M50 16 C30 16 16 30 16 50 C16 68 28 82 46 82 C52 82 56 78 56 74 C56 72 55 70 54 68 C53 66 52 64 52 62 C52 58 56 54 60 54 L68 54 C76 54 84 46 84 36 C84 25 69 16 50 16 Z"
        fill="#fed7aa"
        stroke="#ea580c"
        strokeWidth="2"
      />
      <circle cx="32" cy="34" r="5.5" fill="#ef4444" />
      <circle cx="48" cy="28" r="5.5" fill="#eab308" />
      <circle cx="64" cy="36" r="5.5" fill="#3b82f6" />
      <circle cx="32" cy="52" r="5.5" fill="#22c55e" />
      <circle cx="38" cy="68" r="5.5" fill="#a855f7" />
      <ellipse cx="68" cy="66" rx="5" ry="6" fill="#f8fafc" stroke="#ea580c" strokeWidth="1.5" />
    </svg>
  </IconWrapper>
);

// ─── 15. FlowShot / OnyxShot ──────────────────────────────────────────────────
export const IosFlowshotIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#8b5cf6] via-[#7c3aed] to-[#5b21b6]"
    pastelBg="bg-gradient-to-b from-[#ddd6fe] to-[#c4b5fd]"
    neonColor="#a855f7"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="18" y="20" width="64" height="48" rx="6" stroke="currentColor" strokeWidth="3" opacity="0.6" />
      <path d="M26 36 V28 H34" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M74 36 V28 H66" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 52 V60 H34" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M74 52 V60 H66" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="44" r="6" fill="#38bdf8" />
      <circle cx="50" cy="44" r="2.5" fill="#ffffff" />
    </svg>
  </IconWrapper>
);

// ─── 16. Synth ────────────────────────────────────────────────────────────────
export const IosSynthIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#ea580c] via-[#c2410c] to-[#9a3412]"
    pastelBg="bg-gradient-to-b from-[#ffedd5] to-[#fed7aa]"
    neonColor="#f97316"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="50" cy="40" r="20" fill="#292524" stroke="#fdba74" strokeWidth="2" />
      <line x1="50" y1="40" x2="62" y2="28" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="18" y="66" width="64" height="18" rx="3" fill="#ffffff" />
      <line x1="34" y1="66" x2="34" y2="84" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="50" y1="66" x2="50" y2="84" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="66" y1="66" x2="66" y2="84" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="28" y="66" width="7" height="10" fill="#0f172a" />
      <rect x="58" y="66" width="7" height="10" fill="#0f172a" />
    </svg>
  </IconWrapper>
);

// ─── 17. Onyx Tape ────────────────────────────────────────────────────────────
export const IosFlowtapeIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#18181b] via-[#09090b] to-[#000000]"
    pastelBg="bg-gradient-to-b from-[#fed7aa] to-[#fecdd3]"
    neonColor="#f43f5e"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {[
        { x: 22, h: 22 },
        { x: 30, h: 38 },
        { x: 38, h: 56 },
        { x: 46, h: 42 },
        { x: 54, h: 64 },
        { x: 62, h: 48 },
        { x: 70, h: 32 },
        { x: 78, h: 18 },
      ].map((bar) => (
        <line
          key={bar.x}
          x1={bar.x}
          y1={50 - bar.h / 2}
          x2={bar.x}
          y2={50 + bar.h / 2}
          stroke="#f43f5e"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
    </svg>
  </IconWrapper>
);

// ─── 18. OnyxBoard ────────────────────────────────────────────────────────────
export const IosFlowboardIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#059669] via-[#047857] to-[#064e3b]"
    pastelBg="bg-gradient-to-b from-[#a7f3d0] to-[#6ee7b7]"
    neonColor="#10b981"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="20" y="20" width="26" height="26" rx="5" fill="#fde047" />
      <rect x="54" y="20" width="26" height="26" rx="5" fill="#38bdf8" />
      <rect x="20" y="54" width="26" height="26" rx="5" fill="#f43f5e" />
      <rect x="54" y="54" width="26" height="26" rx="5" fill="#a7f3d0" />
      <path d="M33 33 L67 67" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="3 3" />
    </svg>
  </IconWrapper>
);

// ─── 19. Cyber Pong ───────────────────────────────────────────────────────────
export const IosCyberPongIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#090a0f] via-[#121420] to-[#050608]"
    pastelBg="bg-gradient-to-b from-[#e0e7ff] to-[#c7d2fe]"
    neonColor="#06b6d4"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="18" y="30" width="6" height="40" rx="3" fill="#06b6d4" />
      <rect x="76" y="38" width="6" height="40" rx="3" fill="#f43f5e" />
      <circle cx="50" cy="50" r="7" fill="#ffffff" />
    </svg>
  </IconWrapper>
);

// ─── 20. Snake Arena ──────────────────────────────────────────────────────────
export const IosSnakeArenaIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#0f172a] via-[#022c22] to-[#064e3b]"
    pastelBg="bg-gradient-to-b from-[#bbf7d0] to-[#86efac]"
    neonColor="#22c55e"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <path
        d="M20 70 L50 70 L50 40 L75 40"
        stroke="#22c55e"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="30" r="5" fill="#f43f5e" />
    </svg>
  </IconWrapper>
);

// ─── 21. Connect 4 ────────────────────────────────────────────────────────────
export const IosConnectFourIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#3b82f6] via-[#1d4ed8] to-[#1e1b4b]"
    pastelBg="bg-gradient-to-b from-[#bfdbfe] to-[#93c5fd]"
    neonColor="#3b82f6"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="26" cy="30" r="9" fill="#ef4444" />
      <circle cx="48" cy="30" r="9" fill="#facc15" />
      <circle cx="70" cy="30" r="9" fill="#ef4444" />
      <circle cx="26" cy="52" r="9" fill="#facc15" />
      <circle cx="48" cy="52" r="9" fill="#ef4444" />
      <circle cx="70" cy="52" r="9" fill="#facc15" />
      <circle cx="26" cy="74" r="9" fill="#ef4444" />
      <circle cx="48" cy="74" r="9" fill="#ef4444" />
      <circle cx="70" cy="74" r="9" fill="#facc15" />
    </svg>
  </IconWrapper>
);

// ─── 22. 2048 ─────────────────────────────────────────────────────────────────
export const IosRetro2048Icon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#b45309]"
    pastelBg="bg-gradient-to-b from-[#fde68a] to-[#fcd34d]"
    neonColor="#f59e0b"
    className={className}
    size={size}
  >
    <div className="flex h-full w-full flex-col items-center justify-center font-sans font-black tracking-tighter text-white drop-shadow-md">
      <span className="text-[28px] leading-none">20</span>
      <span className="text-[28px] leading-none">48</span>
    </div>
  </IconWrapper>
);

// ─── 23. Minesweeper ──────────────────────────────────────────────────────────
export const IosRetroSweeperIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#64748b] via-[#475569] to-[#334155]"
    pastelBg="bg-gradient-to-b from-[#cbd5e1] to-[#94a3b8]"
    neonColor="#94a3b8"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="48" cy="56" r="22" fill="#0f172a" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="48"
          y1="28"
          x2="48"
          y2="23"
          stroke="#0f172a"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${deg} 48 56)`}
        />
      ))}
      <circle cx="42" cy="50" r="4" fill="#ffffff" opacity="0.6" />
      <path d="M56 38 C62 30, 68 34, 74 24" stroke="#fbbf24" strokeWidth="3" fill="none" />
      <circle cx="74" cy="24" r="3.5" fill="#ef4444" />
    </svg>
  </IconWrapper>
);

// ─── 24. Launchpad / App Library ──────────────────────────────────────────────
export const IosLaunchpadIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#6366f1] via-[#4f46e5] to-[#312e81]"
    pastelBg="bg-gradient-to-b from-[#e0e7ff] to-[#c7d2fe]"
    neonColor="#818cf8"
    className={className}
    size={size}
  >
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.35" />
      <circle cx="30" cy="30" r="6" fill="currentColor" />
      <circle cx="50" cy="30" r="6" fill="currentColor" />
      <circle cx="70" cy="30" r="6" fill="currentColor" />
      <circle cx="30" cy="50" r="6" fill="currentColor" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
      <circle cx="70" cy="50" r="6" fill="currentColor" />
      <circle cx="30" cy="70" r="6" fill="currentColor" />
      <circle cx="50" cy="70" r="6" fill="currentColor" />
      <circle cx="70" cy="70" r="6" fill="currentColor" />
    </svg>
  </IconWrapper>
);

export const IOS_APP_ICONS: Record<string, React.FC<IosIconProps>> = {
  launchpad: IosLaunchpadIcon,
  browser: IosSafariIcon,
  'file-explorer': IosFilesIcon,
  'system-settings': IosSettingsIcon,
  music: IosMusicIcon,
  terminal: IosTerminalIcon,
  notes: IosNotesIcon,
  calculator: IosCalculatorIcon,
  'code-editor': IosCodeIcon,
  gallery: IosPhotosIcon,
  flowcam: IosCameraIcon,
  'task-manager': IosActivityIcon,
  'app-store': IosAppStoreIcon,
  'personal-os': IosPersonalOsIcon,
  paint: IosPaintIcon,
  flowshot: IosFlowshotIcon,
  synth: IosSynthIcon,
  flowtape: IosFlowtapeIcon,
  flowboard: IosFlowboardIcon,
  'cyber-pong': IosCyberPongIcon,
  'snake-arena': IosSnakeArenaIcon,
  'connect-four': IosConnectFourIcon,
  'retro-2048': IosRetro2048Icon,
  'retro-sweeper': IosRetroSweeperIcon,
};

/**
 * Main Dynamic IosAppIcon Component
 * Renders the active icon pack icon for any given appId, or fallback generic tile.
 */
export const IosAppIcon: React.FC<IosIconProps> = ({ appId, className = 'w-full h-full', size }) => {
  if (appId && IOS_APP_ICONS[appId]) {
    const Component = IOS_APP_ICONS[appId]!;
    return <Component className={className} size={size} />;
  }

  // Fallback for custom or unknown apps
  return (
    <IconWrapper
      vibrantBg="bg-gradient-to-b from-[#6366f1] via-[#4f46e5] to-[#312e81]"
      pastelBg="bg-gradient-to-b from-[#e0e7ff] to-[#c7d2fe]"
      neonColor="#818cf8"
      className={className}
      size={size}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="22" y="22" width="56" height="56" rx="12" strokeWidth="3" />
        <circle cx="50" cy="50" r="8" fill="currentColor" stroke="none" />
        <circle cx="68" cy="32" r="3" fill="currentColor" stroke="none" />
      </svg>
    </IconWrapper>
  );
};
