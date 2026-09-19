import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, GripHorizontal } from 'lucide-react';
import { useWidgetStore, type WidgetInstance } from '@core/widgets/widgetStore';
import { ClockWidget } from './ClockWidget';
import { SystemStatsWidget } from './SystemStatsWidget';
import { StickyNoteWidget } from './StickyNoteWidget';
import { WeatherWidget } from './WeatherWidget';
import { MediaWidget } from './MediaWidget';
import { WidgetDrawer } from './WidgetDrawer';

export const DesktopWidgets: React.FC = () => {
  const { widgets, isWidgetsVisible, removeWidget, updatePosition } = useWidgetStore();

  if (!isWidgetsVisible) {
    return <WidgetDrawer />;
  }

  const renderWidgetContent = (widget: WidgetInstance) => {
    switch (widget.type) {
      case 'clock':
        return <ClockWidget />;
      case 'telemetry':
        return <SystemStatsWidget />;
      case 'sticky':
        return (
          <StickyNoteWidget
            id={widget.id}
            initialContent={widget.config?.content as string | undefined}
            initialColor={widget.config?.color as string | undefined}
          />
        );
      case 'weather':
        return <WeatherWidget id={widget.id} />;
      case 'media':
        return <MediaWidget id={widget.id} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-[15] overflow-hidden">
        <AnimatePresence>
          {widgets.map((widget) => (
            <motion.div
              key={widget.id}
              drag
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: widget.position.x,
                y: widget.position.y,
              }}
              exit={{ opacity: 0, scale: 0.85 }}
              onDragEnd={(_, info) => {
                updatePosition(widget.id, {
                  x: Math.max(8, widget.position.x + info.offset.x),
                  y: Math.max(40, widget.position.y + info.offset.y),
                });
              }}
              className="group absolute top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            >
              {/* Widget Header Strip with Drag Grip and Delete */}
              <div className="relative">
                <div className="absolute -top-3 right-1 hidden items-center gap-1 rounded-md border border-border-subtle bg-surface-panel/90 px-1.5 py-0.5 shadow-sm backdrop-blur-md group-hover:flex z-10">
                  <GripHorizontal className="h-3 w-3 text-content-tertiary" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWidget(widget.id);
                    }}
                    className="rounded p-0.5 text-content-tertiary hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    title="Remove Widget"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>

                {renderWidgetContent(widget)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Widget Gallery Drawer */}
      <WidgetDrawer />
    </>
  );
};
