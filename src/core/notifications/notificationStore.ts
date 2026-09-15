import { create } from 'zustand';
import type {
  SystemNotification,
  ToastOptions,
} from '@contracts/notification';

export interface ActiveToast extends SystemNotification {
  expiresAt: number;
}

export interface NotificationStoreState {
  notifications: SystemNotification[];
  toasts: ActiveToast[];
  isCenterOpen: boolean;
  dndEnabled: boolean;

  notify: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  toggleCenter: () => void;
  toggleDnd: () => void;
  openCenter: () => void;
  closeCenter: () => void;
}

let notificationSeq = 0;

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  toasts: [],
  isCenterOpen: false,
  dndEnabled: false,

  notify: (options) => {
    notificationSeq += 1;
    const id = `notif-${Date.now()}-${notificationSeq}`;
    const timestamp = Date.now();
    const duration = options.durationMs ?? 4500;

    const notif: SystemNotification = {
      id,
      title: options.title,
      message: options.message,
      type: options.type ?? 'info',
      timestamp,
      read: false,
      appId: options.appId,
      action: options.action,
    };

    // If Do Not Disturb is enabled, record notification silently without popping toast
    if (get().dndEnabled) {
      set((state) => ({
        notifications: [notif, ...state.notifications],
      }));
      return id;
    }

    const toast: ActiveToast = {
      ...notif,
      expiresAt: timestamp + duration,
    };

    set((state) => ({
      notifications: [notif, ...state.notifications],
      toasts: [...state.toasts, toast],
    }));

    // Auto-dismiss toast timer
    setTimeout(() => {
      get().dismissToast(id);
    }, duration);

    return id;
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  clearAll: () => {
    set({
      notifications: [],
      toasts: [],
    });
  },

  toggleCenter: () => set((state) => ({ isCenterOpen: !state.isCenterOpen })),
  openCenter: () => set({ isCenterOpen: true }),
  closeCenter: () => set({ isCenterOpen: false }),
  toggleDnd: () => set((state) => ({ dndEnabled: !state.dndEnabled })),
}));
