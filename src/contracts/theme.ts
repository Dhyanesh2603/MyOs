/**
 * Onyx OS Theme & Personalization Contracts
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
  type: 'gradient' | 'abstract' | 'minimal' | 'live';
  dynamicType?: 'starfield' | 'matrix' | 'waves';
  style: React.CSSProperties;
}

export type FontFamilyId = 'inter' | 'ndot' | 'jetbrains' | 'serif';

export type IconShape = 'squircle' | 'circle' | 'rounded' | 'smooth';
export type WindowMaterial = 'glass' | 'solid' | 'translucent';

export interface ThemePreferences {
  themeId: ThemeId;
  accentColor: AccentColorId;
  blurEnabled: boolean;
  reducedMotion: boolean;
  windowRadius: number;
  wallpaperId: string;
  fontFamily?: FontFamilyId;
  uiScale?: number;
  iconShape?: IconShape;
  windowMaterial?: WindowMaterial;
  windowOpacity?: number;
}
