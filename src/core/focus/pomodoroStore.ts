import { create } from 'zustand';
import { soundEngine } from '@core/audio/soundEngine';
import { useNotificationStore } from '@core/notifications/notificationStore';

export type PomodoroMode = 'focus' | 'break' | 'long_break';

interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  cyclesCompleted: number;
  showPopover: boolean;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  setMode: (mode: PomodoroMode) => void;
  togglePopover: () => void;
  setShowPopover: (show: boolean) => void;
  tick: () => void;
}

const DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  break: 5 * 60,
  long_break: 15 * 60,
};

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: 'focus',
  timeLeft: DURATIONS.focus,
  isRunning: false,
  cyclesCompleted: 0,
  showPopover: false,

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  toggle: () => set((s) => ({ isRunning: !s.isRunning })),

  reset: () => {
    const currentMode = get().mode;
    set({
      timeLeft: DURATIONS[currentMode],
      isRunning: false,
    });
  },

  setMode: (mode: PomodoroMode) => {
    set({
      mode,
      timeLeft: DURATIONS[mode],
      isRunning: false,
    });
  },

  togglePopover: () => set((s) => ({ showPopover: !s.showPopover })),
  setShowPopover: (show: boolean) => set({ showPopover: show }),

  tick: () => {
    const { timeLeft, isRunning, mode, cyclesCompleted } = get();
    if (!isRunning) return;

    if (timeLeft <= 1) {
      // Session finished!
      soundEngine.playSnap();
      if (mode === 'focus') {
        const nextCycles = cyclesCompleted + 1;
        const nextMode = nextCycles % 4 === 0 ? 'long_break' : 'break';
        useNotificationStore.getState().notify({
          title: '🍅 Focus Block Finished!',
          message: `Great job! Take a ${nextMode === 'long_break' ? '15-min long' : '5-min'} break.`,
          type: 'success',
        });
        set({
          mode: nextMode,
          timeLeft: DURATIONS[nextMode],
          isRunning: false,
          cyclesCompleted: nextCycles,
        });
      } else {
        useNotificationStore.getState().notify({
          title: '⚡ Break Finished!',
          message: 'Ready for another 25-minute focus session?',
          type: 'info',
        });
        set({
          mode: 'focus',
          timeLeft: DURATIONS.focus,
          isRunning: false,
        });
      }
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },
}));
