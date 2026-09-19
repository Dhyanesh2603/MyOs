import React from 'react';
import type { WallpaperDefinition } from '@contracts/theme';
import { StarfieldCanvas } from './StarfieldCanvas';
import { MatrixCanvas } from './MatrixCanvas';
import { AudioWavesCanvas } from './AudioWavesCanvas';

interface DynamicWallpaperHostProps {
  wallpaper: WallpaperDefinition;
}

export const DynamicWallpaperHost: React.FC<DynamicWallpaperHostProps> = ({ wallpaper }) => {
  if (wallpaper.type !== 'live') return null;

  switch (wallpaper.dynamicType) {
    case 'starfield':
      return <StarfieldCanvas />;
    case 'matrix':
      return <MatrixCanvas />;
    case 'waves':
      return <AudioWavesCanvas />;
    default:
      return <StarfieldCanvas />;
  }
};
