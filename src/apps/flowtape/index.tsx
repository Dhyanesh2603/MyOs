import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Play,
  Pause,
  Download,
  Disc,
  Volume2,
  VolumeX,
  Check,
  RotateCcw,
  Music,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { soundEngine } from '@core/audio/soundEngine';

interface VoiceTake {
  id: string;
  blobUrl: string;
  durationSec: number;
  timestamp: string;
  name: string;
  isPreset?: boolean;
}

const PRESET_TAPES: VoiceTake[] = [
  {
    id: 'tape-lofi',
    name: 'Lo-Fi Midnight Reverie',
    blobUrl: '',
    durationSec: 180,
    timestamp: 'Preset A1',
    isPreset: true,
  },
  {
    id: 'tape-rain',
    name: 'Cyberpunk Rain & Fog',
    blobUrl: '',
    durationSec: 240,
    timestamp: 'Preset A2',
    isPreset: true,
  },
  {
    id: 'tape-synth',
    name: 'Analog Warm Vinyl',
    blobUrl: '',
    durationSec: 150,
    timestamp: 'Preset B1',
    isPreset: true,
  },
];

export const FlowTapeApp: React.FC<AppProps> = () => {
  const writeFile = useVFSStore((s) => s.writeFile);

  // Recording & Playback State
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [tapeType, setTapeType] = useState<'normal' | 'chrome' | 'metal'>('chrome');
  const [takes, setTakes] = useState<VoiceTake[]>(PRESET_TAPES);
  const [selectedTakeIndex, setSelectedTakeIndex] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [savedAlert, setSavedAlert] = useState<string | null>(null);

  // Audio / MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const synthNodesRef = useRef<AudioNode[]>([]);
  const animFrameRef = useRef<number>(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const durationTimerRef = useRef<number | null>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize Web Audio Context for VU meter & waveform
  const initAudioEngine = useCallback(async () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }, []);

  // Visualizer Canvas Loop (Real-time Audio Ribbon)
  useEffect(() => {
    initAudioEngine();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(64);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#0a0c10';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (analyserRef.current && (isRecording || isPlaying)) {
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] ?? 0;
        }
        const avg = sum / dataArray.length / 255;
        setAudioLevel(avg);

        // Render waveform ribbon
        const barWidth = (w / dataArray.length) * 1.5;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = (dataArray[i] ?? 0) / 255;
          const barHeight = val * h * 0.85;
          const gradient = ctx.createLinearGradient(0, h - barHeight, 0, h);
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(1, '#ea580c');
          ctx.fillStyle = gradient;
          ctx.fillRect(x, (h - barHeight) / 2, barWidth - 1, barHeight);
          x += barWidth;
        }
      } else {
        setAudioLevel(0.04);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [initAudioEngine, isRecording, isPlaying]);

  /**
   * Generates procedural ambient drone for built-in tape presets
   */
  const startPresetSynth = (name: string) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    stopPresetSynth();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    if (name.includes('Lo-Fi')) {
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(220, ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(440, ctx.currentTime);
    } else if (name.includes('Rain')) {
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(140, ctx.currentTime);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(175, ctx.currentTime);
    } else {
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220, ctx.currentTime);
    }

    gain.gain.setValueAtTime(isMuted ? 0 : 0.08, ctx.currentTime);

    if (analyserRef.current) {
      gain.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);
    } else {
      gain.connect(ctx.destination);
    }

    osc1.connect(gain);
    osc2.connect(gain);
    osc1.start();
    osc2.start();

    synthNodesRef.current = [osc1, osc2, gain];
  };

  const stopPresetSynth = () => {
    synthNodesRef.current.forEach((n) => {
      try {
        if ('stop' in n && typeof (n as AudioScheduledSourceNode).stop === 'function') {
          (n as AudioScheduledSourceNode).stop();
        }
        n.disconnect();
      } catch {}
    });
    synthNodesRef.current = [];
  };

  // Start Voice Recording
  const startRecording = async () => {
    soundEngine.playClick();
    await initAudioEngine();

    audioChunksRef.current = [];
    setRecordDuration(0);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (audioCtxRef.current && analyserRef.current) {
          const source = audioCtxRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
        }

        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const blobUrl = URL.createObjectURL(blob);
          const takeId = `Take_${Date.now()}`;
          const newTake: VoiceTake = {
            id: takeId,
            name: `Voice Take ${takes.length - PRESET_TAPES.length + 1}`,
            blobUrl,
            durationSec: recordDuration,
            timestamp: new Date().toLocaleTimeString(),
          };
          setTakes((prev) => [newTake, ...prev]);
          setSelectedTakeIndex(0);
          saveTakeToVFS(newTake, blob);
        };

        mediaRecorderRef.current = recorder;
        recorder.start(200);
        setIsRecording(true);

        durationTimerRef.current = window.setInterval(() => {
          setRecordDuration((prev) => prev + 1);
        }, 1000);
      } else {
        throw new Error('getUserMedia not supported');
      }
    } catch {
      // Synthetic recording mode if hardware mic unavailable
      setIsRecording(true);
      durationTimerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    soundEngine.playClick();
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    } else if (isRecording) {
      const simulatedTake: VoiceTake = {
        id: `Take_${Date.now()}`,
        name: `Voice Take ${takes.length - PRESET_TAPES.length + 1}`,
        blobUrl: '',
        durationSec: Math.max(1, recordDuration),
        timestamp: new Date().toLocaleTimeString(),
      };
      setTakes((prev) => [simulatedTake, ...prev]);
      setSelectedTakeIndex(0);
    }

    setIsRecording(false);
  };

  // Save Take to VFS
  const saveTakeToVFS = async (take: VoiceTake, blob: Blob) => {
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const filename = `${take.name.replace(/\s+/g, '_')}_${Date.now()}.webm`;
        await writeFile(`/home/user/Music/${filename}`, base64);
        setSavedAlert(filename);
        setTimeout(() => setSavedAlert(null), 3500);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.warn('VFS save error:', e);
    }
  };

  const activeTake = takes[selectedTakeIndex];

  // Playback Active Take
  const togglePlayback = () => {
    soundEngine.playClick();
    if (!activeTake) return;

    if (isPlaying) {
      if (audioElementRef.current) audioElementRef.current.pause();
      stopPresetSynth();
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);

      if (activeTake.isPreset) {
        startPresetSynth(activeTake.name);
      } else if (activeTake.blobUrl) {
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio(activeTake.blobUrl);
          audioElementRef.current.onended = () => {
            setIsPlaying(false);
            setPlaybackTime(0);
          };
          audioElementRef.current.ontimeupdate = () => {
            if (audioElementRef.current) {
              setPlaybackTime(Math.floor(audioElementRef.current.currentTime));
            }
          };
        } else {
          audioElementRef.current.src = activeTake.blobUrl;
        }
        audioElementRef.current.playbackRate = playbackSpeed;
        audioElementRef.current.play();
      }

      // Track playback progression
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = window.setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= activeTake.durationSec) {
            setIsPlaying(false);
            stopPresetSynth();
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
  };

  const handleRewind = () => {
    soundEngine.playClick();
    setPlaybackTime(0);
    if (audioElementRef.current) audioElementRef.current.currentTime = 0;
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#0f1118] text-neutral-200 select-none overflow-y-auto font-sans p-4">
      {/* Top Header Bar: Onyx Tape Studio */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-black font-black text-xs shadow-md">
            OT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-wider text-white">
                ONYX TAPE STUDIO
              </span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-400 border border-amber-500/30 uppercase">
                {tapeType} Bias IV
              </span>
            </div>
            <div className="font-mono text-[10px] text-neutral-400">
              TACTILE CASSETTE DECK & VOICE RECORDER
            </div>
          </div>
        </div>

        {/* Tape Type Selector */}
        <div className="flex items-center gap-1.5">
          {(['normal', 'chrome', 'metal'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTapeType(t); soundEngine.playClick(); }}
              className={`rounded px-2 py-0.5 font-mono text-[9px] font-semibold uppercase transition-colors cursor-pointer ${
                tapeType === t
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Analog Cassette Deck */}
      <div className="relative rounded-2xl border border-white/15 bg-gradient-to-b from-[#181a24] to-[#10121a] p-5 shadow-2xl overflow-hidden mb-4">
        {/* Specular Edge */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />

        {/* Cassette Acrylic Window */}
        <div className="relative mx-auto max-w-[440px] rounded-xl border border-white/20 bg-black/60 p-4 shadow-inner">
          {/* Tape Label */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-[10px] font-mono text-amber-300">
            <span className="truncate max-w-[200px] font-bold">
              {activeTake ? activeTake.name : 'NO TAPE INSERTED'}
            </span>
            <span className="font-bold">
              {formatSeconds(isPlaying ? playbackTime : recordDuration)} /{' '}
              {formatSeconds(activeTake ? activeTake.durationSec : 0)}
            </span>
          </div>

          {/* Dual Mechanical Spinning Reels */}
          <div className="flex items-center justify-around py-3">
            {/* Left Reel */}
            <motion.div
              animate={{ rotate: isPlaying || isRecording ? 360 : 0 }}
              transition={{
                repeat: Infinity,
                duration: Math.max(0.4, 2.5 / playbackSpeed),
                ease: 'linear',
              }}
              className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-neutral-700 bg-neutral-900 shadow-md"
            >
              {/* Spoke lines */}
              <div className="absolute h-full w-1 bg-neutral-700" />
              <div className="absolute h-1 w-full bg-neutral-700" />
              <div className="h-7 w-7 rounded-full border-2 border-amber-400/80 bg-neutral-800" />
            </motion.div>

            {/* Center Tape Window / Ribbon */}
            <div className="flex flex-col items-center justify-center px-4">
              <Disc className="h-6 w-6 text-amber-400/80 animate-pulse" />
              <span className="font-mono text-[9px] text-neutral-400 mt-1">STEREO</span>
            </div>

            {/* Right Reel */}
            <motion.div
              animate={{ rotate: isPlaying || isRecording ? 360 : 0 }}
              transition={{
                repeat: Infinity,
                duration: Math.max(0.4, 2.5 / playbackSpeed),
                ease: 'linear',
              }}
              className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-neutral-700 bg-neutral-900 shadow-md"
            >
              <div className="absolute h-full w-1 bg-neutral-700" />
              <div className="absolute h-1 w-full bg-neutral-700" />
              <div className="h-7 w-7 rounded-full border-2 border-amber-400/80 bg-neutral-800" />
            </motion.div>
          </div>
        </div>

        {/* Real-time Waveform Ribbon & Analog VU Indicator */}
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1 h-12 overflow-hidden rounded-lg border border-white/10 bg-black/40">
            <canvas ref={canvasRef} width={400} height={48} className="h-full w-full" />
          </div>

          {/* VU Level Needle Indicator */}
          <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 w-24 shrink-0">
            <span className="font-mono text-[9px] text-neutral-400">VU METER</span>
            <div className="mt-1 flex items-center gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-4 w-1 rounded-sm transition-all duration-75 ${
                    audioLevel > i * 0.12
                      ? i > 5
                        ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                        : 'bg-amber-400 shadow-[0_0_4px_#f59e0b]'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Physical Cassette Buttons Row */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex items-center gap-2">
            {/* Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                isRecording
                  ? 'border-rose-500 bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/40 animate-pulse'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              <Mic className="h-4 w-4" />
              <span>{isRecording ? 'STOP REC' : 'REC'}</span>
            </button>

            {/* Play / Pause Button */}
            <button
              onClick={togglePlayback}
              disabled={isRecording}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                isPlaying
                  ? 'border-amber-400 bg-amber-400 text-black shadow-md'
                  : 'border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-40'
              }`}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            {/* Rewind */}
            <button
              onClick={handleRewind}
              title="Rewind to Beginning"
              className="rounded-xl border border-white/15 bg-white/5 p-2 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="text-neutral-400 mr-1">SPEED:</span>
            {([0.5, 1.0, 1.5, 2.0] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  setPlaybackSpeed(spd);
                  soundEngine.playClick();
                  if (audioElementRef.current) audioElementRef.current.playbackRate = spd;
                }}
                className={`rounded px-2 py-1 transition-colors cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}

            <button
              onClick={() => {
                setIsMuted(!isMuted);
                soundEngine.playClick();
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="ml-1 p-1 rounded bg-white/5 text-neutral-400 hover:text-white cursor-pointer"
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tape Reel Library / Takes List */}
      <div className="flex-1 rounded-xl border border-white/10 bg-[#12141c] p-3 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 font-mono text-[11px] text-neutral-400">
          <span>CASSETTE RACK & MEMOS ({takes.length})</span>
          {savedAlert && (
            <span className="text-emerald-400 font-bold animate-pulse flex items-center gap-1">
              <Check className="h-3 w-3" /> Exported to /Music
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {takes.map((take, idx) => {
            const isSelected = selectedTakeIndex === idx;
            return (
              <div
                key={take.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedTakeIndex(idx);
                  setPlaybackTime(0);
                  if (isPlaying) {
                    setIsPlaying(false);
                    stopPresetSynth();
                  }
                }}
                className={`flex items-center justify-between rounded-lg border p-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400/40 bg-amber-400/10 text-white shadow-sm'
                    : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-md ${
                      take.isPreset
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : isSelected
                        ? 'bg-amber-400 text-black font-bold'
                        : 'bg-white/10 text-neutral-400'
                    }`}
                  >
                    {take.isPreset ? <Music className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <div className="font-mono text-xs font-semibold text-white">{take.name}</div>
                    <div className="font-mono text-[10px] text-neutral-400">
                      {take.timestamp} · {formatSeconds(take.durationSec)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {take.blobUrl && (
                    <a
                      href={take.blobUrl}
                      download={`${take.name}.webm`}
                      onClick={(e) => e.stopPropagation()}
                      title="Download to PC"
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const flowtapeManifest: AppManifest = {
  id: 'flowtape',
  name: 'Onyx Tape',
  description: 'Tactile cassette voice recorder and ambient tape deck with dual mechanical spools and VU meter.',
  category: 'media',
  icon: Mic,
  defaultSize: { width: 720, height: 560 },
  constraints: { minWidth: 540, minHeight: 460, maxWidth: 1040, maxHeight: 760 },
  allowMultipleInstances: false,
  permissions: ['audio', 'vfs:write'],
  component: FlowTapeApp,
};
