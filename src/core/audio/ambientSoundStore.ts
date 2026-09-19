import { create } from 'zustand';
import { ambientSoundEngine, AmbientTrack } from './ambientSoundEngine';

export interface AmbientSoundState {
  currentTrack: AmbientTrack;
  volume: number;
  isPlaying: boolean;

  // Actions
  playTrack: (track: AmbientTrack) => void;
  stopTrack: () => void;
  setVolume: (volume: number) => void;
  toggleTrack: (track: AmbientTrack) => void;
}

export const useAmbientSoundStore = create<AmbientSoundState>((set, get) => {
  // Synchronize with ambientSoundEngine events
  ambientSoundEngine.subscribeTrack((track) => {
    set({ currentTrack: track, isPlaying: track !== 'none' });
  });

  ambientSoundEngine.subscribeVolume((vol) => {
    set({ volume: vol });
  });

  return {
    currentTrack: ambientSoundEngine.getCurrentTrack(),
    volume: ambientSoundEngine.getVolume(),
    isPlaying: ambientSoundEngine.getCurrentTrack() !== 'none',

    playTrack: (track) => {
      ambientSoundEngine.play(track);
      set({ currentTrack: track, isPlaying: track !== 'none' });
    },

    stopTrack: () => {
      ambientSoundEngine.stop();
      set({ currentTrack: 'none', isPlaying: false });
    },

    setVolume: (vol) => {
      ambientSoundEngine.setVolume(vol);
      set({ volume: vol });
    },

    toggleTrack: (track) => {
      if (get().currentTrack === track) {
        get().stopTrack();
      } else {
        get().playTrack(track);
      }
    },
  };
});
