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
  mono?: React.ReactNode;
  vibrantBg: string;
  pastelBg: string;
  neonColor?: string;
  className?: string;
  size?: number | string;
}

/**
 * Universal Morphable App Icon Tile Engine
 * Packs:
 * 1. Monochrome (Default - Nothing OS deep matte obsidian, dot-matrix & titanium white)
 * 2. Vibrant (Authentic iOS gradients, chromatic hues & specular highlights)
 * 3. Neon (Cyberpunk midnight violet, electric cyan/magenta glow & neon shadows)
 * 4. Pastel (Nordic clean minimalist soft pastel watercolor gradients)
 */
const IconWrapper: React.FC<IconWrapperProps> = ({
  children,
  mono,
  vibrantBg,
  pastelBg,
  neonColor = '#06b6d4',
  className = '',
  size,
}) => {
  const iconShape = useThemeStore((s) => s.iconShape);
  const iconPack = useThemeStore((s) => s.iconPack) || 'monochrome';
  const shapeClass = SHAPE_CLASSES[iconShape] || 'rounded-[22.5%]';
  const style = size ? { width: size, height: size } : undefined;

  // 1. Monochrome Pack (Nothing OS Obsidian - STRICT DEFAULT)
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
          {mono || children}
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
          {mono || children}
        </div>
      </div>
    );
  }

  // 3. Pastel Pack (Nordic Minimalist Soft Watercolor)
  if (iconPack === 'pastel') {
    return (
      <div
        style={style}
        className={`relative select-none overflow-hidden ${shapeClass} ${pastelBg} border border-white/60 shadow-[0_3px_12px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out transform ${className}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/[0.04]" />
        <div className={`pointer-events-none absolute inset-0 ${shapeClass} ring-1 ring-inset ring-white/40`} />
        <div className="relative flex h-full w-full items-center justify-center p-[18%] text-neutral-800 drop-shadow-sm">
          {mono || children}
        </div>
      </div>
    );
  }

  // 4. Vibrant Pack (Apple iOS Rich Chromatic)
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
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="38" strokeWidth="2.5" />
        <ellipse cx="50" cy="50" rx="18" ry="38" strokeWidth="2" strokeDasharray="3 2" />
        <line x1="12" y1="50" x2="88" y2="50" strokeWidth="2" />
        <line x1="50" y1="12" x2="50" y2="88" strokeWidth="2" />
        <circle cx="50" cy="50" r="3" fill="#ffffff" stroke="none" />
      </svg>
    }
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
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <path
          d="M16 28 C16 24, 19 22, 23 22 L40 22 C43 22, 46 25, 48 28 L53 34 C55 37, 58 39, 62 39 L77 39 C81 39, 84 42, 84 46 L84 74 C84 78, 81 81, 77 81 L23 81 C19 81, 16 78, 16 74 Z"
          strokeWidth="2.5"
        />
        <line x1="28" y1="52" x2="56" y2="52" strokeWidth="2" strokeLinecap="round" />
        <line x1="28" y1="62" x2="72" y2="62" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
        <circle cx="70" cy="30" r="2.5" fill="#ffffff" stroke="none" />
      </svg>
    }
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
      />
    </svg>
  </IconWrapper>
);

// ─── 3. Settings ─────────────────────────────────────────────────────────────
export const IosSettingsIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#64748b] via-[#475569] to-[#334155]"
    pastelBg="bg-gradient-to-b from-[#cbd5e1] to-[#94a3b8]"
    neonColor="#94a3b8"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="28" strokeWidth="2.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <rect
            key={deg}
            x="46"
            y="12"
            width="8"
            height="12"
            rx="2"
            fill="currentColor"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="14" strokeWidth="2" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="4.5" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="50" cy="50" r="32" fill="#94a3b8" opacity="0.3" />
      <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="45"
          y="11"
          width="10"
          height="14"
          rx="2.5"
          fill="currentColor"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="16" fill="#1e293b" />
      <circle cx="50" cy="50" r="14" stroke="#94a3b8" strokeWidth="2" strokeDasharray="2.5 2.5" />
      <circle cx="50" cy="50" r="6" fill="#ffffff" />
    </svg>
  </IconWrapper>
);

// ─── 4. Music ────────────────────────────────────────────────────────────────
export const IosMusicIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#f43f5e] via-[#e11d48] to-[#be123c]"
    pastelBg="bg-gradient-to-b from-[#fecdd3] to-[#fda4af]"
    neonColor="#f43f5e"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <path
          d="M68 22 L42 27 L42 64 C40 62, 36 61, 32 61 C24 61, 18 66, 18 72 C18 78, 24 83, 32 83 C40 83, 46 78, 46 72 L46 38 L68 33 L68 58 C66 56, 62 55, 58 55 C50 55, 44 60, 44 66 C44 72, 50 77, 58 77 C66 77, 72 72, 72 66 L72 22 Z"
          strokeWidth="2.5"
          fill="currentColor"
        />
        <circle cx="70" cy="22" r="3" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-lg" fill="none">
      <path
        d="M72 20 L40 26 L40 64 C37 61, 32 60, 28 60 C18 60, 12 66, 12 73 C12 80, 18 86, 28 86 C37 86, 44 80, 44 73 L44 38 L72 32 L72 58 C69 55, 64 54, 60 54 C50 54, 44 60, 44 67 C44 74, 50 80, 60 80 C69 80, 76 74, 76 67 L76 20 Z"
        fill="currentColor"
      />
      <circle cx="74" cy="20" r="3.5" fill="#ffffff" />
    </svg>
  </IconWrapper>
);

// ─── 5. Terminal ─────────────────────────────────────────────────────────────
export const IosTerminalIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617]"
    pastelBg="bg-gradient-to-b from-[#e2e8f0] to-[#cbd5e1]"
    neonColor="#38bdf8"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
        <rect x="14" y="16" width="72" height="68" rx="8" stroke="currentColor" strokeWidth="2" />
        <line x1="14" y1="30" x2="86" y2="30" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
        <circle cx="24" cy="23" r="2.5" fill="currentColor" fillOpacity="0.8" />
        <circle cx="32" cy="23" r="2.5" fill="currentColor" fillOpacity="0.4" />
        <circle cx="40" cy="23" r="2.5" fill="currentColor" fillOpacity="0.4" />
        <path d="M26 44 L40 54 L26 64" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="46" y1="64" x2="66" y2="64" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
      <rect x="14" y="18" width="72" height="64" rx="8" fill="#090d16" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <path d="M14 18 L86 18 L86 28 L14 28 Z" fill="rgba(255,255,255,0.06)" />
      <circle cx="22" cy="23" r="2" fill="#ef4444" />
      <circle cx="28" cy="23" r="2" fill="#eab308" />
      <circle cx="34" cy="23" r="2" fill="#22c55e" />
      <path d="M26 44 L42 52 L26 60" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="48" y1="60" x2="68" y2="60" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </IconWrapper>
);

// ─── 6. Notes ────────────────────────────────────────────────────────────────
export const IosNotesIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#fbbf24] via-[#f59e0b] to-[#d97706]"
    pastelBg="bg-gradient-to-b from-[#fef3c7] to-[#fde68a]"
    neonColor="#f59e0b"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="20" y="18" width="60" height="64" rx="6" strokeWidth="2.5" />
        <line x1="32" y1="34" x2="54" y2="34" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="46" x2="68" y2="46" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        <line x1="32" y1="56" x2="68" y2="56" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="66" x2="58" y2="66" strokeWidth="2" strokeLinecap="round" />
        <circle cx="68" cy="34" r="2.5" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="20" y="16" width="60" height="68" rx="6" fill="#ffffff" />
      <path d="M20 16 L80 16 L80 26 L20 26 Z" fill="#f59e0b" />
      <line x1="30" y1="36" x2="54" y2="36" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1="30" y1="48" x2="70" y2="48" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="58" x2="70" y2="58" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="68" x2="60" y2="68" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </IconWrapper>
);

// ─── 7. Calculator ───────────────────────────────────────────────────────────
export const IosCalculatorIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#ea580c] via-[#c2410c] to-[#9a3412]"
    pastelBg="bg-gradient-to-b from-[#ffedd5] to-[#fed7aa]"
    neonColor="#f97316"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="18" y="16" width="64" height="68" rx="8" strokeWidth="2" />
        <rect x="26" y="24" width="48" height="16" rx="3" fill="currentColor" fillOpacity="0.12" strokeWidth="1.5" />
        <circle cx="66" cy="32" r="2" fill="#ffffff" stroke="none" />
        <circle cx="34" cy="52" r="4" fill="currentColor" stroke="none" />
        <circle cx="50" cy="52" r="4" fill="currentColor" stroke="none" />
        <circle cx="66" cy="52" r="4" fill="currentColor" stroke="none" />
        <circle cx="34" cy="68" r="4" fill="currentColor" stroke="none" />
        <circle cx="50" cy="68" r="4" fill="currentColor" stroke="none" />
        <circle cx="66" cy="68" r="4" fill="currentColor" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="18" y="16" width="64" height="68" rx="8" fill="#1e293b" />
      <rect x="24" y="22" width="52" height="18" rx="4" fill="#0f172a" stroke="rgba(255,255,255,0.15)" />
      <circle cx="33" cy="50" r="4.5" fill="#64748b" />
      <circle cx="50" cy="50" r="4.5" fill="#64748b" />
      <circle cx="67" cy="50" r="4.5" fill="#f97316" />
      <circle cx="33" cy="64" r="4.5" fill="#64748b" />
      <circle cx="50" cy="64" r="4.5" fill="#64748b" />
      <circle cx="67" cy="64" r="4.5" fill="#f97316" />
      <circle cx="33" cy="76" r="4.5" fill="#64748b" />
      <circle cx="50" cy="76" r="4.5" fill="#64748b" />
      <circle cx="67" cy="76" r="4.5" fill="#f97316" />
    </svg>
  </IconWrapper>
);

// ─── 8. Activity Monitor ─────────────────────────────────────────────────────
export const IosActivityIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#10b981] via-[#059669] to-[#047857]"
    pastelBg="bg-gradient-to-b from-[#d1fae5] to-[#a7f3d0]"
    neonColor="#10b981"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="38" strokeWidth="2" strokeDasharray="3 3" />
        <path
          d="M16 50 L34 50 L42 26 L52 74 L60 42 L68 54 L74 50 L84 50"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="74" cy="50" r="3" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="2.5" opacity="0.4" />
      <line x1="16" y1="50" x2="84" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
      <path
        d="M18 50 L34 50 L42 24 L52 76 L60 42 L68 56 L74 50 L82 50"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="74" cy="50" r="3.5" fill="#fde047" />
    </svg>
  </IconWrapper>
);

// ─── 9. Code Editor ──────────────────────────────────────────────────────────
export const IosCodeIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#6366f1] via-[#4f46e5] to-[#3730a3]"
    pastelBg="bg-gradient-to-b from-[#e0e7ff] to-[#c7d2fe]"
    neonColor="#6366f1"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <path d="M36 32 L18 50 L36 68" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M64 32 L82 50 L64 68" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="56" y1="26" x2="44" y2="74" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="50" r="2.5" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <path d="M34 32 L16 50 L34 68" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66 32 L84 50 L66 68" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="58" y1="24" x2="42" y2="76" stroke="#e0e7ff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </IconWrapper>
);

// ─── 10. Onyx Paint ───────────────────────────────────────────────────────────
export const IosPaintIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#ec4899] via-[#db2777] to-[#be185d]"
    pastelBg="bg-gradient-to-b from-[#fce7f3] to-[#fbcfe8]"
    neonColor="#ec4899"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <path
          d="M50 18 C30 18, 16 32, 16 52 C16 70, 30 82, 48 82 C54 82, 58 78, 58 72 C58 68, 56 66, 56 62 C56 56, 62 52, 68 52 L72 52 C78 52, 84 46, 84 38 C84 26, 68 18, 50 18 Z"
          strokeWidth="2.5"
        />
        <circle cx="32" cy="40" r="3.5" fill="currentColor" stroke="none" />
        <circle cx="48" cy="32" r="3.5" fill="currentColor" stroke="none" />
        <circle cx="64" cy="40" r="3.5" fill="currentColor" stroke="none" />
        <circle cx="36" cy="60" r="3.5" fill="currentColor" fillOpacity="0.3" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <path
        d="M50 16 C30 16, 16 30, 16 50 C16 68, 30 82, 48 82 C54 82, 58 78, 58 72 C58 68, 56 65, 56 61 C56 55, 62 51, 68 51 L72 51 C80 51, 86 45, 86 37 C86 25, 70 16, 50 16 Z"
        fill="#ffffff"
      />
      <circle cx="32" cy="38" r="4.5" fill="#ef4444" />
      <circle cx="48" cy="30" r="4.5" fill="#3b82f6" />
      <circle cx="64" cy="38" r="4.5" fill="#22c55e" />
      <circle cx="36" cy="58" r="4.5" fill="#eab308" />
      <circle cx="68" cy="64" r="5" fill="#ec4899" />
    </svg>
  </IconWrapper>
);

// ─── 11. Photos / Gallery ────────────────────────────────────────────────────
export const IosPhotosIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#14b8a6] via-[#0d9488] to-[#0f766e]"
    pastelBg="bg-gradient-to-b from-[#ccfbf1] to-[#99f6e4]"
    neonColor="#14b8a6"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="38" strokeWidth="2" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="12"
            x2="32"
            y2="50"
            strokeWidth="2"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="14" strokeWidth="2" />
        <circle cx="50" cy="50" r="3.5" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="50" cy="50" r="42" fill="#ffffff" />
      <g transform="translate(50,50)">
        <ellipse cx="0" cy="-22" rx="7" ry="15" fill="#f43f5e" />
        <ellipse cx="19" cy="-11" rx="7" ry="15" fill="#fb923c" transform="rotate(60)" />
        <ellipse cx="19" cy="11" rx="7" ry="15" fill="#facc15" transform="rotate(120)" />
        <ellipse cx="0" cy="22" rx="7" ry="15" fill="#22c55e" transform="rotate(180)" />
        <ellipse cx="-19" cy="11" rx="7" ry="15" fill="#06b6d4" transform="rotate(240)" />
        <ellipse cx="-19" cy="-11" rx="7" ry="15" fill="#8b5cf6" transform="rotate(300)" />
      </g>
    </svg>
  </IconWrapper>
);

// ─── 12. OnyxShot ────────────────────────────────────────────────────────────
export const IosFlowshotIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9]"
    pastelBg="bg-gradient-to-b from-[#ede9fe] to-[#ddd6fe]"
    neonColor="#8b5cf6"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <path d="M18 34 L18 20 L34 20" strokeWidth="3" strokeLinecap="round" />
        <path d="M66 20 L82 20 L82 34" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 66 L18 80 L34 80" strokeWidth="3" strokeLinecap="round" />
        <path d="M66 80 L82 80 L82 66" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="50" r="16" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="3" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <path d="M18 34 L18 20 L34 20" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" />
      <path d="M66 20 L82 20 L82 34" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" />
      <path d="M18 66 L18 80 L34 80" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" />
      <path d="M66 80 L82 80 L82 66" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="50" r="18" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="5" fill="#f43f5e" />
    </svg>
  </IconWrapper>
);

// ─── 13. App Store ───────────────────────────────────────────────────────────
export const IosAppStoreIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#075985]"
    pastelBg="bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd]"
    neonColor="#0284c7"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <path d="M50 18 L82 34 L82 66 L50 82 L18 66 L18 34 Z" strokeWidth="2.5" />
        <line x1="50" y1="18" x2="50" y2="82" strokeWidth="2" />
        <line x1="50" y1="50" x2="82" y2="34" strokeWidth="2" />
        <line x1="50" y1="50" x2="18" y2="34" strokeWidth="2" />
        <circle cx="50" cy="50" r="3" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <path d="M50 18 L82 34 L82 66 L50 82 L18 66 L18 34 Z" stroke="#38bdf8" strokeWidth="2.5" />
      <line x1="50" y1="18" x2="50" y2="82" stroke="#ffffff" strokeWidth="2" />
      <line x1="50" y1="50" x2="82" y2="34" stroke="#ffffff" strokeWidth="2" />
      <line x1="50" y1="50" x2="18" y2="34" stroke="#ffffff" strokeWidth="2" />
      <circle cx="50" cy="50" r="4.5" fill="#facc15" />
    </svg>
  </IconWrapper>
);

// ─── 14. Retro 2048 ──────────────────────────────────────────────────────────
export const IosRetro2048Icon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#eab308] via-[#ca8a04] to-[#a16207]"
    pastelBg="bg-gradient-to-b from-[#fef9c3] to-[#fef08a]"
    neonColor="#eab308"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="18" y="18" width="64" height="64" rx="8" strokeWidth="2" />
        <line x1="50" y1="18" x2="50" y2="82" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="18" y1="50" x2="82" y2="50" strokeWidth="1.5" strokeOpacity="0.4" />
        <text x="34" y="42" fill="currentColor" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">2</text>
        <text x="66" y="42" fill="currentColor" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">0</text>
        <text x="34" y="74" fill="currentColor" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">4</text>
        <text x="66" y="74" fill="#ffffff" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">8</text>
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="18" y="18" width="64" height="64" rx="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
      <line x1="50" y1="18" x2="50" y2="82" stroke="#ca8a04" strokeWidth="1.5" opacity="0.4" />
      <line x1="18" y1="50" x2="82" y2="50" stroke="#ca8a04" strokeWidth="1.5" opacity="0.4" />
      <text x="34" y="42" fill="#854d0e" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">2</text>
      <text x="66" y="42" fill="#854d0e" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">0</text>
      <text x="34" y="74" fill="#854d0e" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">4</text>
      <text x="66" y="74" fill="#dc2626" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">8</text>
    </svg>
  </IconWrapper>
);

// ─── 15. Retro Sweeper ───────────────────────────────────────────────────────
export const IosRetroSweeperIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#a855f7] via-[#9333ea] to-[#7e22ce]"
    pastelBg="bg-gradient-to-b from-[#f3e8ff] to-[#e9d5ff]"
    neonColor="#a855f7"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="38" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="50" cy="50" r="22" strokeWidth="2" />
        <circle cx="50" cy="50" r="10" fill="currentColor" stroke="none" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="16"
            x2="50"
            y2="24"
            strokeWidth="2.5"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="2.5" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="50" cy="50" r="24" fill="#18181b" stroke="#ffffff" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line key={deg} x1="50" y1="14" x2="50" y2="24" stroke="#ffffff" strokeWidth="2.5" transform={`rotate(${deg} 50 50)`} />
      ))}
      <circle cx="44" cy="44" r="3" fill="#ffffff" />
      <polygon points="58,38 72,44 58,50" fill="#ef4444" />
      <line x1="58" y1="38" x2="58" y2="60" stroke="#ffffff" strokeWidth="2" />
    </svg>
  </IconWrapper>
);

// ─── 16. Pocket Synth ────────────────────────────────────────────────────────
export const IosSynthIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#06b6d4] via-[#0891b2] to-[#0e7490]"
    pastelBg="bg-gradient-to-b from-[#cffafe] to-[#a5f3fc]"
    neonColor="#06b6d4"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="16" y="24" width="68" height="52" rx="6" strokeWidth="2" />
        <line x1="16" y1="46" x2="84" y2="46" strokeWidth="1.5" />
        <circle cx="32" cy="35" r="4.5" fill="currentColor" stroke="none" />
        <circle cx="50" cy="35" r="4.5" fill="currentColor" stroke="none" />
        <circle cx="68" cy="35" r="4.5" fill="#ffffff" stroke="none" />
        {[26, 36, 46, 56, 64, 74].map((x) => (
          <line key={x} x1={x} y1="46" x2={x} y2="76" strokeWidth="1.5" />
        ))}
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="16" y="24" width="68" height="52" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
      <line x1="16" y1="46" x2="84" y2="46" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx="32" cy="35" r="4.5" fill="#f43f5e" />
      <circle cx="50" cy="35" r="4.5" fill="#facc15" />
      <circle cx="68" cy="35" r="4.5" fill="#22c55e" />
      {[26, 36, 46, 56, 64, 74].map((x) => (
        <line key={x} x1={x} y1="46" x2={x} y2="76" stroke="#ffffff" strokeWidth="2" />
      ))}
    </svg>
  </IconWrapper>
);

// ─── 17. OnyxCam ─────────────────────────────────────────────────────────────
export const IosCameraIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#64748b] via-[#475569] to-[#334155]"
    pastelBg="bg-gradient-to-b from-[#e2e8f0] to-[#cbd5e1]"
    neonColor="#cbd5e1"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="16" y="26" width="68" height="52" rx="8" strokeWidth="2" />
        <path d="M38 26 L44 18 L56 18 L62 26 Z" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
        <circle cx="50" cy="52" r="18" strokeWidth="2.5" />
        <circle cx="50" cy="52" r="10" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />
        <circle cx="72" cy="36" r="2.5" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="16" y="28" width="68" height="50" rx="8" fill="#1e293b" />
      <path d="M38 28 L44 20 L56 20 L62 28 Z" fill="#334155" />
      <circle cx="50" cy="53" r="18" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />
      <circle cx="50" cy="53" r="10" fill="#3b82f6" />
      <circle cx="53" cy="50" r="3" fill="#ffffff" />
      <circle cx="72" cy="38" r="3" fill="#ef4444" />
    </svg>
  </IconWrapper>
);

// ─── 18. Onyx Tape ───────────────────────────────────────────────────────────
export const IosFlowtapeIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#d97706] via-[#b45309] to-[#92400e]"
    pastelBg="bg-gradient-to-b from-[#fef3c7] to-[#fde68a]"
    neonColor="#f59e0b"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="16" y="24" width="68" height="52" rx="6" strokeWidth="2" />
        <rect x="30" y="34" width="40" height="20" rx="3" strokeWidth="1.5" />
        <circle cx="40" cy="44" r="5" strokeWidth="2" />
        <circle cx="60" cy="44" r="5" strokeWidth="2" />
        <line x1="40" y1="44" x2="60" y2="44" strokeWidth="1" strokeDasharray="1 2" />
        <circle cx="74" cy="32" r="2.5" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="16" y="24" width="68" height="52" rx="6" fill="#1c1917" stroke="#f59e0b" strokeWidth="2" />
      <rect x="28" y="34" width="44" height="22" rx="4" fill="#292524" />
      <circle cx="39" cy="45" r="7" fill="#44403c" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="61" cy="45" r="7" fill="#44403c" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="39" y1="45" x2="61" y2="45" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2 3" />
    </svg>
  </IconWrapper>
);

// ─── 19. OnyxBoard ───────────────────────────────────────────────────────────
export const IosFlowboardIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#075985]"
    pastelBg="bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd]"
    neonColor="#0284c7"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="20" y="20" width="24" height="24" rx="4" strokeWidth="2" />
        <rect x="56" y="56" width="24" height="24" rx="4" strokeWidth="2" />
        <path d="M44 32 C56 32, 56 68, 56 68" strokeWidth="2" strokeDasharray="3 2" />
        <circle cx="32" cy="32" r="3" fill="#ffffff" stroke="none" />
        <circle cx="68" cy="68" r="3" fill="currentColor" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="20" y="20" width="24" height="24" rx="4" fill="#38bdf8" />
      <rect x="56" y="56" width="24" height="24" rx="4" fill="#818cf8" />
      <path d="M44 32 C60 32, 40 68, 56 68" stroke="#ffffff" strokeWidth="3" strokeDasharray="3 2" />
    </svg>
  </IconWrapper>
);

// ─── 20. Cyber Pong ──────────────────────────────────────────────────────────
export const IosCyberPongIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#06b6d4] via-[#0891b2] to-[#0e7490]"
    pastelBg="bg-gradient-to-b from-[#cffafe] to-[#a5f3fc]"
    neonColor="#06b6d4"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="16" y="16" width="68" height="68" rx="8" strokeWidth="2" />
        <line x1="50" y1="16" x2="50" y2="84" strokeWidth="1.5" strokeDasharray="3 3" />
        <rect x="24" y="36" width="4" height="28" rx="2" fill="currentColor" stroke="none" />
        <rect x="72" y="44" width="4" height="28" rx="2" fill="currentColor" stroke="none" />
        <circle cx="42" cy="50" r="3" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="16" y="16" width="68" height="68" rx="8" fill="#090d16" stroke="#06b6d4" strokeWidth="2" />
      <line x1="50" y1="16" x2="50" y2="84" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
      <rect x="24" y="34" width="5" height="28" rx="2.5" fill="#38bdf8" />
      <rect x="71" y="42" width="5" height="28" rx="2.5" fill="#f43f5e" />
      <circle cx="44" cy="48" r="4" fill="#ffffff" />
    </svg>
  </IconWrapper>
);

// ─── 21. Snake Arena ─────────────────────────────────────────────────────────
export const IosSnakeArenaIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#10b981] via-[#059669] to-[#047857]"
    pastelBg="bg-gradient-to-b from-[#d1fae5] to-[#a7f3d0]"
    neonColor="#10b981"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="16" y="16" width="68" height="68" rx="8" strokeWidth="2" />
        <path d="M26 64 L26 34 L54 34 L54 52 L74 52" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="74" cy="52" r="3" fill="#ffffff" stroke="none" />
        <rect x="38" y="52" width="6" height="6" rx="1.5" fill="currentColor" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="16" y="16" width="68" height="68" rx="8" fill="#061c14" stroke="#10b981" strokeWidth="2" />
      <path d="M26 66 L26 34 L54 34 L54 52 L74 52" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="74" cy="52" r="4" fill="#ffffff" />
      <rect x="38" y="52" width="7" height="7" rx="2" fill="#ef4444" />
    </svg>
  </IconWrapper>
);

// ─── 22. Connect Four ────────────────────────────────────────────────────────
export const IosConnectFourIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#3b82f6] via-[#2563eb] to-[#1d4ed8]"
    pastelBg="bg-gradient-to-b from-[#dbeafe] to-[#bfdbfe]"
    neonColor="#3b82f6"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="18" y="18" width="64" height="64" rx="6" strokeWidth="2" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <circle key={`${r}-${c}`} cx={32 + c * 18} cy={32 + r * 18} r={5} strokeWidth="1.5" />
          ))
        )}
        <circle cx="50" cy="50" r="5" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <rect x="18" y="18" width="64" height="64" rx="8" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
      <circle cx="32" cy="32" r="5" fill="#ef4444" />
      <circle cx="50" cy="32" r="5" fill="#facc15" />
      <circle cx="68" cy="32" r="5" fill="#ef4444" />
      <circle cx="32" cy="50" r="5" fill="#facc15" />
      <circle cx="50" cy="50" r="5" fill="#ef4444" />
      <circle cx="68" cy="50" r="5" fill="#facc15" />
      <circle cx="32" cy="68" r="5" fill="#ef4444" />
      <circle cx="50" cy="68" r="5" fill="#facc15" />
      <circle cx="68" cy="68" r="5" fill="#ef4444" />
    </svg>
  </IconWrapper>
);

// ─── 23. Personal OS ─────────────────────────────────────────────────────────
export const IosPersonalOsIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#6366f1] via-[#4f46e5] to-[#4338ca]"
    pastelBg="bg-gradient-to-b from-[#e0e7ff] to-[#c7d2fe]"
    neonColor="#6366f1"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="36" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="22" strokeWidth="1.5" strokeDasharray="3 3" />
        <polygon points="50,22 56,44 78,50 56,56 50,78 44,56 22,50 44,44" fill="currentColor" fillOpacity="0.25" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="4" fill="#ffffff" stroke="none" />
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      <circle cx="50" cy="50" r="38" stroke="#a5b4fc" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="24" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="3 3" />
      <polygon points="50,20 57,43 80,50 57,57 50,80 43,57 20,50 43,43" fill="#ffffff" />
      <circle cx="50" cy="50" r="4.5" fill="#f43f5e" />
    </svg>
  </IconWrapper>
);

// ─── 24. Launchpad ───────────────────────────────────────────────────────────
export const IosLaunchpadIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IconWrapper
    vibrantBg="bg-gradient-to-b from-[#475569] via-[#334155] to-[#1e293b]"
    pastelBg="bg-gradient-to-b from-[#f1f5f9] to-[#e2e8f0]"
    neonColor="#38bdf8"
    className={className}
    size={size}
    mono={
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <circle key={`${row}-${col}`} cx={30 + col * 20} cy={30 + row * 20} r="3.5" fill="#ffffff" />
          ))
        )}
      </svg>
    }
  >
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const colors = ['#f43f5e', '#38bdf8', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316', '#06b6d4', '#6366f1'];
          const color = colors[(row * 3 + col) % colors.length];
          return (
            <circle key={`${row}-${col}`} cx={30 + col * 20} cy={30 + row * 20} r="4.5" fill={color} />
          );
        })
      )}
    </svg>
  </IconWrapper>
);

export const IOS_APP_ICONS: Record<string, React.FC<IosIconProps>> = {
  browser: IosSafariIcon,
  'file-explorer': IosFilesIcon,
  'system-settings': IosSettingsIcon,
  music: IosMusicIcon,
  terminal: IosTerminalIcon,
  notes: IosNotesIcon,
  calculator: IosCalculatorIcon,
  'task-manager': IosActivityIcon,
  'code-editor': IosCodeIcon,
  paint: IosPaintIcon,
  gallery: IosPhotosIcon,
  flowshot: IosFlowshotIcon,
  'app-store': IosAppStoreIcon,
  'retro-2048': IosRetro2048Icon,
  'retro-sweeper': IosRetroSweeperIcon,
  synth: IosSynthIcon,
  flowcam: IosCameraIcon,
  flowtape: IosFlowtapeIcon,
  flowboard: IosFlowboardIcon,
  'cyber-pong': IosCyberPongIcon,
  'snake-arena': IosSnakeArenaIcon,
  'connect-four': IosConnectFourIcon,
  'personal-os': IosPersonalOsIcon,
  launchpad: IosLaunchpadIcon,
};

export const IosAppIcon: React.FC<IosIconProps> = ({ appId, className = 'w-full h-full', size }) => {
  if (!appId) return null;
  const Component = IOS_APP_ICONS[appId];
  if (!Component) return null;
  return <Component className={className} size={size} />;
};
