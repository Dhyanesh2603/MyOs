/**
 * Onyx OS Notification Contracts
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
  appId?: string;
  action?: NotificationAction;
}

export interface ToastOptions {
  title: string;
  message: string;
  type?: NotificationType;
  durationMs?: number;
  appId?: string;
  action?: NotificationAction;
}
