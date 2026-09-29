import { create } from 'zustand';
import { audioEngine } from '@apps/music/audioEngine';

export interface Track {
  id: string;
  title: string;
  artist: string;
  baseFreq?: number;
  durationSec: number;
  audioUrl?: string;
  isStream?: boolean;
}

export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'track-stream-1',
    title: 'Lofi Chill Study Beats',
    artist: 'Lofi Radio 24/7 Live Stream',
    audioUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    durationSec: 0,
    isStream: true,
  },
  {
    id: 'track-stream-2',
    title: 'Synthwave & Retrowave Lounge',
    artist: 'Nightdrive Audio Stream',
    audioUrl: 'https://stream.zeno.fm/0r0xa792kwzuv',
    durationSec: 0,
    isStream: true,
  },
  {
    id: 'track-1',
    title: 'Kinetic Drift',
    artist: 'FlowOS Soundscape Lab (Synth)',
    baseFreq: 110, // A2
    durationSec: 184,
  },
  {
    id: 'track-2',
    title: 'Obsidian Horizons',
    artist: 'Synthetic Pulse Studio (Synth)',
    baseFreq: 130.81, // C3
    durationSec: 212,
  },
  {
    id: 'track-3',
    title: 'Subtle Aurora',
    artist: 'Ambient Micro-Kernel (Synth)',
    baseFreq: 164.81, // E3
    durationSec: 195,
  },
  {
    id: 'track-4',
    title: 'Cybernetic Echoes',
    artist: 'Linear Resonance (Synth)',
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
  addTrack: (track: Track) => void;
  removeTrack: (id: string) => void;
}

function startCurrentTrack(track: Track, volume: number, onEnded?: () => void) {
  if (track.audioUrl) {
    audioEngine.playUrl(track.audioUrl, onEnded);
  } else {
    audioEngine.startTrack(track.baseFreq ?? 130.81);
  }
  audioEngine.setVolume(volume);
}

export const useMediaStore = create<MediaStoreState>((set, get) => ({
  tracks: DEFAULT_TRACKS,
  currentTrackIndex: 0,
  isPlaying: false,
  volume: 0.8,
  playbackProgressSec: 0,

  togglePlay: () => {
    const { isPlaying, currentTrackIndex, tracks, volume } = get();
    const currentTrack = tracks[currentTrackIndex] ?? tracks[0]!;

    if (isPlaying) {
      audioEngine.stop();
      set({ isPlaying: false });
    } else {
      startCurrentTrack(currentTrack, volume, () => {
        get().nextTrack();
      });
      set({ isPlaying: true });
    }
  },

  play: () => {
    const { isPlaying, currentTrackIndex, tracks, volume } = get();
    if (!isPlaying) {
      const currentTrack = tracks[currentTrackIndex] ?? tracks[0]!;
      startCurrentTrack(currentTrack, volume, () => {
        get().nextTrack();
      });
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
      startCurrentTrack(nextTrack, volume, () => {
        get().nextTrack();
      });
    }
    set({ currentTrackIndex: nextIdx, playbackProgressSec: 0 });
  },

  prevTrack: () => {
    const { currentTrackIndex, tracks, isPlaying, volume } = get();
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    const prevTrack = tracks[prevIdx]!;
    if (isPlaying) {
      audioEngine.stop();
      startCurrentTrack(prevTrack, volume, () => {
        get().nextTrack();
      });
    }
    set({ currentTrackIndex: prevIdx, playbackProgressSec: 0 });
  },

  setTrack: (index: number) => {
    const { tracks, isPlaying, volume } = get();
    if (index >= 0 && index < tracks.length) {
      const targetTrack = tracks[index]!;
      if (isPlaying) {
        audioEngine.stop();
        startCurrentTrack(targetTrack, volume, () => {
          get().nextTrack();
        });
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
    if (currentTrack.durationSec > 0 && playbackProgressSec >= currentTrack.durationSec) {
      get().nextTrack();
    } else {
      set({ playbackProgressSec: playbackProgressSec + 1 });
    }
  },

  addTrack: (track: Track) => {
    const { tracks } = get();
    const updated = [track, ...tracks];
    set({ tracks: updated, currentTrackIndex: 0 });
    get().play();
  },

  removeTrack: (id: string) => {
    const { tracks, currentTrackIndex, isPlaying } = get();
    if (tracks.length <= 1) return;
    const filtered = tracks.filter((t) => t.id !== id);
    const newIdx = Math.min(currentTrackIndex, filtered.length - 1);
    if (isPlaying) {
      audioEngine.stop();
      startCurrentTrack(filtered[newIdx]!, get().volume, () => {
        get().nextTrack();
      });
    }
    set({ tracks: filtered, currentTrackIndex: newIdx });
  },
}));
