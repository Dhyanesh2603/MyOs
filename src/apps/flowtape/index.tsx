import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  Disc,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Check,
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
}

export const FlowTapeApp: React.FC<AppProps> = () => {
  const writeFile = useVFSStore((s) => s.writeFile);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [takes, setTakes] = useState<VoiceTake[]>([]);
  const [selectedTakeIndex, setSelectedTakeIndex] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0); // 0 to 1 for VU meter
  const [isMuted, setIsMuted] = useState(false);
  const [savedAlert, setSavedAlert] = useState<string | null>(null);

  // Audio / MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const durationTimerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize Web Audio Context for VU meter & waveform
  const initAudioEngine = useCallback(async () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

      ctx.fillStyle = '#0e1014';
      ctx.fillRect(0, 0, w, h);

      // Draw horizontal grid lines
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

        // Calculate average for VU meter
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
          const barHeight = val * h * 0.9;
          const gradient = ctx.createLinearGradient(0, h - barHeight, 0, h);
          gradient.addColorStop(0, '#f97316');
          gradient.addColorStop(1, '#ea580c');
          ctx.fillStyle = gradient;
          ctx.fillRect(x, (h - barHeight) / 2, barWidth - 1, barHeight);
          x += barWidth;
        }
      } else {
        // Idle gentle breathing line
        setAudioLevel(0.04);
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [initAudioEngine, isRecording, isPlaying]);

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
            name: `Voice Memo ${takes.length + 1}`,
            blobUrl,
            durationSec: recordDuration,
            timestamp: new Date().toLocaleTimeString(),
          };
          setTakes((prev) => [newTake, ...prev]);
          setSelectedTakeIndex(0);

          // Auto save to VFS
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
    } catch (err) {
      console.warn('Microphone not accessible, using simulated tape recording:', err);
      // Simulated recording mode
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
      // Simulated take fallback
      const simulatedTake: VoiceTake = {
        id: `Take_${Date.now()}`,
        name: `Voice Memo ${takes.length + 1}`,
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

  // Playback Active Take
  const activeTake = takes[selectedTakeIndex];

  const togglePlayback = () => {
    soundEngine.playClick();
    if (!activeTake) return;

    if (isPlaying) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (activeTake.blobUrl) {
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
        setIsPlaying(true);
      } else {
        // Simulated playback
        setIsPlaying(true);
        let time = 0;
        const interval = setInterval(() => {
          time += 1;
          setPlaybackTime(time);
          if (time >= activeTake.durationSec) {
            clearInterval(interval);
            setIsPlaying(false);
            setPlaybackTime(0);
          }
        }, 1000 / playbackSpeed);
      }
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#141518] text-neutral-200 select-none overflow-y-auto font-sans p-4">
      {/* Top Header Bar: Teenage Engineering Cassette Aesthetic */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-black font-black text-xs shadow-md">
            TP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-wider text-white">
                FLOW TAPE RECORDER
              </span>
              <span className="rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-orange-400 border border-orange-500/30">
                MAGNETIC V2.4
              </span>
            </div>
            <div className="font-mono text-[10px] text-neutral-400">
              TACTILE VOICE MEMO CASSETTE DECK
            </div>
          </div>
        </div>

        {/* Speed Modifier Buttons */}
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] text-neutral-400 mr-1">TAPE SPEED:</span>
          {([0.5, 1.0, 1.5, 2.0] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => {
                soundEngine.playClick();
                setPlaybackSpeed(spd);
                if (audioElementRef.current) {
                  audioElementRef.current.playbackRate = spd;
                }
              }}
              className={`rounded px-2 py-1 font-mono text-[10px] transition-colors ${
                playbackSpeed === spd
                  ? 'bg-orange-500 text-black font-bold shadow'
                  : 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Cassette Deck Bay */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
        {/* Physical Cassette Compartment */}
        <div className="md:col-span-8 flex flex-col justify-between rounded-2xl border border-white/15 bg-gradient-to-b from-[#1b1c21] to-[#121316] p-4 shadow-2xl relative overflow-hidden">
          {/* Cassette Shell Visual */}
          <div className="relative flex h-40 w-full items-center justify-between rounded-xl border border-white/10 bg-[#0d0e11] px-8 py-4 shadow-inner">
            {/* Left Tape Spool */}
            <motion.div
              animate={{ rotate: isRecording || isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 2 / playbackSpeed, ease: 'linear' }}
              className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-neutral-700 bg-neutral-900 shadow-md"
            >
              {/* Spoke Teeth */}
              <div className="absolute h-full w-2 bg-neutral-700 rounded" />
              <div className="absolute h-2 w-full bg-neutral-700 rounded" />
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-black">
                <Disc className="h-5 w-5 text-neutral-500" />
              </div>
            </motion.div>

            {/* Center Cassette Window & Ribbon Visualizer */}
            <div className="flex flex-1 flex-col items-center justify-center px-4 max-w-[50%]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] font-bold tracking-wider text-orange-400">
                  {isRecording ? '● RECORDING' : isPlaying ? '▶ PLAYING' : 'IDLE'}
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  {formatSeconds(isRecording ? recordDuration : playbackTime)}
                </span>
              </div>
              <canvas
                ref={canvasRef}
                width={200}
                height={55}
                className="w-full h-14 rounded-lg border border-orange-950/60 bg-[#0a0c0f]"
              />
            </div>

            {/* Right Tape Spool */}
            <motion.div
              animate={{ rotate: isRecording || isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 2 / playbackSpeed, ease: 'linear' }}
              className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-neutral-700 bg-neutral-900 shadow-md"
            >
              <div className="absolute h-full w-2 bg-neutral-700 rounded" />
              <div className="absolute h-2 w-full bg-neutral-700 rounded" />
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-black">
                <Disc className="h-5 w-5 text-neutral-500" />
              </div>
            </motion.div>
          </div>

          {/* Transport Controls Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-3">
            <div className="flex items-center gap-2">
              {/* Record Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all shadow-lg ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-[#d71921] text-white hover:bg-rose-600'
                }`}
              >
                {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
                <span>{isRecording ? 'STOP REC' : 'RECORD'}</span>
              </button>

              {/* Play / Pause Button */}
              <button
                onClick={togglePlayback}
                disabled={isRecording || !activeTake}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all disabled:opacity-40 shadow-lg ${
                  isPlaying
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>
            </div>

            {/* Timecode Readout */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="font-mono text-sm font-bold text-white tracking-widest">
                {formatSeconds(isRecording ? recordDuration : playbackTime)}
              </span>
              <span className="font-mono text-[10px] text-neutral-400">
                / {formatSeconds(activeTake?.durationSec ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Tactical VU Needle Meter Panel */}
        <div className="md:col-span-4 flex flex-col justify-between rounded-2xl border border-white/15 bg-[#17181d] p-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold tracking-wider text-white">
                ANALOG VU METER
              </span>
              <span className="font-mono text-[9px] text-orange-400">PEAK dB</span>
            </div>

            {/* Backlit Analog Meter Frame */}
            <div className="relative flex h-28 w-full flex-col justify-end overflow-hidden rounded-xl border border-amber-900/40 bg-gradient-to-b from-[#261e12] to-[#120f08] p-3 shadow-inner">
              {/* Meter Dial Arc Numbers */}
              <div className="flex justify-between px-2 font-mono text-[9px] text-amber-300/70 font-semibold">
                <span>-20</span>
                <span>-10</span>
                <span>-3</span>
                <span>0</span>
                <span className="text-rose-400">+3</span>
              </div>

              {/* Needle Pivot & Swinging Needle */}
              <div className="relative mx-auto mt-2 h-14 w-full">
                <motion.div
                  animate={{
                    rotate: -45 + Math.min(1, audioLevel * 1.6) * 90,
                  }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                  className="absolute bottom-0 left-1/2 h-16 w-0.5 origin-bottom -translate-x-1/2 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                />
                <div className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border border-neutral-700 bg-neutral-900 shadow-md" />
              </div>
            </div>
          </div>

          {/* Save Status Alert */}
          {savedAlert && (
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-2 font-mono text-[10px] text-emerald-400">
              <Check className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Saved to Music/{savedAlert}</span>
            </div>
          )}

          {/* Volume Mute Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[10px] text-neutral-400">
            <span>MONITOR AUDIO</span>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="rounded p-1 text-neutral-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Takes History Drawer */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-orange-400" />
            <span className="font-mono text-xs font-bold tracking-wider text-white">
              RECORDED SESSIONS & TAKES ({takes.length})
            </span>
          </div>
          <span className="font-mono text-[9px] text-neutral-400">
            AUDIO STORED IN VFS /home/user/Music
          </span>
        </div>

        {takes.length === 0 ? (
          <div className="flex flex-1 items-center justify-center font-mono text-xs text-neutral-500 py-6">
            NO VOICE MEMOS RECORDED YET. PRESS "RECORD" TO START.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {takes.map((take, idx) => (
              <div
                key={take.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedTakeIndex(idx);
                }}
                className={`flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer ${
                  selectedTakeIndex === idx
                    ? 'border-orange-500/50 bg-orange-500/10 text-white'
                    : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      selectedTakeIndex === idx
                        ? 'bg-orange-500 text-black'
                        : 'bg-white/10 text-neutral-400'
                    }`}
                  >
                    <Mic className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-semibold text-white">
                      {take.name}
                    </div>
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
                      title="Download audio"
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const flowtapeManifest: AppManifest = {
  id: 'flowtape',
  name: 'Flow Tape',
  description: 'Dieter Rams / Teenage Engineering cassette voice recorder with analog VU meter and waveform visualizer.',
  category: 'media',
  icon: Mic,
  defaultSize: { width: 680, height: 520 },
  constraints: { minWidth: 520, minHeight: 440, maxWidth: 960, maxHeight: 720 },
  allowMultipleInstances: false,
  permissions: ['audio', 'vfs:write'],
  component: FlowTapeApp,
};
