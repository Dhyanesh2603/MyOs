import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Clock,
  Activity,
  StickyNote,
  CloudSun,
  Music,
  RotateCcw,
} from 'lucide-react';
import { useWidgetStore, WIDGET_CATALOG } from '@core/widgets/widgetStore';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  Activity,
  StickyNote,
  CloudSun,
  Music,
};

export const WidgetDrawer: React.FC = () => {
  const { isDrawerOpen, closeDrawer, addWidget, resetDefaultWidgets } = useWidgetStore();

  if (!isDrawerOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[8000] flex items-end justify-center bg-black/40 backdrop-blur-sm pointer-events-auto">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 240 }}
          className="mb-6 flex w-full max-w-2xl flex-col rounded-2xl border border-border-subtle bg-surface-panel/95 p-5 shadow-2xl backdrop-blur-xl text-content-primary"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-content-primary">
                Desktop Widgets Gallery
              </h2>
              <p className="text-[11px] text-content-tertiary">
                Choose tactile widgets to pin and position anywhere on your FlowOS desktop.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetDefaultWidgets}
                className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-1 text-[11px] font-medium text-content-secondary hover:bg-surface-hover hover:text-content-primary transition-colors"
                title="Reset widgets to defaults"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
              <button
                onClick={closeDrawer}
                className="rounded-lg p-1 text-content-tertiary hover:bg-surface-hover hover:text-content-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Widget Cards Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 max-h-[380px] overflow-y-auto pr-1">
            {WIDGET_CATALOG.map((item) => {
              const Icon = ICON_MAP[item.iconName] ?? Clock;
              return (
                <div
                  key={item.type}
                  className="group flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-subtle/50 p-3.5 hover:border-border-strong hover:bg-surface-subtle transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-panel border border-border-subtle text-accent">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-content-tertiary">
                        {item.defaultWidth}x{item.defaultHeight}
                      </span>
                    </div>

                    <h3 className="mt-2 text-xs font-semibold text-content-primary">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-content-tertiary">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      addWidget(item.type);
                      closeDrawer();
                    }}
                    className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-surface-panel border border-border-subtle py-1.5 text-xs font-medium text-content-primary shadow-sm hover:bg-accent hover:text-accent-fg hover:border-accent transition-all active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add to Desktop</span>
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
