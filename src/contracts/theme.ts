/**
 * FlowOS Theme & Personalization Contracts
 */

export type ThemeId = 'dark' | 'light' | 'high-contrast';

export type AccentColorId =
  | 'indigo'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'cyan'
  | 'monochrome';

export interface AccentColorDefinition {
  id: AccentColorId;
  label: string;
  primary: string; // RGB tuple e.g. "99 102 241"
  hover: string;
  muted: string;
}

export interface WallpaperDefinition {
  id: string;
  name: string;
  type: 'gradient' | 'abstract' | 'minimal';
  style: React.CSSProperties;
}

export interface ThemePreferences {
  themeId: ThemeId;
  accentColor: AccentColorId;
  blurEnabled: boolean;
  reducedMotion: boolean;
  windowRadius: number;
  wallpaperId: string;
}
