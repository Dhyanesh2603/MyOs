/**
 * Web Audio Engine for Onyx OS: Supports both Procedural Synthesis and Real Audio Streams / Files
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private isPlaying = false;
  private isMediaElement = false;
  private currentVolume = 0.8;
  private onEndedCallback: (() => void) | null = null;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
    }

    if (!this.gainNode) {
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.currentVolume * 0.3, this.ctx.currentTime);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    return this.ctx;
  }

  /**
   * Play procedural synthesizer track
   */
  public startTrack(baseFreq = 130.81): AnalyserNode {
    const ctx = this.initContext();
    this.stop();

    const masterGain = this.gainNode!;

    // Harmonic Oscillators
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime); // Perfect fifth

    // Low Frequency Oscillator for subtle breathing tremolo
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.3, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);

    osc1.connect(masterGain);
    osc2.connect(masterGain);

    osc1.start();
    osc2.start();
    lfo.start();

    this.osc1 = osc1;
    this.osc2 = osc2;
    this.lfo = lfo;
    this.lfoGain = lfoGain;
    this.isPlaying = true;
    this.isMediaElement = false;

    return this.analyser!;
  }

  /**
   * Play real audio URL (MP3, WAV, Blob, or Internet Stream)
   */
  public playUrl(url: string, onEnded?: () => void): AnalyserNode {
    const ctx = this.initContext();
    this.stop();

    this.onEndedCallback = onEnded || null;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';

      try {
        this.audioSourceNode = ctx.createMediaElementSource(this.audioElement);
        this.audioSourceNode.connect(this.gainNode!);
      } catch {
        // Fallback: browser CORS policy may require direct output
      }
    }

    this.audioElement.src = url;
    this.audioElement.onended = () => {
      this.isPlaying = false;
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    };

    this.audioElement.play().catch((err) => {
      console.warn('AudioEngine playback warning:', err);
    });

    this.isPlaying = true;
    this.isMediaElement = true;
    return this.analyser!;
  }

  public stop(): void {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {}
    }

    try {
      this.osc1?.stop();
      this.osc2?.stop();
      this.lfo?.stop();
      this.osc1?.disconnect();
      this.osc2?.disconnect();
      this.lfo?.disconnect();
      this.lfoGain?.disconnect();
    } catch {
      // Ignored
    }

    this.osc1 = null;
    this.osc2 = null;
    this.lfo = null;
    this.lfoGain = null;
    this.isPlaying = false;
  }

  public pause(): void {
    if (this.audioElement && this.isMediaElement) {
      this.audioElement.pause();
    }
    this.isPlaying = false;
  }

  public resume(): void {
    if (this.audioElement && this.isMediaElement) {
      this.audioElement.play().catch(() => {});
      this.isPlaying = true;
    }
  }

  public setVolume(vol: number): void {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.currentVolume * 0.3, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.currentVolume;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getPlayingState(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new AudioEngine();
