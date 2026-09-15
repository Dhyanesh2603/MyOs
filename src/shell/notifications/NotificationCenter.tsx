import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { useThemeStore } from '@core/theme/themeStore';
import { useCommandStore } from '@core/command/commandStore';
import {
  Bell,
  BellOff,
  Sun,
  Moon,
  Search,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react';
import type { NotificationType } from '@contracts/notification';

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

export const NotificationCenter: React.FC = () => {
  const {
    isCenterOpen,
    notifications,
    dndEnabled,
    closeCenter,
    toggleDnd,
    clearAll,
  } = useNotificationStore();

  const { themeId, setTheme } = useThemeStore();
  const openSpotlight = useCommandStore((state) => state.open);

  const formatTimestamp = (time: number) => {
    const diffSec = Math.max(1, Math.floor((Date.now() - time) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
  };

  return (
    <AnimatePresence>
      {isCenterOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCenter}
            className="fixed inset-0 z-[9994] bg-black/30 backdrop-blur-[2px]"
          />

          {/* Slide-out Shade */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="fixed top-0 right-0 z-[9995] flex h-screen w-84 max-w-[90vw] flex-col border-l border-white/10 bg-surface-panel/95 p-5 shadow-2xl backdrop-blur-window text-content-primary"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent-primary" />
                <h3 className="font-semibold text-sm">Control Shade</h3>
              </div>
              <button
                onClick={closeCenter}
                aria-label="Close Shade"
                className="rounded-lg p-1 text-content-secondary hover:bg-white/10 hover:text-content-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Action Toggles */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={toggleDnd}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-[11px] font-medium transition-all ${
                  dndEnabled
                    ? 'border-accent-primary bg-accent-primary/20 text-content-primary'
                    : 'border-white/10 bg-white/5 text-content-secondary hover:bg-white/10'
                }`}
              >
                {dndEnabled ? (
                  <BellOff className="h-4 w-4 text-accent-primary" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                <span>{dndEnabled ? 'DND: On' : 'DND'}</span>
              </button>

              <button
                onClick={() => setTheme(themeId === 'dark' ? 'light' : 'dark')}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-[11px] font-medium text-content-secondary hover:bg-white/10 transition-colors"
              >
                {themeId === 'dark' ? (
                  <Moon className="h-4 w-4 text-amber-400" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-400" />
                )}
                <span>Theme</span>
              </button>

              <button
                onClick={() => {
                  closeCenter();
                  openSpotlight();
                }}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-[11px] font-medium text-content-secondary hover:bg-white/10 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>

            {/* Notification History Feed */}
            <div className="mt-6 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-content-tertiary">
                Notifications ({notifications.length})
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:underline font-mono"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1">
              {notifications.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-xs text-content-tertiary">
                  <Bell className="h-6 w-6 opacity-30" />
                  <span>No new notifications</span>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = ICONS[notif.type];
                  return (
                    <div
                      key={notif.id}
                      className="flex items-start gap-3 rounded-xl border border-white/5 bg-surface-overlay/50 p-3 text-xs"
                    >
                      <div className="mt-0.5 shrink-0 text-content-tertiary">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-content-primary">
                            {notif.title}
                          </span>
                          <span className="font-mono text-[9px] text-content-tertiary">
                            {formatTimestamp(notif.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-content-secondary leading-normal">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
