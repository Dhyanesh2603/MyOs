// Procedural Web Audio Ambient Soundscapes (Zero external assets)
export type AmbientTrack =
  | 'none'
  | 'brown_noise'
  | 'rain'
  | 'server_room'
  | 'gamma_waves'
  | 'white_noise'
  | 'campfire'
  | 'deep_space';

type TrackChangeListener = (track: AmbientTrack) => void;
type VolumeChangeListener = (vol: number) => void;

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrack: AmbientTrack = 'none';
  private activeNodes: { stop: () => void }[] = [];
  private volume: number = 0.5;
  private trackListeners: Set<TrackChangeListener> = new Set();
  private volumeListeners: Set<VolumeChangeListener> = new Set();

  public subscribeTrack(fn: TrackChangeListener) {
    this.trackListeners.add(fn);
    return () => {
      this.trackListeners.delete(fn);
    };
  }

  public subscribeVolume(fn: VolumeChangeListener) {
    this.volumeListeners.add(fn);
    return () => {
      this.volumeListeners.delete(fn);
    };
  }

  private notifyTrack() {
    this.trackListeners.forEach((fn) => fn(this.currentTrack));
  }

  private notifyVolume() {
    this.volumeListeners.forEach((fn) => fn(this.volume));
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notifyVolume();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrack(): AmbientTrack {
    return this.currentTrack;
  }

  public stop() {
    this.activeNodes.forEach((n) => {
      try {
        n.stop();
      } catch {}
    });
    this.activeNodes = [];
    this.currentTrack = 'none';
    this.notifyTrack();
  }

  public play(track: AmbientTrack) {
    this.stop();
    if (track === 'none') return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.currentTrack = track;
    this.notifyTrack();

    switch (track) {
      case 'brown_noise':
        this.startBrownNoise();
        break;
      case 'rain':
        this.startRain();
        break;
      case 'server_room':
        this.startServerRoom();
        break;
      case 'gamma_waves':
        this.startGammaWaves();
        break;
      case 'white_noise':
        this.startWhiteNoise();
        break;
      case 'campfire':
        this.startCampfire();
        break;
      case 'deep_space':
        this.startDeepSpace();
        break;
    }
  }

  // Generate continuous buffer with custom filler
  private createNoiseBuffer(durationSeconds = 5, filler: () => number): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = filler();
    }
    return buffer;
  }

  // Deep Work Brownian Noise
  private startBrownNoise() {
    if (!this.ctx || !this.masterGain) return;

    let lastOut = 0.0;
    const buffer = this.createNoiseBuffer(5, () => {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.025 * white) / 1.025;
      return lastOut * 3.2;
    });

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.75, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.activeNodes.push({ stop: () => source.stop() });
  }

  // Server Room Datacenter Hum
  private startServerRoom() {
    if (!this.ctx || !this.masterGain) return;

    // 60Hz & 120Hz Transformer Hum
    const osc60 = this.ctx.createOscillator();
    const osc120 = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc60.type = 'sine';
    osc60.frequency.setValueAtTime(60, this.ctx.currentTime);
    osc120.type = 'sine';
    osc120.frequency.setValueAtTime(120, this.ctx.currentTime);
    oscGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    osc60.connect(oscGain);
    osc120.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc60.start();
    osc120.start();

    // High CFM Cooling Fan Airflow
    const fanBuffer = this.createNoiseBuffer(4, () => (Math.random() * 2 - 1) * 0.35);
    const fanSource = this.ctx.createBufferSource();
    fanSource.buffer = fanBuffer;
    fanSource.loop = true;

    const fanFilter = this.ctx.createBiquadFilter();
    fanFilter.type = 'bandpass';
    fanFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
    fanFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const fanGain = this.ctx.createGain();
    fanGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    fanSource.connect(fanFilter);
    fanFilter.connect(fanGain);
    fanGain.connect(this.masterGain);
    fanSource.start();

    this.activeNodes.push({
      stop: () => {
        osc60.stop();
        osc120.stop();
        fanSource.stop();
      },
    });
  }

  // 40Hz Cognitive Gamma Isochronic Waves
  private startGammaWaves() {
    if (!this.ctx || !this.masterGain) return;

    const carrier = this.ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(196, this.ctx.currentTime); // G3 warm harmonic

    // 40Hz Modulator LFO
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(40, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    lfo.connect(modGain.gain);
    carrier.connect(modGain);
    modGain.connect(this.masterGain);

    carrier.start();
    lfo.start();

    this.activeNodes.push({
      stop: () => {
        carrier.stop();
        lfo.stop();
      },
    });
  }

  // Gentle Rain Soundscape
  private startRain() {
    if (!this.ctx || !this.masterGain) return;

    // Pinkish noise base
    let b0 = 0, b1 = 0, b2 = 0;
    const buffer = this.createNoiseBuffer(5, () => {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      return (b0 + b1 + b2) * 0.25;
    });

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Low-pass filter for rain droplets feel
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.activeNodes.push({ stop: () => source.stop() });
  }

  // Pure White Noise
  private startWhiteNoise() {
    if (!this.ctx || !this.masterGain) return;

    const buffer = this.createNoiseBuffer(4, () => (Math.random() * 2 - 1) * 0.25);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.activeNodes.push({ stop: () => source.stop() });
  }

  // Campfire Crackle
  private startCampfire() {
    if (!this.ctx || !this.masterGain) return;

    // Low rumble
    const rumbleBuffer = this.createNoiseBuffer(4, () => (Math.random() * 2 - 1) * 0.4);
    const rumbleSource = this.ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuffer;
    rumbleSource.loop = true;

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    rumbleSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    rumbleSource.start();

    // Random pops
    const popInterval = setInterval(() => {
      if (!this.ctx || !this.masterGain || this.currentTrack !== 'campfire') return;
      try {
        const osc = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150 + Math.random() * 600, this.ctx.currentTime);
        pGain.gain.setValueAtTime(0.15 + Math.random() * 0.2, this.ctx.currentTime);
        pGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(pGain);
        pGain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      } catch {}
    }, 180);

    this.activeNodes.push({
      stop: () => {
        clearInterval(popInterval);
        rumbleSource.stop();
      },
    });
  }

  // Deep Space Ambient Drone
  private startDeepSpace() {
    if (!this.ctx || !this.masterGain) return;

    const baseFreqs = [55, 110, 164.81, 220];
    const oscs: OscillatorNode[] = [];

    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.15 / (idx + 1), this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      oscs.push(osc);
    });

    this.activeNodes.push({
      stop: () => oscs.forEach((o) => o.stop()),
    });
  }
}

export const ambientSoundEngine = new AmbientSoundEngine();
