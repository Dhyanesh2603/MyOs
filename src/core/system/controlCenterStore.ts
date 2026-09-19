import { create } from 'zustand';

export interface ControlCenterState {
  isOpen: boolean;
  brightness: number; // 0.4 to 1.0
  isNightShift: boolean;
  isWifiEnabled: boolean;
  isBluetoothEnabled: boolean;
  isFocusMode: boolean; // Do Not Disturb
  isAirBridgeActive: boolean;

  toggleControlCenter: () => void;
  openControlCenter: () => void;
  closeControlCenter: () => void;
  setBrightness: (val: number) => void;
  toggleNightShift: () => void;
  toggleWifi: () => void;
  toggleBluetooth: () => void;
  toggleFocusMode: () => void;
  toggleAirBridge: () => void;
}

const STORAGE_KEY = 'flowos_control_center_state';

function loadSavedState(): Partial<ControlCenterState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load control center state', e);
  }
  return {};
}

function persistState(state: Partial<ControlCenterState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to persist control center state', e);
  }
}

export const useControlCenterStore = create<ControlCenterState>((set, get) => {
  const saved = loadSavedState();

  return {
    isOpen: false,
    brightness: saved.brightness ?? 1.0,
    isNightShift: saved.isNightShift ?? false,
    isWifiEnabled: saved.isWifiEnabled ?? true,
    isBluetoothEnabled: saved.isBluetoothEnabled ?? true,
    isFocusMode: saved.isFocusMode ?? false,
    isAirBridgeActive: saved.isAirBridgeActive ?? true,

    toggleControlCenter: () => {
      set((state) => ({ isOpen: !state.isOpen }));
    },

    openControlCenter: () => {
      set({ isOpen: true });
    },

    closeControlCenter: () => {
      set({ isOpen: false });
    },

    setBrightness: (val: number) => {
      const clamped = Math.max(0.35, Math.min(1.0, val));
      set({ brightness: clamped });
      persistState({ ...loadSavedState(), brightness: clamped });
    },

    toggleNightShift: () => {
      const next = !get().isNightShift;
      set({ isNightShift: next });
      persistState({ ...loadSavedState(), isNightShift: next });
    },

    toggleWifi: () => {
      const next = !get().isWifiEnabled;
      set({ isWifiEnabled: next });
      persistState({ ...loadSavedState(), isWifiEnabled: next });
    },

    toggleBluetooth: () => {
      const next = !get().isBluetoothEnabled;
      set({ isBluetoothEnabled: next });
      persistState({ ...loadSavedState(), isBluetoothEnabled: next });
    },

    toggleFocusMode: () => {
      const next = !get().isFocusMode;
      set({ isFocusMode: next });
      persistState({ ...loadSavedState(), isFocusMode: next });
    },

    toggleAirBridge: () => {
      const next = !get().isAirBridgeActive;
      set({ isAirBridgeActive: next });
      persistState({ ...loadSavedState(), isAirBridgeActive: next });
    },
  };
});
