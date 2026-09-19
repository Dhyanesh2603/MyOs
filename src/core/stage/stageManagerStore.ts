import { create } from 'zustand';
import { soundEngine } from '@core/audio/soundEngine';
import { useNotificationStore } from '@core/notifications/notificationStore';

interface StageManagerState {
  isEnabled: boolean;
  toggleStageManager: () => void;
  setEnabled: (enabled: boolean) => void;
}

export const useStageManagerStore = create<StageManagerState>((set, get) => ({
  isEnabled: false,

  toggleStageManager: () => {
    const nextState = !get().isEnabled;
    soundEngine.playSnap();
    useNotificationStore.getState().notify({
      title: nextState ? 'Stage Manager Active' : 'Stage Manager Disabled',
      message: nextState
        ? 'Background windows tucked into left stage strip. Press Alt+S to toggle.'
        : 'Restored standard floating multi-window workspace.',
      type: 'info',
    });
    set({ isEnabled: nextState });
  },

  setEnabled: (enabled) => set({ isEnabled: enabled }),
}));
