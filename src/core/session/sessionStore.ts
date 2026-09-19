import { create } from 'zustand';

export interface SessionStoreState {
  isLocked: boolean;
  userName: string;
  pinCode: string;
  lock: () => void;
  unlock: (pin?: string) => boolean;
  setPinCode: (newPin: string) => void;
}

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  isLocked: false,
  userName: 'Dhyanesh',
  pinCode: '1234',

  lock: () => set({ isLocked: true }),

  unlock: (pin?: string) => {
    // If no pin provided or pin matches, unlock
    if (!pin || pin === get().pinCode) {
      set({ isLocked: false });
      return true;
    }
    return false;
  },

  setPinCode: (newPin) => set({ pinCode: newPin }),
}));

// Listen to custom OS lock event from TopMenuBar or CommandPalette
if (typeof window !== 'undefined') {
  window.addEventListener('flowos:lock', () => {
    useSessionStore.getState().lock();
  });
}
