import React from 'react';
import { useThemeStore } from '@core/theme/themeStore';

export interface IosIconProps {
  className?: string;
  size?: number | string;
  appId?: string;
}

const SHAPE_CLASSES: Record<string, string> = {
  squircle: 'rounded-[22.5%]',
  circle: 'rounded-full',
  rounded: 'rounded-xl',
  smooth: 'rounded-3xl',
};

/**
 * Universal Nothing OS Monochrome App Icon Tile Wrapper
 * Features Nothing's iconic dark obsidian matte background, hairline specular rim,
 * subtle inner border, and stark monochrome iconography with signature red micro-accents.
 */
const IosSquircle: React.FC<{
  children: React.ReactNode;
  className?: string;
  size?: number | string;
}> = ({ children, className = '', size }) => {
  const iconShape = useThemeStore((s) => s.iconShape);
  const shapeClass = SHAPE_CLASSES[iconShape] || 'rounded-[22.5%]';
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      style={style}
      className={`relative select-none overflow-hidden ${shapeClass} bg-[#0c0d12] border border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_1px_3px_rgba(0,0,0,0.4)] transition-all duration-200 ${className}`}
    >
      {/* Matte black Nothing OS obsidian gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1c24] via-[#111218] to-[#090a0e]" />

      {/* Subtle Specular Top Highlight */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.12] via-transparent to-transparent" />

      {/* Inner Rim */}
      <div className={`pointer-events-none absolute inset-0 ${shapeClass} ring-1 ring-inset ring-white/[0.08]`} />

      {/* Monochromatic Black & White Icon Content */}
      <div className="relative flex h-full w-full items-center justify-center p-[20%] text-white">
        {children}
      </div>
    </div>
  );
};

// ─── 1. Safari / Web Browser ──────────────────────────────────────────────────
export const IosSafariIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <circle cx="50" cy="50" r="38" strokeWidth="2.5" />
      <ellipse cx="50" cy="50" rx="18" ry="38" strokeWidth="2" strokeDasharray="3 2" />
      <line x1="12" y1="50" x2="88" y2="50" strokeWidth="2" />
      <line x1="50" y1="12" x2="50" y2="88" strokeWidth="2" />
      <circle cx="50" cy="50" r="3.5" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 2. Finder / Files ────────────────────────────────────────────────────────
export const IosFilesIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <path
        d="M16 28 C16 24, 19 22, 23 22 L40 22 C43 22, 46 25, 48 28 L53 34 C55 37, 58 39, 62 39 L77 39 C81 39, 84 42, 84 46 L84 74 C84 78, 81 81, 77 81 L23 81 C19 81, 16 78, 16 74 Z"
        strokeWidth="2.5"
      />
      <line x1="28" y1="52" x2="56" y2="52" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="62" x2="72" y2="62" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
      <circle cx="70" cy="30" r="3" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 3. Settings ─────────────────────────────────────────────────────────────
export const IosSettingsIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
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
      <circle cx="50" cy="50" r="5" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 4. Music ────────────────────────────────────────────────────────────────
export const IosMusicIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <path
        d="M68 22 L42 27 L42 64 C40 62, 36 61, 32 61 C24 61, 18 66, 18 72 C18 78, 24 83, 32 83 C40 83, 46 78, 46 72 L46 38 L68 33 L68 58 C66 56, 62 55, 58 55 C50 55, 44 60, 44 66 C44 72, 50 77, 58 77 C66 77, 72 72, 72 66 L72 22 Z"
        strokeWidth="2.5"
        fill="currentColor"
      />
      <circle cx="70" cy="22" r="3.5" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 5. Terminal ─────────────────────────────────────────────────────────────
export const IosTerminalIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
      <rect x="14" y="16" width="72" height="68" rx="8" stroke="currentColor" strokeWidth="2" />
      <line x1="14" y1="30" x2="86" y2="30" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="24" cy="23" r="2.5" fill="#d71921" />
      <circle cx="32" cy="23" r="2.5" fill="currentColor" fillOpacity="0.4" />
      <circle cx="40" cy="23" r="2.5" fill="currentColor" fillOpacity="0.4" />
      <path d="M26 44 L40 54 L26 64" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="46" y1="64" x2="66" y2="64" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  </IosSquircle>
);

// ─── 6. Notes ────────────────────────────────────────────────────────────────
export const IosNotesIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <rect x="20" y="18" width="60" height="64" rx="6" strokeWidth="2.5" />
      <line x1="32" y1="34" x2="54" y2="34" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="46" x2="68" y2="46" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
      <line x1="32" y1="56" x2="68" y2="56" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="66" x2="58" y2="66" strokeWidth="2" strokeLinecap="round" />
      <circle cx="68" cy="34" r="3" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 7. Calculator ───────────────────────────────────────────────────────────
export const IosCalculatorIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <rect x="18" y="16" width="64" height="68" rx="8" strokeWidth="2" />
      <rect x="26" y="24" width="48" height="16" rx="3" fill="currentColor" fillOpacity="0.12" strokeWidth="1.5" />
      <circle cx="66" cy="32" r="2.5" fill="#d71921" stroke="none" />
      <circle cx="34" cy="52" r="4" fill="currentColor" stroke="none" />
      <circle cx="50" cy="52" r="4" fill="currentColor" stroke="none" />
      <circle cx="66" cy="52" r="4" fill="currentColor" stroke="none" />
      <circle cx="34" cy="68" r="4" fill="currentColor" stroke="none" />
      <circle cx="50" cy="68" r="4" fill="currentColor" stroke="none" />
      <circle cx="66" cy="68" r="4" fill="currentColor" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 8. Activity Monitor ─────────────────────────────────────────────────────
export const IosActivityIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <circle cx="50" cy="50" r="38" strokeWidth="2" strokeDasharray="3 3" />
      <path
        d="M16 50 L34 50 L42 26 L52 74 L60 42 L68 54 L74 50 L84 50"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="74" cy="50" r="3.5" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 9. Code Editor ──────────────────────────────────────────────────────────
export const IosCodeIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <path d="M36 32 L18 50 L36 68" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M64 32 L82 50 L64 68" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="56" y1="26" x2="44" y2="74" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 10. FlowPaint ───────────────────────────────────────────────────────────
export const IosPaintIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <path
        d="M50 18 C30 18, 16 32, 16 52 C16 70, 30 82, 48 82 C54 82, 58 78, 58 72 C58 68, 56 66, 56 62 C56 56, 62 52, 68 52 L72 52 C78 52, 84 46, 84 38 C84 26, 68 18, 50 18 Z"
        strokeWidth="2.5"
      />
      <circle cx="32" cy="40" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="48" cy="32" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="64" cy="40" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="36" cy="60" r="3.5" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 11. Photos / Gallery ────────────────────────────────────────────────────
export const IosPhotosIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
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
      <circle cx="50" cy="50" r="4" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 12. FlowShot ────────────────────────────────────────────────────────────
export const IosFlowshotIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <path d="M18 34 L18 20 L34 20" strokeWidth="3" strokeLinecap="round" />
      <path d="M66 20 L82 20 L82 34" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 66 L18 80 L34 80" strokeWidth="3" strokeLinecap="round" />
      <path d="M66 80 L82 80 L82 66" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="50" r="16" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="50" cy="50" r="3.5" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 13. App Store ───────────────────────────────────────────────────────────
export const IosAppStoreIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <path d="M50 18 L82 34 L82 66 L50 82 L18 66 L18 34 Z" strokeWidth="2.5" />
      <line x1="50" y1="18" x2="50" y2="82" strokeWidth="2" />
      <line x1="50" y1="50" x2="82" y2="34" strokeWidth="2" />
      <line x1="50" y1="50" x2="18" y2="34" strokeWidth="2" />
      <circle cx="50" cy="50" r="3.5" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 14. Retro 2048 ──────────────────────────────────────────────────────────
export const IosRetro2048Icon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <rect x="18" y="18" width="64" height="64" rx="8" strokeWidth="2" />
      <line x1="50" y1="18" x2="50" y2="82" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="18" y1="50" x2="82" y2="50" strokeWidth="1.5" strokeOpacity="0.4" />
      <text x="34" y="42" fill="currentColor" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">2</text>
      <text x="66" y="42" fill="currentColor" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">0</text>
      <text x="34" y="74" fill="currentColor" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">4</text>
      <text x="66" y="74" fill="#d71921" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">8</text>
    </svg>
  </IosSquircle>
);

// ─── 15. Retro Sweeper ───────────────────────────────────────────────────────
export const IosRetroSweeperIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
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
      <circle cx="50" cy="50" r="3" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 16. Pocket Synth ────────────────────────────────────────────────────────
export const IosSynthIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <rect x="16" y="24" width="68" height="52" rx="6" strokeWidth="2" />
      <line x1="16" y1="46" x2="84" y2="46" strokeWidth="1.5" />
      <circle cx="32" cy="35" r="4.5" fill="currentColor" stroke="none" />
      <circle cx="50" cy="35" r="4.5" fill="currentColor" stroke="none" />
      <circle cx="68" cy="35" r="4.5" fill="#d71921" stroke="none" />
      {[26, 36, 46, 56, 64, 74].map((x) => (
        <line key={x} x1={x} y1="46" x2={x} y2="76" strokeWidth="1.5" />
      ))}
    </svg>
  </IosSquircle>
);

// ─── 17. FlowCam ─────────────────────────────────────────────────────────────
export const IosCameraIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <rect x="16" y="26" width="68" height="52" rx="8" strokeWidth="2" />
      <path d="M38 26 L44 18 L56 18 L62 26 Z" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
      <circle cx="50" cy="52" r="18" strokeWidth="2.5" />
      <circle cx="50" cy="52" r="10" fill="currentColor" fillOpacity="0.3" strokeWidth="1.5" />
      <circle cx="72" cy="36" r="3" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 18. Flow Tape ───────────────────────────────────────────────────────────
export const IosFlowtapeIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <rect x="16" y="24" width="68" height="52" rx="6" strokeWidth="2" />
      <rect x="30" y="34" width="40" height="20" rx="3" strokeWidth="1.5" />
      <circle cx="40" cy="44" r="5" strokeWidth="2" />
      <circle cx="60" cy="44" r="5" strokeWidth="2" />
      <line x1="40" y1="44" x2="60" y2="44" strokeWidth="1" strokeDasharray="1 2" />
      <circle cx="74" cy="32" r="2.5" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 19. FlowBoard ───────────────────────────────────────────────────────────
export const IosFlowboardIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <rect x="20" y="20" width="24" height="24" rx="4" strokeWidth="2" />
      <rect x="56" y="56" width="24" height="24" rx="4" strokeWidth="2" />
      <path d="M44 32 C56 32, 56 68, 56 68" strokeWidth="2" strokeDasharray="3 2" />
      <circle cx="32" cy="32" r="3" fill="#d71921" stroke="none" />
      <circle cx="68" cy="68" r="3" fill="currentColor" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 20. CyberPong ───────────────────────────────────────────────────────────
export const IosCyberPongIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <rect x="18" y="18" width="64" height="64" rx="6" strokeWidth="2" />
      <line x1="50" y1="18" x2="50" y2="82" strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x="24" y="38" width="5" height="24" rx="2" fill="currentColor" />
      <rect x="71" y="44" width="5" height="24" rx="2" fill="currentColor" />
      <circle cx="42" cy="48" r="3.5" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 21. Snake Arena ─────────────────────────────────────────────────────────
export const IosSnakeArenaIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <rect x="18" y="18" width="64" height="64" rx="6" strokeWidth="2" />
      <path
        d="M28 70 L28 42 L52 42 L52 28 L72 28"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="72" cy="56" r="4" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── 22. Connect Four ────────────────────────────────────────────────────────
export const IosConnectFourIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <rect x="18" y="20" width="64" height="60" rx="6" strokeWidth="2" />
      {[30, 43, 57, 70].map((x) =>
        [32, 45, 58, 70].map((y) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r="4"
            fill={x === 57 && y === 45 ? '#d71921' : 'currentColor'}
            fillOpacity={x === 57 && y === 45 ? 1 : (x + y) % 2 === 0 ? 0.9 : 0.25}
            stroke="none"
          />
        ))
      )}
    </svg>
  </IosSquircle>
);

// ─── 23. Personal OS ─────────────────────────────────────────────────────────
export const IosPersonalOsIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
      <circle cx="50" cy="50" r="38" strokeWidth="2" />
      <circle cx="50" cy="50" r="28" strokeWidth="1.5" strokeDasharray="2 3" />
      <circle cx="50" cy="50" r="18" strokeWidth="2" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <circle
          key={deg}
          cx={50 + 28 * Math.cos((deg * Math.PI) / 180)}
          cy={50 + 28 * Math.sin((deg * Math.PI) / 180)}
          r="2"
          fill="currentColor"
          stroke="none"
        />
      ))}
      <circle cx="50" cy="50" r="5" fill="#d71921" stroke="none" />
    </svg>
  </IosSquircle>
);

// ─── App Icon Registry Mapping ────────────────────────────────────────────────
export const IOS_APP_ICONS: Record<string, React.FC<IosIconProps>> = {
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
 * Renders the Nothing OS monochrome icon for a given appId, or fallback generic Nothing icon.
 */
export const IosAppIcon: React.FC<IosIconProps> = ({ appId, className = 'w-full h-full', size }) => {
  if (appId && IOS_APP_ICONS[appId]) {
    const Component = IOS_APP_ICONS[appId]!;
    return <Component className={className} size={size} />;
  }

  // Fallback for custom or unknown apps: Nothing OS monochromatic geometric tile
  return (
    <IosSquircle className={className} size={size}>
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor">
        <rect x="22" y="22" width="56" height="56" rx="12" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="8" fill="currentColor" stroke="none" />
        <circle cx="68" cy="32" r="3" fill="#d71921" stroke="none" />
      </svg>
    </IosSquircle>
  );
};
