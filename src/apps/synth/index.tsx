import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Volume2,
  VolumeX,
  Radio,
  Activity,
  Music2,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';

// Sound synthesis types
type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface PianoKey {
  note: string;
  freq: number;
  isBlack: boolean;
  charKey: string;
}

const PIANO_KEYS: PianoKey[] = [
  { note: 'C3', freq: 130.81, isBlack: false, charKey: 'a' },
  { note: 'C#3', freq: 138.59, isBlack: true, charKey: 'w' },
  { note: 'D3', freq: 146.83, isBlack: false, charKey: 's' },
  { note: 'D#3', freq: 155.56, isBlack: true, charKey: 'e' },
  { note: 'E3', freq: 164.81, isBlack: false, charKey: 'd' },
  { note: 'F3', freq: 174.61, isBlack: false, charKey: 'f' },
  { note: 'F#3', freq: 185.0, isBlack: true, charKey: 't' },
  { note: 'G3', freq: 196.0, isBlack: false, charKey: 'g' },
  { note: 'G#3', freq: 207.65, isBlack: true, charKey: 'y' },
  { note: 'A3', freq: 220.0, isBlack: false, charKey: 'h' },
  { note: 'A#3', freq: 233.08, isBlack: true, charKey: 'u' },
  { note: 'B3', freq: 246.94, isBlack: false, charKey: 'j' },
  { note: 'C4', freq: 261.63, isBlack: false, charKey: 'k' },
  { note: 'C#4', freq: 277.18, isBlack: true, charKey: 'o' },
  { note: 'D4', freq: 293.66, isBlack: false, charKey: 'l' },
  { note: 'D#4', freq: 311.13, isBlack: true, charKey: 'p' },
  { note: 'E4', freq: 329.63, isBlack: false, charKey: ';' },
];

const PRESETS = {
  lofi: {
    name: 'Lo-Fi Lounge',
    bpm: 88,
    cutoff: 3200,
    echo: 0.35,
    pattern: [
      [true, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
      [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], // Hi-Hat
      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false], // Clap
    ],
  },
  electro: {
    name: 'Electro Wave',
    bpm: 124,
    cutoff: 6500,
    echo: 0.2,
    pattern: [
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Hi-Hat
      [false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, true], // Clap
    ],
  },
  techno: {
    name: 'Minimal Techno',
    bpm: 130,
    cutoff: 4800,
    echo: 0.45,
    pattern: [
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
      [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], // Snare
      [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Hi-Hat
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Clap
    ],
  },
};

const TRACK_LABELS = [
  { name: 'KICK', color: 'bg-amber-500', activeText: 'text-amber-400' },
  { name: 'SNARE', color: 'bg-sky-400', activeText: 'text-sky-400' },
  { name: 'HI-HAT', color: 'bg-yellow-400', activeText: 'text-yellow-400' },
  { name: 'CLAP', color: 'bg-emerald-400', activeText: 'text-emerald-400' },
];

export const PocketSynthApp: React.FC<AppProps> = () => {
  // Audio Nodes Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const activeVoicesRef = useRef<Map<string, { osc: OscillatorNode; gain: GainNode }>>(new Map());

  // Synth Parameters State
  const [waveform, setWaveform] = useState<WaveformType>('sawtooth');
  const [octave, setOctave] = useState<number>(0); // -1, 0, +1
  const [cutoff, setCutoff] = useState<number>(4500); // 200 - 12000 Hz
  const [echo, setEcho] = useState<number>(0.25); // 0 - 0.7
  const [volume, setVolume] = useState<number>(0.75); // 0 - 1
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sequencer State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(115);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [grid, setGrid] = useState<boolean[][]>(PRESETS.lofi.pattern);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Canvas Oscilloscope Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // Initialize Web Audio Engine
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();
      const delayNode = ctx.createDelay();
      const delayGain = ctx.createGain();
      const analyser = ctx.createAnalyser();

      // Configure Filter
      filterNode.type = 'lowpass';
      filterNode.frequency.value = cutoff;

      // Configure Delay / Echo Loop
      delayNode.delayTime.value = 0.28;
      delayGain.gain.value = echo;
      filterNode.connect(delayNode);
      delayNode.connect(delayGain);
      delayGain.connect(delayNode);
      delayGain.connect(masterGain);

      // Route Filter -> Master Gain -> Analyser -> Destination
      filterNode.connect(masterGain);
      masterGain.gain.value = volume;
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);
      analyser.fftSize = 256;

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
      filterNodeRef.current = filterNode;
      delayNodeRef.current = delayNode;
      delayGainRef.current = delayGain;
      analyserRef.current = analyser;
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    return audioCtxRef.current;
  }, [cutoff, echo, volume]);

  // Update master filter cutoff
  useEffect(() => {
    if (filterNodeRef.current && audioCtxRef.current) {
      filterNodeRef.current.frequency.setTargetAtTime(cutoff, audioCtxRef.current.currentTime, 0.03);
    }
  }, [cutoff]);

  // Update echo delay feedback
  useEffect(() => {
    if (delayGainRef.current && audioCtxRef.current) {
      delayGainRef.current.gain.setTargetAtTime(echo, audioCtxRef.current.currentTime, 0.03);
    }
  }, [echo]);

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(isMuted ? 0 : volume, audioCtxRef.current.currentTime, 0.03);
    }
  }, [volume, isMuted]);

  // Drum Synthesizers (zero external assets needed)
  const playDrumSound = useCallback((trackIndex: number) => {
    const ctx = getAudioContext();
    if (!ctx || !filterNodeRef.current) return;
    const dest = filterNodeRef.current;
    const now = ctx.currentTime;

    if (trackIndex === 0) {
      // Punchy 808 Kick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);
      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (trackIndex === 1) {
      // Crisp Snappy Snare
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.18, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1200;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(dest);
      noise.start(now);

      // Snare Body Tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
      oscGain.gain.setValueAtTime(0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (trackIndex === 2) {
      // Metallic Hi-Hat
      const hatBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
      const data = hatBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = hatBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7500;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      noise.start(now);
    } else if (trackIndex === 3) {
      // Acoustic Hand Clap
      const clapBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const data = clapBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = clapBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      noise.start(now);
    }
  }, [getAudioContext]);

  // Polyphonic Synth Note Handlers
  const startNote = useCallback(
    (keyNote: string, baseFreq: number) => {
      const ctx = getAudioContext();
      if (!ctx || !filterNodeRef.current) return;
      if (activeVoicesRef.current.has(keyNote)) return;

      const effectiveFreq = baseFreq * Math.pow(2, octave);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveform;
      osc.frequency.setValueAtTime(effectiveFreq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.35, now + 0.02);

      osc.connect(gain);
      gain.connect(filterNodeRef.current);
      osc.start(now);

      activeVoicesRef.current.set(keyNote, { osc, gain });
      setPressedKeys((prev) => new Set(prev).add(keyNote));
    },
    [getAudioContext, waveform, octave]
  );

  const stopNote = useCallback((keyNote: string) => {
    const voice = activeVoicesRef.current.get(keyNote);
    if (!voice || !audioCtxRef.current) return;

    const { osc, gain } = voice;
    const now = audioCtxRef.current.currentTime;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.stop(now + 0.14);

    activeVoicesRef.current.delete(keyNote);
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(keyNote);
      return next;
    });
  }, []);

  // Keyboard Shortcuts for Piano
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const pressed = e.key.toLowerCase();
      const match = PIANO_KEYS.find((k) => k.charKey === pressed);
      if (match) {
        startNote(match.note, match.freq);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const released = e.key.toLowerCase();
      const match = PIANO_KEYS.find((k) => k.charKey === released);
      if (match) {
        stopNote(match.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startNote, stopNote]);

  // Step Sequencer Clock
  useEffect(() => {
    if (!isPlaying) return;

    const msPerStep = (60000 / bpm) / 4;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % 16;
        // Trigger drum sound on each active track
        for (let track = 0; track < 4; track++) {
          if (grid[track]?.[next]) {
            playDrumSound(track);
          }
        }
        return next;
      });
    }, msPerStep);

    return () => clearInterval(interval);
  }, [isPlaying, bpm, grid, playDrumSound]);

  // Oscilloscope Canvas Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(128);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);

      ctx.fillStyle = '#111215';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (analyserRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#10b981'; // Phosphor green
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const sliceWidth = (canvas.width * 1.0) / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] ?? 128) / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Flat center line when idle
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const toggleStep = (trackIdx: number, stepIdx: number) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      const targetRow = next[trackIdx];
      if (targetRow) {
        targetRow[stepIdx] = !targetRow[stepIdx];
      }
      return next;
    });
  };

  const loadPreset = (key: keyof typeof PRESETS) => {
    const p = PRESETS[key];
    setBpm(p.bpm);
    setCutoff(p.cutoff);
    setEcho(p.echo);
    setGrid(p.pattern);
  };

  const clearGrid = () => {
    setGrid([
      new Array(16).fill(false),
      new Array(16).fill(false),
      new Array(16).fill(false),
      new Array(16).fill(false),
    ]);
  };

  return (
    <div className="flex h-full w-full flex-col select-none bg-[#18191c] text-neutral-200 overflow-y-auto p-4 font-sans">
      {/* Top Header: Dieter Rams / OP-1 Industrial Aesthetic */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-black font-black text-sm shadow-md">
            OP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-wider text-white">
                POCKET SYNTH OP-1
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-emerald-400 border border-emerald-500/30">
                PRO-DSP
              </span>
            </div>
            <div className="font-mono text-[10px] text-neutral-400">
              TACTILE POLYPHONIC WORKSTATION & SEQUENCER
            </div>
          </div>
        </div>

        {/* Master Presets */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-neutral-400 mr-1">GROOVE:</span>
          <button
            onClick={() => loadPreset('lofi')}
            className="rounded border border-white/15 bg-white/5 px-2 py-1 font-mono text-[10px] hover:bg-white/10 hover:text-orange-400 transition-colors"
          >
            Lo-Fi
          </button>
          <button
            onClick={() => loadPreset('electro')}
            className="rounded border border-white/15 bg-white/5 px-2 py-1 font-mono text-[10px] hover:bg-white/10 hover:text-sky-400 transition-colors"
          >
            Electro
          </button>
          <button
            onClick={() => loadPreset('techno')}
            className="rounded border border-white/15 bg-white/5 px-2 py-1 font-mono text-[10px] hover:bg-white/10 hover:text-emerald-400 transition-colors"
          >
            Techno
          </button>
        </div>
      </div>

      {/* Top Console Bay: Oscilloscope + Knobs + Master Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
        {/* CRT Vector Oscilloscope */}
        <div className="md:col-span-5 flex flex-col rounded-xl border border-white/10 bg-[#0d0e11] p-2.5 shadow-inner">
          <div className="flex items-center justify-between mb-1.5 px-1 font-mono text-[9px] text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>VECTOR CRT MONITOR</span>
            </div>
            <span className="text-emerald-400 font-bold">256-FFT ACTIVE</span>
          </div>
          <canvas
            ref={canvasRef}
            width={340}
            height={85}
            className="w-full h-20 rounded-lg border border-emerald-950 bg-[#0a0c0a]"
          />
        </div>

        {/* Tactical Parameters Strip */}
        <div className="md:col-span-7 flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="grid grid-cols-4 gap-2 text-center mb-2">
            {/* Waveform Selector */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] text-neutral-400">WAVE</span>
              <div className="grid grid-cols-2 gap-1">
                {(['sine', 'square', 'sawtooth', 'triangle'] as WaveformType[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => setWaveform(w)}
                    className={`rounded px-1.5 py-1 font-mono text-[9px] uppercase transition-colors ${
                      waveform === w
                        ? 'bg-orange-500 font-bold text-black shadow'
                        : 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {w.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Octave Shift */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] text-neutral-400">OCTAVE</span>
              <div className="flex items-center justify-center gap-1">
                {[-1, 0, 1].map((oct) => (
                  <button
                    key={oct}
                    onClick={() => setOctave(oct)}
                    className={`flex-1 rounded py-2 font-mono text-[10px] transition-colors ${
                      octave === oct
                        ? 'bg-sky-500 font-bold text-black shadow'
                        : 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {oct > 0 ? `+${oct}` : oct}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Cutoff */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono text-[9px] text-neutral-400">
                <span>FILTER</span>
                <span className="text-yellow-400">{Math.round(cutoff)}Hz</span>
              </div>
              <input
                type="range"
                min="300"
                max="12000"
                step="50"
                value={cutoff}
                onChange={(e) => setCutoff(parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-yellow-400 mt-2"
              />
              <span className="font-mono text-[8px] text-neutral-500">LOW-PASS</span>
            </div>

            {/* Echo / Delay */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono text-[9px] text-neutral-400">
                <span>ECHO</span>
                <span className="text-emerald-400">{Math.round(echo * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.7"
                step="0.02"
                value={echo}
                onChange={(e) => setEcho(parseFloat(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-400 mt-2"
              />
              <span className="font-mono text-[8px] text-neutral-500">FEEDBACK</span>
            </div>
          </div>

          {/* Master Transport & BPM Controls */}
          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all shadow-md ${
                  isPlaying
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                }`}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                <span>{isPlaying ? 'STOP' : 'PLAY'}</span>
              </button>

              <button
                onClick={clearGrid}
                title="Clear pattern"
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* BPM Adjuster */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-neutral-400">TEMPO:</span>
              <input
                type="range"
                min="60"
                max="180"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                className="w-20 h-1.5 appearance-none rounded-lg bg-white/10 accent-orange-500 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-orange-400 min-w-[42px]">
                {bpm} <span className="text-[9px] font-normal text-neutral-400">BPM</span>
              </span>
            </div>

            {/* Master Volume */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-neutral-400 hover:text-white"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 h-1.5 appearance-none rounded-lg bg-white/10 accent-white cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: 16-Step Drum Sequencer Grid */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-orange-400" />
            <span className="font-mono text-xs font-bold tracking-wider text-white">
              16-STEP BEAT MACHINE
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-neutral-400">
            <span>STEP:</span>
            <span className="font-bold text-orange-400">
              {(currentStep + 1).toString().padStart(2, '0')} / 16
            </span>
          </div>
        </div>

        {/* 4-Track Step Matrix */}
        <div className="flex flex-col gap-2">
          {grid.map((row, trackIdx) => {
            const trackMeta = TRACK_LABELS[trackIdx] || {
              name: `TRK ${trackIdx}`,
              color: 'bg-white',
              activeText: 'text-white',
            };

            return (
              <div key={trackIdx} className="flex items-center gap-2">
                {/* Track Label Trigger Button */}
                <button
                  onClick={() => playDrumSound(trackIdx)}
                  className="w-16 shrink-0 rounded border border-white/10 bg-white/5 py-1.5 px-2 text-left hover:bg-white/10 transition-colors"
                >
                  <div className={`font-mono text-[9px] font-bold ${trackMeta.activeText}`}>
                    {trackMeta.name}
                  </div>
                </button>

                {/* 16 Step Buttons */}
                <div className="grid grid-cols-16 gap-1 flex-1">
                  {row.map((active, stepIdx) => {
                    const isPlayhead = currentStep === stepIdx && isPlaying;
                    const isBeatStart = stepIdx % 4 === 0;

                    return (
                      <button
                        key={stepIdx}
                        onClick={() => toggleStep(trackIdx, stepIdx)}
                        className={`relative h-8 rounded transition-all flex flex-col items-center justify-center ${
                          isBeatStart ? 'border-neutral-600' : 'border-neutral-800'
                        } border ${
                          active
                            ? `${trackMeta.color} shadow-[0_0_8px_rgba(255,255,255,0.3)]`
                            : 'bg-[#22242a] hover:bg-[#2c2e35]'
                        } ${isPlayhead ? 'ring-2 ring-white ring-offset-1 ring-offset-[#18191c]' : ''}`}
                      >
                        {/* Step Marker Dot */}
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            active
                              ? 'bg-black'
                              : isPlayhead
                              ? 'bg-white'
                              : isBeatStart
                              ? 'bg-neutral-500'
                              : 'bg-neutral-700'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: 2-Octave Polyphonic Tactile Piano Keyboard */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Music2 className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-mono text-xs font-bold tracking-wider text-white">
              POLYPHONIC SYNTH KEYBOARD
            </span>
          </div>
          <span className="font-mono text-[10px] text-neutral-400">
            PLAY VIA MOUSE OR KEYBOARD KEYS [A, W, S, E, D, F, G, H...]
          </span>
        </div>

        {/* Piano Keys Board */}
        <div className="relative flex h-32 w-full justify-center overflow-x-auto rounded-xl border border-white/15 bg-neutral-900 p-2 shadow-2xl">
          {PIANO_KEYS.map((key) => {
            const isPressed = pressedKeys.has(key.note);

            if (key.isBlack) {
              return (
                <div
                  key={key.note}
                  onMouseDown={() => startNote(key.note, key.freq)}
                  onMouseUp={() => stopNote(key.note)}
                  onMouseLeave={() => {
                    if (isPressed) stopNote(key.note);
                  }}
                  className={`relative -mx-3.5 z-10 h-20 w-7 cursor-pointer rounded-b-md border border-neutral-700 transition-all flex flex-col justify-end items-center pb-1 select-none ${
                    isPressed
                      ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)] translate-y-0.5'
                      : 'bg-neutral-950 hover:bg-neutral-800'
                  }`}
                >
                  <span className={`font-mono text-[8px] font-bold ${isPressed ? 'text-black' : 'text-neutral-400'}`}>
                    {key.charKey.toUpperCase()}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={key.note}
                onMouseDown={() => startNote(key.note, key.freq)}
                onMouseUp={() => stopNote(key.note)}
                onMouseLeave={() => {
                  if (isPressed) stopNote(key.note);
                }}
                className={`relative z-0 h-full w-10 cursor-pointer rounded-b-lg border-x border-b border-neutral-400/40 transition-all flex flex-col justify-end items-center pb-1.5 select-none ${
                  isPressed
                    ? 'bg-amber-200 shadow-inner translate-y-0.5'
                    : 'bg-white hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                <span className="font-mono text-[9px] font-bold text-neutral-800">
                  {key.note}
                </span>
                <span className="font-mono text-[8px] text-neutral-500">
                  {key.charKey.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const synthManifest: AppManifest = {
  id: 'synth',
  name: 'Pocket Synth',
  description: 'Teenage Engineering inspired polyphonic synthesizer and 16-step beat machine with live CRT oscilloscope.',
  category: 'media',
  icon: Sliders,
  defaultSize: { width: 780, height: 560 },
  constraints: { minWidth: 540, minHeight: 460, maxWidth: 960, maxHeight: 720 },
  allowMultipleInstances: false,
  permissions: ['audio'],
  component: PocketSynthApp,
};
