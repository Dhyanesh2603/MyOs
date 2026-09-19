import React, { useState } from 'react';
import { X, Sparkles, Plus, Globe } from 'lucide-react';
import { useCustomAppStore, WEB_APP_ICONS } from '@core/packages/customAppStore';
import { soundEngine } from '@core/audio/soundEngine';
import type { AppCategory } from '@contracts/app';

const PRESETS = [
  { name: 'Excalidraw', url: 'https://excalidraw.com', category: 'productivity' as AppCategory, icon: 'Palette', color: '#6366f1' },
  { name: 'GitHub', url: 'https://github.com', category: 'development' as AppCategory, icon: 'Code2', color: '#10b981' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', category: 'utilities' as AppCategory, icon: 'Compass', color: '#f59e0b' },
  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org', category: 'productivity' as AppCategory, icon: 'Globe', color: '#06b6d4' },
];

export const CreateWebAppModal: React.FC = () => {
  const { isCreateModalOpen, closeCreateModal, createWebApp } = useCustomAppStore();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AppCategory>('productivity');
  const [selectedIcon, setSelectedIcon] = useState('Globe');
  const [accentColor, setAccentColor] = useState('#6366f1');

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    createWebApp({
      name: name.trim(),
      url: finalUrl,
      description: description.trim() || `Web app for ${name}`,
      category,
      iconName: selectedIcon,
      accentColor,
    });

    setName('');
    setUrl('');
    setDescription('');
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    soundEngine.playClick();
    setName(preset.name);
    setUrl(preset.url);
    setCategory(preset.category);
    setSelectedIcon(preset.icon);
    setAccentColor(preset.color);
  };

  return (
    <div
      onClick={closeCreateModal}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-panel p-5 shadow-2xl backdrop-blur-2xl text-content-primary animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle/80 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Package Web App (PWA)</h2>
              <p className="text-[10px] text-content-tertiary">
                Convert any website or local URL into a native FlowOS window
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              closeCreateModal();
            }}
            className="rounded p-1 text-content-tertiary hover:bg-surface-subtle hover:text-content-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center gap-1 font-mono text-[10px] text-content-tertiary">
            <Sparkles className="h-3 w-3 text-accent-primary" />
            <span>Popular Presets:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-lg border border-border-subtle bg-surface-card/60 px-2 py-1 text-[11px] text-content-secondary hover:border-accent-primary hover:text-content-primary transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-content-secondary mb-1">
              Application Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Excalidraw, Figma, Spotify"
              className="w-full rounded-xl border border-border-subtle bg-surface-card px-3 py-1.5 text-xs text-content-primary placeholder:text-content-tertiary focus:border-accent-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-content-secondary mb-1">
              Web Address / URL *
            </label>
            <div className="relative flex items-center">
              <Globe className="absolute left-3 h-3.5 w-3.5 text-content-tertiary" />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-border-subtle bg-surface-card pl-9 pr-3 py-1.5 text-xs text-content-primary placeholder:text-content-tertiary focus:border-accent-primary outline-none"
              />
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-[11px] font-medium text-content-secondary mb-1">
              Select Icon
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {Object.entries(WEB_APP_ICONS).map(([k, Icon]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedIcon(k);
                  }}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${
                    selectedIcon === k
                      ? 'border-accent-primary bg-accent-primary/20 text-accent-primary shadow-sm'
                      : 'border-border-subtle bg-surface-card text-content-tertiary hover:text-content-primary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-medium text-content-secondary mb-1">
              Category
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(['productivity', 'utilities', 'media', 'development'] as AppCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setCategory(cat);
                  }}
                  className={`rounded-lg py-1 text-[10px] font-medium capitalize border transition-all ${
                    category === cat
                      ? 'border-accent-primary bg-accent-primary text-white shadow-sm'
                      : 'border-border-subtle bg-surface-card text-content-tertiary hover:text-content-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4 pt-2 border-t border-border-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeCreateModal}
              className="rounded-xl border border-border-subtle px-3 py-1.5 text-xs text-content-secondary hover:bg-surface-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !url.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-accent-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Package & Install</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
