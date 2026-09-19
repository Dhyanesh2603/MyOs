import { create } from 'zustand';

export interface SoundState {
  isMuted: boolean;
  volume: number; // 0.0 to 1.0
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useSoundStore = create<SoundState>((set) => ({
  isMuted: false,
  volume: 0.5,
  setMuted: (muted) => set({ isMuted: muted }),
  setVolume: (volume) => set({ volume }),
}));

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Mechanical micro-click for buttons & tactile toggles.
   */
  public playClick(): void {
    const { isMuted, volume } = useSoundStore.getState();
    if (isMuted || volume <= 0) return;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.015);

      gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.016);
    } catch {
      // AudioContext unavailable
    }
  }

  /**
   * Deep tactile resonance when a window snaps into place.
   */
  public playSnap(): void {
    const { isMuted, volume } = useSoundStore.getState();
    if (isMuted || volume <= 0) return;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.065);
    } catch {
      // AudioContext unavailable
    }
  }

  /**
   * Harmonious chime for notifications and successful operations.
   */
  public playChime(): void {
    const { isMuted, volume } = useSoundStore.getState();
    if (isMuted || volume <= 0) return;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(volume * 0.12, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.2);
      });
    } catch {
      // AudioContext unavailable
    }
  }

  /**
   * Subtle alert sound.
   */
  public playAlert(): void {
    const { isMuted, volume } = useSoundStore.getState();
    if (isMuted || volume <= 0) return;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } catch {
      // AudioContext unavailable
    }
  }
}

export const soundEngine = new SoundEngine();
