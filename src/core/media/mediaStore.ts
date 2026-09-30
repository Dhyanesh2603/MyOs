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

export const DEFAULT_TRACKS: Track[] = [];

const loadPersistedTracks = (): Track[] => {
  try {
    const raw = localStorage.getItem('flowos_media_tracks_v3');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const savePersistedTracks = (tracks: Track[]) => {
  try {
    localStorage.setItem('flowos_media_tracks_v3', JSON.stringify(tracks));
  } catch {}
};

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
  if (!track) return;
  if (track.audioUrl) {
    audioEngine.playUrl(track.audioUrl, onEnded);
  } else {
    audioEngine.startTrack(track.baseFreq ?? 130.81);
  }
  audioEngine.setVolume(volume);
}

export const useMediaStore = create<MediaStoreState>((set, get) => ({
  tracks: loadPersistedTracks(),
  currentTrackIndex: 0,
  isPlaying: false,
  volume: 0.8,
  playbackProgressSec: 0,

  togglePlay: () => {
    const { isPlaying, currentTrackIndex, tracks, volume } = get();
    if (tracks.length === 0) return;
    const currentTrack = tracks[currentTrackIndex] ?? tracks[0];
    if (!currentTrack) return;

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
    if (tracks.length === 0) return;
    const currentTrack = tracks[currentTrackIndex] ?? tracks[0];
    if (!currentTrack) return;

    if (!isPlaying) {
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
    if (tracks.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIdx];
    if (!nextTrack) return;

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
    if (tracks.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    const prevTrack = tracks[prevIdx];
    if (!prevTrack) return;

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
    if (!isPlaying || tracks.length === 0) return;
    const currentTrack = tracks[currentTrackIndex] ?? tracks[0];
    if (!currentTrack) return;

    if (currentTrack.durationSec > 0 && playbackProgressSec >= currentTrack.durationSec) {
      get().nextTrack();
    } else {
      set({ playbackProgressSec: playbackProgressSec + 1 });
    }
  },

  addTrack: (track: Track) => {
    const { tracks } = get();
    const updated = [track, ...tracks];
    savePersistedTracks(updated);
    set({ tracks: updated, currentTrackIndex: 0 });
    get().play();
  },

  removeTrack: (id: string) => {
    const { tracks, currentTrackIndex, isPlaying } = get();
    if (tracks.length === 0) return;
    const filtered = tracks.filter((t) => t.id !== id);
    savePersistedTracks(filtered);

    if (filtered.length === 0) {
      if (isPlaying) audioEngine.stop();
      set({ tracks: [], currentTrackIndex: 0, isPlaying: false, playbackProgressSec: 0 });
      return;
    }

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
