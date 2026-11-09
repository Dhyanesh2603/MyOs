import React, { useEffect, useRef, useState } from 'react';
import {
  Music as MusicIcon,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Disc,
  Upload,
  Radio,
  ListMusic,
  Trash2,
  Plus,
  X,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { audioEngine } from './audioEngine';
import { useMediaStore } from '@core/media/mediaStore';

const MusicApp: React.FC<AppProps> = ({ windowId }) => {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    volume,
    togglePlay,
    nextTrack,
    prevTrack,
    setTrack,
    setVolume,
    addTrack,
    removeTrack,
  } = useMediaStore();

  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTrack = tracks[currentTrackIndex] ?? tracks[0];

  const handleTogglePlay = () => {
    togglePlay();
  };

  const handleNext = () => {
    nextTrack();
  };

  const handlePrev = () => {
    prevTrack();
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      const objectUrl = URL.createObjectURL(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');

      addTrack({
        id: `track-upload-${Date.now()}-${i}`,
        title: cleanTitle,
        artist: 'Local Device Audio',
        audioUrl: objectUrl,
        durationSec: 0,
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) return;

    addTrack({
      id: `track-stream-${Date.now()}`,
      title: streamTitle.trim() || 'Internet Audio Stream',
      artist: 'Live Web Stream',
      audioUrl: streamUrl.trim(),
      durationSec: 0,
      isStream: true,
    });

    setStreamTitle('');
    setStreamUrl('');
    setIsStreamModalOpen(false);
  };

  // Canvas visualizer render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const analyser = audioEngine.getAnalyser();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!analyser || !isPlaying) {
        // Flatline idle wave
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.25)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (canvas.width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = ((dataArray[i] ?? 0) / 255) * canvas.height * 0.85;

        // Dynamic gradient for equalizer
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0.9)');

        ctx.fillStyle = gradient;
        ctx.fillRect(
          x,
          canvas.height - barHeight,
          barWidth - 2,
          barHeight
        );

        x += barWidth;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Clean up audio when window unmounts
  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col justify-between bg-[#08090d] p-5 text-neutral-100 select-none overflow-hidden relative">
      {/* Hidden File Input for Real Audio Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="audio/*,.mp3,.wav,.ogg,.aac,.flac,.m4a"
        multiple
        className="hidden"
      />

      {/* Top Header / Actions Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <MusicIcon className="h-4 w-4 text-white" />
          <span className="font-semibold text-xs tracking-wide text-white">Audio & Soundscape Engine</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
            title="Import audio files from your computer (MP3, WAV, FLAC, AAC)"
          >
            <Upload className="h-3 w-3" />
            <span>Open Audio</span>
          </button>

          <button
            onClick={() => setIsStreamModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
            title="Add custom radio stream URL"
          >
            <Radio className="h-3 w-3 text-emerald-400" />
            <span>Add Stream</span>
          </button>

          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer ${
              showPlaylist
                ? 'border-white/30 bg-white/15 text-white font-semibold'
                : 'border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white'
            }`}
            title="Toggle playlist"
          >
            <ListMusic className="h-3 w-3" />
            <span>Queue ({tracks.length})</span>
          </button>
        </div>
      </div>

      {showPlaylist ? (
        /* Playlist View */
        <div className="flex-1 my-3 overflow-y-auto rounded-2xl border border-white/10 bg-[#0e1017] p-2.5 flex flex-col gap-1.5 scrollbar-none no-scrollbar">
          <div className="text-[10px] font-mono uppercase text-neutral-400 px-2 py-1 font-semibold">
            Track Queue & Channels
          </div>
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center my-auto">
              <MusicIcon className="h-8 w-8 text-neutral-500 mb-2" />
              <p className="text-xs text-white font-medium">Playlist is empty</p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Click &quot;Open Audio&quot; or &quot;Add Stream&quot; above to add tracks.
              </p>
            </div>
          ) : (
            tracks.map((track, idx) => {
              const isCurrent = idx === currentTrackIndex;
              return (
                <div
                  key={track.id}
                  onClick={() => setTrack(idx)}
                  className={`group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-mono transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white/10 border border-white/15 text-white shadow-sm'
                      : 'hover:bg-white/[0.04] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-[10px] text-neutral-400 w-4">
                      {isCurrent && isPlaying ? '▶' : `${idx + 1}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate text-white">{track.title}</div>
                      <div className="text-[10px] text-neutral-400 truncate">{track.artist}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {track.isStream && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] text-emerald-400 border border-emerald-500/30 font-semibold">
                        LIVE
                      </span>
                    )}
                    {track.audioUrl && !track.isStream && (
                      <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] text-sky-400 border border-sky-500/30 font-semibold">
                        AUDIO
                      </span>
                    )}
                    {tracks.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTrack(track.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-400 transition-opacity cursor-pointer"
                        title="Remove from playlist"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Visualizer Canvas Card or Empty State */
        <div className="relative flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0f1118] my-3 p-4 overflow-hidden">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 select-none">
              <MusicIcon className="h-10 w-10 text-neutral-500 mb-3 animate-pulse" />
              <h4 className="text-sm font-semibold text-white">No Tracks in Queue</h4>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                Import MP3, WAV, or AAC audio files from your system or add an internet radio stream URL.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-black shadow hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 text-black" />
                  <span>Open Audio File</span>
                </button>
                <button
                  onClick={() => setIsStreamModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Radio className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Add Stream</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                width={440}
                height={130}
                className="w-full h-32 rounded-xl"
              />

              {/* Ambient Disc Glyph */}
              <div className="absolute top-4 right-4 flex items-center gap-2 text-neutral-400">
                <Disc
                  className={`h-5 w-5 text-white transition-transform duration-1000 ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Track Metadata */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5 min-w-0 flex-1 pr-3">
          <h3 className="font-semibold text-sm text-white truncate">
            {currentTrack ? currentTrack.title : 'No track loaded'}
          </h3>
          <p className="font-mono text-xs text-neutral-400 truncate">
            {currentTrack ? currentTrack.artist : 'Playback idle • Open an audio file or stream'}
          </p>
        </div>
        <span className="font-mono text-[10px] text-white bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full shrink-0 font-medium">
          {isPlaying ? (currentTrack?.isStream ? 'Streaming Live' : 'Playing') : 'Idle'}
        </span>
      </div>

      {/* Playback Controls & Volume */}
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="rounded-full p-2 text-neutral-300 hover:bg-white/10 hover:text-white active:scale-95 transition-all cursor-pointer"
            title="Previous Track"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-black" />
            ) : (
              <Play className="h-4 w-4 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNext}
            className="rounded-full p-2 text-neutral-300 hover:bg-white/10 hover:text-white active:scale-95 transition-all cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-neutral-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-24 accent-white cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono text-neutral-500">
        <span>win:{windowId.slice(-4)}</span>
        <span>HTML5 Audio + Web Audio FFT</span>
      </div>

      {/* Modal: Add Custom Stream */}
      {isStreamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#12141c] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-xs font-bold font-mono text-white">
                Add Internet Audio Stream
              </h3>
              <button
                onClick={() => setIsStreamModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddStream} className="mt-4 flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-neutral-400 uppercase text-[10px] font-semibold">Station Title</label>
                <input
                  type="text"
                  placeholder="e.g. Chillhop Radio Live"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#161824] px-3 py-2 text-white outline-none focus:border-white/30 placeholder:text-neutral-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 uppercase text-[10px] font-semibold">Stream URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://... stream link"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#161824] px-3 py-2 text-white outline-none focus:border-white/30 placeholder:text-neutral-500"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStreamModalOpen(false)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-neutral-300 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 font-bold text-black shadow-md hover:bg-neutral-200 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Station</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const musicManifest: AppManifest = {
  id: 'music',
  name: 'Music',
  description: 'Real audio player, live stream channels, and real-time canvas FFT visualizer.',
  category: 'media',
  icon: MusicIcon,
  defaultSize: { width: 540, height: 420 },
  constraints: { minWidth: 420, minHeight: 340, maxWidth: 800, maxHeight: 600 },
  allowMultipleInstances: false,
  permissions: ['audio'],
  component: MusicApp,
};
