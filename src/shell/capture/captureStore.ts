import { create } from 'zustand';
import { soundEngine } from '@core/audio/soundEngine';

export interface CaptureStoreState {
  isCapturing: boolean;
  capturedImageDataUrl: string | null;

  startCapture: () => void;
  cancelCapture: () => void;
  finishCapture: (dataUrl: string) => void;
  clearCapturedImage: () => void;
}

export const useCaptureStore = create<CaptureStoreState>((set) => ({
  isCapturing: false,
  capturedImageDataUrl: null,

  startCapture: () => {
    soundEngine.playClick();
    set({ isCapturing: true });
  },

  cancelCapture: () => {
    set({ isCapturing: false });
  },

  finishCapture: (dataUrl: string) => {
    soundEngine.playSnap();
    set({ isCapturing: false, capturedImageDataUrl: dataUrl });
  },

  clearCapturedImage: () => {
    set({ capturedImageDataUrl: null });
  },
}));
