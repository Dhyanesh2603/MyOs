import { create } from 'zustand';
import { audioEngine } from '@apps/music/audioEngine';

export interface Track {
  id: string;
  title: string;
  artist: string;
  baseFreq: number;
  durationSec: number;
}

export const TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Kinetic Drift',
    artist: 'FlowOS Soundscape Lab',
    baseFreq: 110, // A2
    durationSec: 184,
  },
  {
    id: 'track-2',
    title: 'Obsidian Horizons',
    artist: 'Synthetic Pulse Studio',
    baseFreq: 130.81, // C3
    durationSec: 212,
  },
  {
    id: 'track-3',
    title: 'Subtle Aurora',
    artist: 'Ambient Micro-Kernel',
    baseFreq: 164.81, // E3
    durationSec: 195,
  },
  {
    id: 'track-4',
    title: 'Cybernetic Echoes',
    artist: 'Linear Resonance',
    baseFreq: 146.83, // D3
    durationSec: 230,
  },
];

export interface MediaStoreState {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  playbackProgressSec: number;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setTrack: (index: number) => void;
  setVolume: (volume: number) => void;
  tickProgress: () => void;
}

export const useMediaStore = create<MediaStoreState>((set, get) => ({
  tracks: TRACKS,
  currentTrackIndex: 0,
  isPlaying: false,
  volume: 0.8,
  playbackProgressSec: 12,

  togglePlay: () => {
    const { isPlaying, currentTrackIndex, tracks, volume } = get();
    const currentTrack = tracks[currentTrackIndex] ?? tracks[0]!;

    if (isPlaying) {
      audioEngine.stop();
      set({ isPlaying: false });
    } else {
      audioEngine.startTrack(currentTrack.baseFreq);
      audioEngine.setVolume(volume);
      set({ isPlaying: true });
    }
  },

  play: () => {
    const { isPlaying, currentTrackIndex, tracks, volume } = get();
    if (!isPlaying) {
      const currentTrack = tracks[currentTrackIndex] ?? tracks[0]!;
      audioEngine.startTrack(currentTrack.baseFreq);
      audioEngine.setVolume(volume);
      set({ isPlaying: true });
    }
  },

  pause: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      audioEngine.stop();
      set({ isPlaying: false });
    }
  },

  nextTrack: () => {
    const { currentTrackIndex, tracks, isPlaying, volume } = get();
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIdx]!;
    if (isPlaying) {
      audioEngine.stop();
      audioEngine.startTrack(nextTrack.baseFreq);
      audioEngine.setVolume(volume);
    }
    set({ currentTrackIndex: nextIdx, playbackProgressSec: 0 });
  },

  prevTrack: () => {
    const { currentTrackIndex, tracks, isPlaying, volume } = get();
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    const prevTrack = tracks[prevIdx]!;
    if (isPlaying) {
      audioEngine.stop();
      audioEngine.startTrack(prevTrack.baseFreq);
      audioEngine.setVolume(volume);
    }
    set({ currentTrackIndex: prevIdx, playbackProgressSec: 0 });
  },

  setTrack: (index: number) => {
    const { tracks, isPlaying, volume } = get();
    if (index >= 0 && index < tracks.length) {
      const targetTrack = tracks[index]!;
      if (isPlaying) {
        audioEngine.stop();
        audioEngine.startTrack(targetTrack.baseFreq);
        audioEngine.setVolume(volume);
      }
      set({ currentTrackIndex: index, playbackProgressSec: 0 });
    }
  },

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    audioEngine.setVolume(clamped);
    set({ volume: clamped });
  },

  tickProgress: () => {
    const { isPlaying, playbackProgressSec, currentTrackIndex, tracks } = get();
    if (!isPlaying) return;
    const currentTrack = tracks[currentTrackIndex] ?? tracks[0]!;
    if (playbackProgressSec >= currentTrack.durationSec) {
      get().nextTrack();
    } else {
      set({ playbackProgressSec: playbackProgressSec + 1 });
    }
  },
}));
