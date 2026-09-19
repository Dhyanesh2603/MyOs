import { create } from 'zustand';
import { soundEngine } from '@core/audio/soundEngine';

export interface ScreenSaverState {
  isActive: boolean;
  activate: () => void;
  deactivate: () => void;
}

export const useScreenSaverStore = create<ScreenSaverState>((set) => ({
  isActive: false,

  activate: () => {
    soundEngine.playSnap();
    set({ isActive: true });
  },

  deactivate: () => {
    set({ isActive: false });
  },
}));
