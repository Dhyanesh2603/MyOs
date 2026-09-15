import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificationStore } from '@core/notifications/notificationStore';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import type { NotificationType } from '@contracts/notification';

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const TYPE_STYLES: Record<NotificationType, string> = {
  success: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20',
  warning: 'text-amber-400 border-amber-500/20 bg-amber-950/20',
  error: 'text-rose-400 border-rose-500/20 bg-rose-950/20',
  info: 'text-accent-primary border-accent-primary/20 bg-accent-muted/20',
};

export const NotificationToaster: React.FC = () => {
  const { toasts, dismissToast } = useNotificationStore();

  return (
    <div
      aria-live="polite"
      aria-label="System Notifications"
      className="pointer-events-none fixed top-4 right-4 z-[9990] flex w-80 flex-col gap-2"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-white/10 bg-surface-panel/90 p-3.5 shadow-2xl backdrop-blur-window text-xs text-content-primary"
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                  TYPE_STYLES[toast.type]
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="font-semibold text-content-primary tracking-tight">
                  {toast.title}
                </div>
                <div className="text-[11px] leading-relaxed text-content-secondary">
                  {toast.message}
                </div>

                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      dismissToast(toast.id);
                    }}
                    className="mt-1.5 rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-content-primary hover:bg-white/20 transition-colors"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss Notification"
                className="rounded p-1 text-content-tertiary hover:bg-white/10 hover:text-content-primary transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
