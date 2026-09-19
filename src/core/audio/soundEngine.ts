import { create } from 'zustand';

export type AudioThemeId = 'mechanical' | 'nothing' | 'retro' | 'silent';

export interface SoundState {
  isMuted: boolean;
  volume: number; // 0.0 to 1.0
  audioTheme: AudioThemeId;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setAudioTheme: (theme: AudioThemeId) => void;
}

export const useSoundStore = create<SoundState>((set) => ({
  isMuted: false,
  volume: 0.5,
  audioTheme: 'mechanical',
  setMuted: (muted) => set({ isMuted: muted }),
  setVolume: (volume) => set({ volume }),
  setAudioTheme: (audioTheme) => set({ audioTheme }),
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

  /**
   * Acoustic tactile keyboard soundscapes: Mechanical Thock, Nothing Micro-Tick, and Retro 8-bit.
   */
  public playKeypress(key?: string): void {
    const { isMuted, volume, audioTheme } = useSoundStore.getState();
    if (isMuted || volume <= 0 || audioTheme === 'silent') return;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const baseGain = volume * 0.22;

      if (audioTheme === 'mechanical') {
        const charCode = key && key.length === 1 ? key.charCodeAt(0) : 70;
        const pitchJitter = ((charCode % 17) - 8) * 4;

        const isSpace = key === ' ';
        const isEnter = key === 'Enter';
        const isBackspace = key === 'Backspace';

        // 1. Resonant bottom-out "thock"
        const oscThump = ctx.createOscillator();
        const gainThump = ctx.createGain();
        oscThump.type = isSpace ? 'triangle' : 'sine';

        const startFreq = isSpace ? 110 : isEnter ? 135 : isBackspace ? 120 : 160 + pitchJitter;
        const endFreq = isSpace ? 42 : isEnter ? 48 : 55;
        const duration = isSpace ? 0.055 : isEnter ? 0.06 : 0.038;

        oscThump.frequency.setValueAtTime(startFreq, now);
        oscThump.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

        gainThump.gain.setValueAtTime(baseGain * (isSpace ? 1.4 : 1.1), now);
        gainThump.gain.exponentialRampToValueAtTime(0.001, now + duration);

        oscThump.connect(gainThump);
        gainThump.connect(ctx.destination);
        oscThump.start(now);
        oscThump.stop(now + duration + 0.005);

        // 2. Crisp stem click
        const oscClick = ctx.createOscillator();
        const gainClick = ctx.createGain();
        oscClick.type = 'triangle';
        oscClick.frequency.setValueAtTime(820 + pitchJitter * 2, now);
        oscClick.frequency.exponentialRampToValueAtTime(260, now + 0.012);

        gainClick.gain.setValueAtTime(baseGain * 0.7, now);
        gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

        oscClick.connect(gainClick);
        gainClick.connect(ctx.destination);
        oscClick.start(now);
        oscClick.stop(now + 0.015);
      } else if (audioTheme === 'nothing') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const isSpace = key === ' ';
        const baseFreq = isSpace ? 1100 : 1550;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.007);

        gain.gain.setValueAtTime(baseGain * 0.65, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.007);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.009);
      } else if (audioTheme === 'retro') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';

        if (key === 'Enter') {
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.setValueAtTime(880, now + 0.025);
          gain.gain.setValueAtTime(baseGain * 0.45, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.065);
        } else if (key === 'Backspace') {
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.linearRampToValueAtTime(220, now + 0.035);
          gain.gain.setValueAtTime(baseGain * 0.45, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.045);
        } else {
          const charCode = key && key.length === 1 ? key.charCodeAt(0) : 65;
          const stepFreq = 480 + (charCode % 8) * 35;
          osc.frequency.setValueAtTime(stepFreq, now);
          osc.frequency.setValueAtTime(stepFreq * 1.35, now + 0.012);

          gain.gain.setValueAtTime(baseGain * 0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.035);
        }
      }
    } catch {
      // AudioContext unavailable
    }
  }
}

export const soundEngine = new SoundEngine();
