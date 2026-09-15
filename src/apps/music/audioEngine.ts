/**
 * Procedural Web Audio Synthesizer & Analyser for FlowOS
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isPlaying = false;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public startTrack(baseFreq = 130.81): AnalyserNode {
    const ctx = this.initContext();

    if (this.isPlaying) {
      this.stop();
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    this.analyser = analyser;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
    this.gainNode = masterGain;

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
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    osc1.start();
    osc2.start();
    lfo.start();

    this.osc1 = osc1;
    this.osc2 = osc2;
    this.lfo = lfo;
    this.isPlaying = true;

    return analyser;
  }

  public stop(): void {
    if (!this.isPlaying) return;

    try {
      this.osc1?.stop();
      this.osc2?.stop();
      this.lfo?.stop();
      this.osc1?.disconnect();
      this.osc2?.disconnect();
      this.lfo?.disconnect();
    } catch {
      // Ignored
    }

    this.isPlaying = false;
  }

  public setVolume(vol: number): void {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, vol * 0.3)), this.ctx.currentTime);
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
