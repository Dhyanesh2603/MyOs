import React from 'react';

export interface IosIconProps {
  className?: string;
  size?: number | string;
  appId?: string;
}

/**
 * Universal iOS Icon Wrapper
 * Applies authentic Apple squircle radius (22.5%), specular top gloss,
 * subtle inner border highlight, and soft realistic ambient drop shadow.
 */
const IosSquircle: React.FC<{
  children: React.ReactNode;
  bgGradient: string;
  className?: string;
  size?: number | string;
}> = ({ children, bgGradient, className = '', size }) => {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <div
      style={style}
      className={`relative select-none overflow-hidden rounded-[22.5%] shadow-[0_3px_10px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-150 ${className}`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${bgGradient}`} />

      {/* Subtle Specular Top Lighting */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-transparent" />

      {/* Inner Border Rim */}
      <div className="pointer-events-none absolute inset-0 rounded-[22.5%] ring-1 ring-inset ring-white/25" />

      {/* SVG Icon Content */}
      <div className="relative flex h-full w-full items-center justify-center p-[14%] text-white">
        {children}
      </div>
    </div>
  );
};

// ─── 1. Safari / Web Browser ──────────────────────────────────────────────────
export const IosSafariIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#1d4ed8]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-sm" fill="none">
      {/* Compass Dial Outer Ring */}
      <circle cx="50" cy="50" r="43" stroke="white" strokeWidth="2.5" opacity="0.85" />
      {/* Compass Dial Inner Ring */}
      <circle cx="50" cy="50" r="39" stroke="white" strokeWidth="1" opacity="0.4" strokeDasharray="1.5 3.5" />
      {/* Compass Degree Ticks (360 degrees) */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="50"
          y1="9"
          x2="50"
          y2={deg % 90 === 0 ? "14" : "12"}
          stroke="white"
          strokeWidth={deg % 90 === 0 ? "2" : "1"}
          opacity={deg % 90 === 0 ? "0.9" : "0.5"}
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      {/* 45-Degree Compass Needle */}
      <g transform="rotate(45 50 50)">
        {/* Red North Half */}
        <polygon points="50,14 43.5,50 50,46" fill="#ef4444" />
        <polygon points="50,14 56.5,50 50,46" fill="#dc2626" />
        {/* White South Half */}
        <polygon points="50,86 43.5,50 50,54" fill="#e2e8f0" />
        <polygon points="50,86 56.5,50 50,54" fill="#ffffff" />
        {/* Center Pivot Rivet */}
        <circle cx="50" cy="50" r="4.5" fill="#0f172a" />
        <circle cx="50" cy="50" r="2.2" fill="#ffffff" />
      </g>
    </svg>
  </IosSquircle>
);

// ─── 2. Finder / Files ────────────────────────────────────────────────────────
export const IosFilesIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#60a5fa] via-[#3b82f6] to-[#1d4ed8]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* macOS Finder / iOS Files Folder Tab */}
      <path
        d="M16 32 C16 28, 19 25, 23 25 L40 25 C43 25, 46 28, 48 31 L52 36 C54 39, 57 41, 61 41 L77 41 C81 41, 84 44, 84 48 L84 73 C84 77, 81 80, 77 80 L23 80 C19 80, 16 77, 16 73 Z"
        fill="#93c5fd"
        opacity="0.9"
      />
      {/* White Document Peeking Out */}
      <rect x="25" y="32" width="50" height="34" rx="3" fill="#ffffff" opacity="0.95" />
      <line x1="32" y1="41" x2="52" y2="41" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="48" x2="68" y2="48" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="55" x2="60" y2="55" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      {/* Front Folder Lip */}
      <path
        d="M16 45 C16 41, 19 38, 23 38 L77 38 C81 38, 84 41, 84 45 L84 74 C84 78, 81 81, 77 81 L23 81 C19 81, 16 78, 16 74 Z"
        fill="url(#folderFrontGrad)"
      />
      <defs>
        <linearGradient id="folderFrontGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
    </svg>
  </IosSquircle>
);

// ─── 3. Settings ─────────────────────────────────────────────────────────────
export const IosSettingsIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#94a3b8] via-[#64748b] to-[#334155]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Metallic Outer Ring */}
      <circle cx="50" cy="50" r="35" fill="url(#metalGrad)" />
      {/* Multi-tooth Mechanical Cogwheel */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="44.5"
          y="10"
          width="11"
          height="14"
          rx="3"
          fill="#cbd5e1"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="28" fill="#e2e8f0" />
      <circle cx="50" cy="50" r="20" fill="url(#metalCenterGrad)" />
      <circle cx="50" cy="50" r="11" fill="#475569" />
      <circle cx="50" cy="50" r="6" fill="#1e293b" />
      <defs>
        <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="metalCenterGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
    </svg>
  </IosSquircle>
);

// ─── 4. Apple Music ──────────────────────────────────────────────────────────
export const IosMusicIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#fb7185] via-[#f43f5e] to-[#e11d48]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="currentColor">
      {/* Iconic Apple Music Beamed Notes */}
      <path d="M72 23 C72 20.8, 70.2 19, 68 19 L42 24 C40 24.4, 38.5 26.2, 38.5 28.2 L38.5 63.5 C36.5 61.5, 33 60.5, 29.5 60.5 C22.5 60.5, 17 65, 17 71 C17 77, 22.5 81.5, 29.5 81.5 C36.5 81.5, 42 77, 42 71 L42 41 L68.5 36 L68.5 56.5 C66.5 54.5, 63 53.5, 59.5 53.5 C52.5 53.5, 47 58, 47 64 C47 70, 52.5 74.5, 59.5 74.5 C66.5 74.5, 72 70, 72 64 L72 23 Z" />
    </svg>
  </IosSquircle>
);

// ─── 5. Terminal ─────────────────────────────────────────────────────────────
export const IosTerminalIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#18181b] via-[#09090b] to-[#000000]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow" fill="none">
      {/* Terminal Title Bar */}
      <rect x="14" y="16" width="72" height="68" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="14" y1="28" x2="86" y2="28" stroke="#27272a" strokeWidth="1.5" />
      {/* Window Pills */}
      <circle cx="23" cy="22" r="2.5" fill="#ef4444" />
      <circle cx="31" cy="22" r="2.5" fill="#f59e0b" />
      <circle cx="39" cy="22" r="2.5" fill="#10b981" />
      {/* Shell Prompt >_ */}
      <path
        d="M26 42 L42 54 L26 66"
        stroke="#4ade80"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Flashing Underscore Cursor */}
      <rect x="48" y="61" width="22" height="6" rx="2" fill="#4ade80" />
    </svg>
  </IosSquircle>
);

// ─── 6. Notes ────────────────────────────────────────────────────────────────
export const IosNotesIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#fbbf24] via-[#f59e0b] to-[#d97706]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Notepad Paper Base */}
      <rect x="18" y="16" width="64" height="68" rx="7" fill="#ffffff" />
      {/* Yellow Perforated Header Strip */}
      <path d="M18 16 H82 V34 H18 Z" fill="#fbbf24" />
      <line x1="18" y1="34" x2="82" y2="34" stroke="#f59e0b" strokeWidth="1.5" />
      {/* Ruled Notebook Lines */}
      <line x1="26" y1="44" x2="74" y2="44" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="54" x2="74" y2="54" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="64" x2="74" y2="64" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="74" x2="58" y2="74" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      {/* Pencil Glyph */}
      <g transform="translate(48, 42) rotate(35)">
        <polygon points="12,0 16,4 4,24 0,24 0,20" fill="#f59e0b" />
        <polygon points="0,24 4,24 0,20" fill="#0f172a" />
      </g>
    </svg>
  </IosSquircle>
);

// ─── 7. Code Editor / Xcode ──────────────────────────────────────────────────
export const IosCodeIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#1e3a8a]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Xcode Blueprint Grid */}
      <circle cx="50" cy="50" r="36" stroke="#38bdf8" strokeWidth="1" opacity="0.4" strokeDasharray="2 3" />
      <circle cx="50" cy="50" r="24" stroke="#38bdf8" strokeWidth="1" opacity="0.3" strokeDasharray="2 3" />
      <line x1="14" y1="50" x2="86" y2="50" stroke="#38bdf8" strokeWidth="1" opacity="0.35" />
      <line x1="50" y1="14" x2="50" y2="86" stroke="#38bdf8" strokeWidth="1" opacity="0.35" />
      {/* Stylized Code Brackets & Slash < / > */}
      <path
        d="M34 38 L22 50 L34 62"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M66 38 L78 50 L66 62"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="55"
        y1="34"
        x2="45"
        y2="66"
        stroke="#38bdf8"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </svg>
  </IosSquircle>
);

// ─── 8. Calculator ───────────────────────────────────────────────────────────
export const IosCalculatorIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#292524] via-[#1c1917] to-[#0c0a09]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Keypad Buttons Grid */}
      <circle cx="32" cy="32" r="14" fill="#57534e" />
      <text x="32" y="37" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">C</text>

      <circle cx="68" cy="32" r="14" fill="#f97316" />
      <text x="68" y="37" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">÷</text>

      <circle cx="32" cy="68" r="14" fill="#57534e" />
      <text x="32" y="74" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">+</text>

      <circle cx="68" cy="68" r="14" fill="#f97316" />
      <text x="68" y="74" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">=</text>
    </svg>
  </IosSquircle>
);

// ─── 9. Photos / Gallery ─────────────────────────────────────────────────────
export const IosPhotosIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#e2e8f0]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-sm" fill="none">
      {/* Apple Photos 8-Petal Rainbow Flower */}
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
  </IosSquircle>
);

// ─── 10. Camera / FlowCam ────────────────────────────────────────────────────
export const IosCameraIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#94a3b8] via-[#64748b] to-[#475569]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Camera Body Base */}
      <rect x="14" y="26" width="72" height="54" rx="10" fill="#1e293b" />
      <path d="M36 26 L42 18 L58 18 L64 26 Z" fill="#1e293b" />
      {/* Viewfinder Flash */}
      <circle cx="72" cy="38" r="4.5" fill="#fbbf24" />
      {/* Big Camera Lens */}
      <circle cx="50" cy="53" r="23" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />
      <circle cx="50" cy="53" r="17" fill="#1e1b4b" stroke="#3b82f6" strokeWidth="1.5" />
      <circle cx="50" cy="53" r="10" fill="#0284c7" />
      {/* Optical Specular Glare */}
      <circle cx="46" cy="49" r="4" fill="#ffffff" opacity="0.75" />
    </svg>
  </IosSquircle>
);

// ─── 11. Activity / Task Manager ─────────────────────────────────────────────
export const IosActivityIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#18181b] via-[#09090b] to-[#000000]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow" fill="none">
      {/* Concentric Activity Rings (Red / Green / Blue) */}
      <circle cx="50" cy="50" r="34" stroke="#f43f5e" strokeWidth="5.5" strokeLinecap="round" opacity="0.3" />
      <path d="M50 16 A 34 34 0 1 1 24 74" stroke="#f43f5e" strokeWidth="5.5" strokeLinecap="round" />

      <circle cx="50" cy="50" r="24" stroke="#22c55e" strokeWidth="5.5" strokeLinecap="round" opacity="0.3" />
      <path d="M50 26 A 24 24 0 1 1 32 67" stroke="#22c55e" strokeWidth="5.5" strokeLinecap="round" />

      <circle cx="50" cy="50" r="14" stroke="#06b6d4" strokeWidth="5.5" strokeLinecap="round" opacity="0.3" />
      <path d="M50 36 A 14 14 0 1 1 40 60" stroke="#06b6d4" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  </IosSquircle>
);

// ─── 12. App Store ───────────────────────────────────────────────────────────
export const IosAppStoreIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#1d4ed8]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Iconic Geometric White 'A' Triangle Monogram */}
      <g stroke="#ffffff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <line x1="50" y1="20" x2="22" y2="76" />
        <line x1="50" y1="20" x2="78" y2="76" />
        <line x1="28" y1="60" x2="72" y2="60" />
      </g>
    </svg>
  </IosSquircle>
);

// ─── 13. Personal OS / FlowOS Core ───────────────────────────────────────────
export const IosPersonalOsIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#4f46e5] via-[#4338ca] to-[#1e1b4b]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Concentric Orbital Rings */}
      <circle cx="50" cy="50" r="34" stroke="#818cf8" strokeWidth="2" strokeDasharray="3 4" opacity="0.6" />
      <circle cx="50" cy="50" r="23" stroke="#a5b4fc" strokeWidth="2" opacity="0.8" />
      {/* Core Star Emblem */}
      <circle cx="50" cy="50" r="10" fill="#ffffff" />
      {/* Orbiting Satellites */}
      <circle cx="50" cy="16" r="4.5" fill="#38bdf8" />
      <circle cx="73" cy="50" r="4.5" fill="#ec4899" />
      <circle cx="50" cy="84" r="4.5" fill="#f59e0b" />
      <circle cx="27" cy="50" r="4.5" fill="#10b981" />
    </svg>
  </IosSquircle>
);

// ─── 14. Paint / Canvas ──────────────────────────────────────────────────────
export const IosPaintIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Wooden Palette Base */}
      <path
        d="M50 16 C30 16 16 30 16 50 C16 68 28 82 46 82 C52 82 56 78 56 74 C56 72 55 70 54 68 C53 66 52 64 52 62 C52 58 56 54 60 54 L68 54 C76 54 84 46 84 36 C84 25 69 16 50 16 Z"
        fill="#fed7aa"
        stroke="#ea580c"
        strokeWidth="2"
      />
      {/* Color Paint Dollops */}
      <circle cx="32" cy="34" r="5.5" fill="#ef4444" />
      <circle cx="48" cy="28" r="5.5" fill="#eab308" />
      <circle cx="64" cy="36" r="5.5" fill="#3b82f6" />
      <circle cx="32" cy="52" r="5.5" fill="#22c55e" />
      <circle cx="38" cy="68" r="5.5" fill="#a855f7" />
      {/* Thumb Hole */}
      <ellipse cx="68" cy="66" rx="5" ry="6" fill="#f8fafc" stroke="#ea580c" strokeWidth="1.5" />
    </svg>
  </IosSquircle>
);

// ─── 15. FlowShot / Screen Capture ───────────────────────────────────────────
export const IosFlowshotIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#8b5cf6] via-[#7c3aed] to-[#5b21b6]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Screen Frame */}
      <rect x="18" y="20" width="64" height="48" rx="6" stroke="#ffffff" strokeWidth="3" opacity="0.6" />
      {/* Corner Crop Brackets */}
      <path d="M26 36 V28 H34" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M74 36 V28 H66" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 52 V60 H34" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M74 52 V60 H66" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Center Target Point */}
      <circle cx="50" cy="44" r="6" fill="#38bdf8" />
      <circle cx="50" cy="44" r="2.5" fill="#ffffff" />
    </svg>
  </IosSquircle>
);

// ─── 16. Synth / Pocket Synth ────────────────────────────────────────────────
export const IosSynthIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#ea580c] via-[#c2410c] to-[#9a3412]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Analog Potentiometer Knob */}
      <circle cx="50" cy="40" r="20" fill="#292524" stroke="#fdba74" strokeWidth="2" />
      <line x1="50" y1="40" x2="62" y2="28" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
      {/* Piano Keys Strip */}
      <rect x="18" y="66" width="64" height="18" rx="3" fill="#ffffff" />
      <line x1="34" y1="66" x2="34" y2="84" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="50" y1="66" x2="50" y2="84" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="66" y1="66" x2="66" y2="84" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="28" y="66" width="7" height="10" fill="#0f172a" />
      <rect x="58" y="66" width="7" height="10" fill="#0f172a" />
    </svg>
  </IosSquircle>
);

// ─── 17. Voice Memos / Flow Tape ─────────────────────────────────────────────
export const IosFlowtapeIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#18181b] via-[#09090b] to-[#000000]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Voice Waveform Bars in Red / Orange */}
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
  </IosSquircle>
);

// ─── 18. FlowBoard / Freeform ────────────────────────────────────────────────
export const IosFlowboardIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#e2e8f0]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Overlapping Colorful Freeform Sticky Cards */}
      <rect x="18" y="24" width="34" height="34" rx="6" fill="#fde047" opacity="0.9" />
      <rect x="42" y="38" width="36" height="36" rx="6" fill="#38bdf8" opacity="0.9" />
      {/* Freehand Vector Marker Swirl */}
      <path
        d="M26 68 C36 44, 52 82, 74 30"
        stroke="#f43f5e"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  </IosSquircle>
);

// ─── 19. CyberPong Arena ─────────────────────────────────────────────────────
export const IosCyberPongIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#06b6d4] via-[#0284c7] to-[#4f46e5]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Left Paddle */}
      <rect x="18" y="32" width="6" height="36" rx="3" fill="#38bdf8" />
      {/* Right Paddle */}
      <rect x="76" y="44" width="6" height="36" rx="3" fill="#ec4899" />
      {/* Center Net */}
      <line x1="50" y1="16" x2="50" y2="84" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 4" opacity="0.4" />
      {/* Glowing Neon Ping Pong Ball */}
      <circle cx="42" cy="52" r="6" fill="#ffffff" />
      {/* Motion Trail */}
      <circle cx="32" cy="46" r="3" fill="#ffffff" opacity="0.4" />
    </svg>
  </IosSquircle>
);

// ─── 20. Snake Arena ─────────────────────────────────────────────────────────
export const IosSnakeArenaIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#10b981] via-[#059669] to-[#064e3b]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Snake Path */}
      <path
        d="M20 74 H44 V46 H68 V24 H78"
        stroke="#a7f3d0"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Snake Head Eye */}
      <circle cx="78" cy="24" r="3" fill="#064e3b" />
      {/* Food Pellet */}
      <circle cx="30" cy="30" r="5" fill="#f43f5e" />
    </svg>
  </IosSquircle>
);

// ─── 21. Connect 4 ───────────────────────────────────────────────────────────
export const IosConnectFourIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#3b82f6] via-[#1d4ed8] to-[#1e1b4b]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Tactical 4-in-a-row Discs */}
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
  </IosSquircle>
);

// ─── 22. Flow 2048 ───────────────────────────────────────────────────────────
export const IosRetro2048Icon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#b45309]" className={className} size={size}>
    <div className="flex h-full w-full flex-col items-center justify-center font-sans font-black tracking-tighter text-white drop-shadow-md">
      <span className="text-[28px] leading-none">20</span>
      <span className="text-[28px] leading-none">48</span>
    </div>
  </IosSquircle>
);

// ─── 23. FlowSweeper / Minesweeper ───────────────────────────────────────────
export const IosRetroSweeperIcon: React.FC<IosIconProps> = ({ className = 'w-full h-full', size }) => (
  <IosSquircle bgGradient="bg-gradient-to-b from-[#64748b] via-[#475569] to-[#334155]" className={className} size={size}>
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-md" fill="none">
      {/* Retro Bomb Core */}
      <circle cx="48" cy="56" r="22" fill="#0f172a" />
      {/* Spikes */}
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
      {/* Bomb Highlight */}
      <circle cx="42" cy="50" r="4" fill="#ffffff" opacity="0.6" />
      {/* Burning Fuse */}
      <path d="M56 38 C62 30, 68 34, 74 24" stroke="#fbbf24" strokeWidth="3" fill="none" />
      <circle cx="74" cy="24" r="3.5" fill="#ef4444" />
    </svg>
  </IosSquircle>
);

// ─── App ID to iOS Icon Mapper ───────────────────────────────────────────────
export const IOS_APP_ICONS: Record<string, React.FC<IosIconProps>> = {
  browser: IosSafariIcon,
  'file-explorer': IosFilesIcon,
  'system-settings': IosSettingsIcon,
  music: IosMusicIcon,
  terminal: IosTerminalIcon,
  notes: IosNotesIcon,
  'code-editor': IosCodeIcon,
  calculator: IosCalculatorIcon,
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
 * Renders the iOS squircle icon for a given appId, or fallback generic iOS icon.
 */
export const IosAppIcon: React.FC<IosIconProps> = ({ appId, className = 'w-full h-full', size }) => {
  if (appId && IOS_APP_ICONS[appId]) {
    const Component = IOS_APP_ICONS[appId]!;
    return <Component className={className} size={size} />;
  }

  // Fallback for custom or unknown apps: High-grade generic iOS Squircle
  return (
    <IosSquircle bgGradient="bg-gradient-to-b from-[#6366f1] via-[#4f46e5] to-[#312e81]" className={className} size={size}>
      <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="6">
        <rect x="22" y="22" width="56" height="56" rx="14" strokeWidth="5" />
        <circle cx="50" cy="50" r="10" fill="currentColor" />
      </svg>
    </IosSquircle>
  );
};
