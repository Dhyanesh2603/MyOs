import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Disc3 } from 'lucide-react';
import { useMediaStore } from '@core/media/mediaStore';

interface MediaWidgetProps {
  id?: string;
}

export const MediaWidget: React.FC<MediaWidgetProps> = () => {
  const { tracks, currentTrackIndex, isPlaying, togglePlay, nextTrack, prevTrack } = useMediaStore();
  const track = tracks[currentTrackIndex] ?? tracks[0];

  return (
    <div className="flex w-64 flex-col rounded-xl border border-border-subtle bg-surface-panel/85 p-3.5 shadow-lg backdrop-blur-md text-content-primary select-none transition-all hover:border-border-strong">
      <div className="flex items-center justify-between pb-1.5">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-content-secondary">
          <Disc3 className={`h-3.5 w-3.5 text-accent ${isPlaying && track ? 'animate-spin' : ''}`} />
          <span>NOW PLAYING</span>
        </div>

        {/* Live Audio Visualizer Equalizer bars */}
        <div className="flex items-end gap-0.5 h-3">
          <span className={`w-0.5 rounded-full bg-accent ${isPlaying && track ? 'h-3 animate-pulse' : 'h-1'}`} />
          <span className={`w-0.5 rounded-full bg-accent ${isPlaying && track ? 'h-2 animate-bounce' : 'h-1'}`} />
          <span className={`w-0.5 rounded-full bg-accent ${isPlaying && track ? 'h-3.5 animate-pulse' : 'h-1'}`} />
          <span className={`w-0.5 rounded-full bg-accent ${isPlaying && track ? 'h-1.5 animate-bounce' : 'h-1'}`} />
        </div>
      </div>

      <div className="mt-1 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-subtle border border-border-subtle text-accent">
          <Disc3 className={`h-6 w-6 ${isPlaying && track ? 'animate-spin' : ''}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-content-primary">
            {track ? track.title : 'No track loaded'}
          </div>
          <div className="truncate text-[10px] text-content-tertiary">
            {track ? track.artist : 'Playback idle'}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 border-t border-border-subtle pt-2">
        <button
          onClick={() => {
            if (track) prevTrack();
          }}
          disabled={!track}
          className="rounded p-1 text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-40"
          title="Previous Track"
        >
          <SkipBack className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => {
            if (track) togglePlay();
          }}
          disabled={!track}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-fg shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
        </button>
        <button
          onClick={() => {
            if (track) nextTrack();
          }}
          disabled={!track}
          className="rounded p-1 text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors disabled:opacity-40"
          title="Next Track"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
