import { create } from 'zustand';
import { soundEngine } from '@core/audio/soundEngine';
import { useNotificationStore } from '@core/notifications/notificationStore';

export interface FlowDropDevice {
  id: string;
  name: string;
  type: 'laptop' | 'phone' | 'tablet' | 'desktop';
  os: string;
  avatarGlyph: string;
  angle: number; // in degrees for polar placement
  distance: number; // in px from center
  isOnline: boolean;
}

export interface PendingFile {
  name: string;
  size: number;
  type?: string;
  path?: string;
}

interface FlowDropState {
  isOpen: boolean;
  selectedFile: PendingFile | null;
  activeTransfer: {
    targetDeviceId: string;
    progress: number;
    status: 'sending' | 'completed';
  } | null;
  devices: FlowDropDevice[];

  openFlowDrop: (file?: PendingFile) => void;
  closeFlowDrop: () => void;
  selectFile: (file: PendingFile | null) => void;
  sendToDevice: (deviceId: string) => Promise<void>;
}

const DEFAULT_DEVICES: FlowDropDevice[] = [
  {
    id: 'device-mbp',
    name: 'MacBook Pro 16"',
    type: 'laptop',
    os: 'macOS Sequoia',
    avatarGlyph: '💻',
    angle: 310,
    distance: 120,
    isOnline: true,
  },
  {
    id: 'device-nothing',
    name: 'Nothing Phone (2)',
    type: 'phone',
    os: 'Nothing OS 2.6',
    avatarGlyph: '📱',
    angle: 40,
    distance: 135,
    isOnline: true,
  },
  {
    id: 'device-ipad',
    name: 'iPad Pro M4',
    type: 'tablet',
    os: 'iPadOS 18',
    avatarGlyph: '📟',
    angle: 150,
    distance: 125,
    isOnline: true,
  },
  {
    id: 'device-studio',
    name: 'AirBridge Host PC',
    type: 'desktop',
    os: 'Onyx Relay',
    avatarGlyph: '🖥️',
    angle: 215,
    distance: 140,
    isOnline: true,
  },
];

export const useFlowDropStore = create<FlowDropState>((set, get) => ({
  isOpen: false,
  selectedFile: null,
  activeTransfer: null,
  devices: DEFAULT_DEVICES,

  openFlowDrop: (file) => {
    soundEngine.playClick();
    set({
      isOpen: true,
      selectedFile: file ?? {
        name: 'Onyx_Document.pdf',
        size: 1024 * 480,
      },
      activeTransfer: null,
    });
  },

  closeFlowDrop: () => {
    soundEngine.playClick();
    set({ isOpen: false, activeTransfer: null });
  },

  selectFile: (file) => {
    set({ selectedFile: file });
  },

  sendToDevice: async (deviceId: string) => {
    const device = get().devices.find((d) => d.id === deviceId);
    if (!device) return;

    soundEngine.playClick();
    set({
      activeTransfer: {
        targetDeviceId: deviceId,
        progress: 10,
        status: 'sending',
      },
    });

    // Simulate progressive transmission beam
    for (let p = 25; p <= 100; p += 25) {
      await new Promise((res) => setTimeout(res, 260));
      set((state) => ({
        activeTransfer: state.activeTransfer
          ? { ...state.activeTransfer, progress: p }
          : null,
      }));
    }

    // Completion state
    set((state) => ({
      activeTransfer: state.activeTransfer
        ? { ...state.activeTransfer, progress: 100, status: 'completed' }
        : null,
    }));

    soundEngine.playSnap();
    useNotificationStore.getState().notify({
      title: 'FlowDrop Delivered',
      message: `Sent "${get().selectedFile?.name ?? 'file'}" to ${device.name}`,
      type: 'success',
    });

    // Reset after 2.5s
    setTimeout(() => {
      set({ activeTransfer: null });
    }, 2500);
  },
}));
