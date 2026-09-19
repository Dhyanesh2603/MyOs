import React, { useState } from 'react';
import { StickyNote, Palette } from 'lucide-react';
import { useWidgetStore } from '@core/widgets/widgetStore';

interface StickyNoteWidgetProps {
  id: string;
  initialContent?: string;
  initialColor?: string;
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; header: string }> = {
  amber: {
    bg: 'bg-amber-500/15 backdrop-blur-md',
    border: 'border-amber-500/30 hover:border-amber-500/50',
    text: 'text-amber-100 placeholder-amber-400/50',
    header: 'text-amber-300',
  },
  emerald: {
    bg: 'bg-emerald-500/15 backdrop-blur-md',
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    text: 'text-emerald-100 placeholder-emerald-400/50',
    header: 'text-emerald-300',
  },
  sky: {
    bg: 'bg-sky-500/15 backdrop-blur-md',
    border: 'border-sky-500/30 hover:border-sky-500/50',
    text: 'text-sky-100 placeholder-sky-400/50',
    header: 'text-sky-300',
  },
  rose: {
    bg: 'bg-rose-500/15 backdrop-blur-md',
    border: 'border-rose-500/30 hover:border-rose-500/50',
    text: 'text-rose-100 placeholder-rose-400/50',
    header: 'text-rose-300',
  },
  slate: {
    bg: 'bg-surface-panel/85 backdrop-blur-md',
    border: 'border-border-subtle hover:border-border-strong',
    text: 'text-content-primary placeholder-content-tertiary',
    header: 'text-content-secondary',
  },
};

const COLOR_KEYS = Object.keys(COLOR_MAP);

export const StickyNoteWidget: React.FC<StickyNoteWidgetProps> = ({
  id,
  initialContent = '',
  initialColor = 'amber',
}) => {
  const [content, setContent] = useState(initialContent);
  const [color, setColor] = useState(initialColor);
  const updateConfig = useWidgetStore((state) => state.updateConfig);

  const style = COLOR_MAP[color] ?? COLOR_MAP['amber']!;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    updateConfig(id, { content: val, color });
  };

  const handleCycleColor = () => {
    const nextIdx = (COLOR_KEYS.indexOf(color) + 1) % COLOR_KEYS.length;
    const nextColor = COLOR_KEYS[nextIdx]!;
    setColor(nextColor);
    updateConfig(id, { content, color: nextColor });
  };

  return (
    <div
      className={`flex w-64 flex-col rounded-xl border p-3.5 shadow-lg select-none transition-all ${style.bg} ${style.border}`}
    >
      <div className="flex items-center justify-between pb-1.5">
        <div className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${style.header}`}>
          <StickyNote className="h-3 w-3" />
          <span>STICKY NOTE</span>
        </div>
        <button
          onClick={handleCycleColor}
          title="Change note color"
          className="rounded p-1 text-content-tertiary hover:bg-surface-hover hover:text-content-primary transition-colors"
        >
          <Palette className="h-3 w-3" />
        </button>
      </div>

      <textarea
        value={content}
        onChange={handleTextChange}
        placeholder="Type a quick note..."
        rows={4}
        className={`mt-1.5 w-full resize-none bg-transparent font-mono text-xs leading-relaxed outline-none select-text ${style.text}`}
      />
    </div>
  );
};
