import { create } from 'zustand';

export type WidgetType = 'clock' | 'telemetry' | 'sticky' | 'weather' | 'media';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number };
  config?: Record<string, any>;
}

export interface WidgetCatalogItem {
  type: WidgetType;
  title: string;
  description: string;
  iconName: string;
  defaultWidth: number;
  defaultHeight: number;
}

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    type: 'clock',
    title: 'Flow Dot Clock',
    description: 'Minimalist typographic clock with seconds pulse and time zone',
    iconName: 'Clock',
    defaultWidth: 240,
    defaultHeight: 120,
  },
  {
    type: 'telemetry',
    title: 'Kernel Telemetry',
    description: 'Real-time CPU, RAM, windows, and filesystem inode counters',
    iconName: 'Activity',
    defaultWidth: 240,
    defaultHeight: 140,
  },
  {
    type: 'sticky',
    title: 'Desktop Sticky Note',
    description: 'Instant scratchpad directly on the desktop with color tags',
    iconName: 'StickyNote',
    defaultWidth: 240,
    defaultHeight: 180,
  },
  {
    type: 'weather',
    title: 'Ambient Weather',
    description: 'Live conditions, temperature, humidity, and forecast',
    iconName: 'CloudSun',
    defaultWidth: 240,
    defaultHeight: 140,
  },
  {
    type: 'media',
    title: 'Now Playing Widget',
    description: 'Compact music controller with live visualizer bars and playback controls',
    iconName: 'Music',
    defaultWidth: 240,
    defaultHeight: 130,
  },
];

export interface WidgetStoreState {
  widgets: WidgetInstance[];
  isWidgetsVisible: boolean;
  isDrawerOpen: boolean;
  toggleWidgetsVisibility: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  addWidget: (type: WidgetType, position?: { x: number; y: number }) => void;
  removeWidget: (id: string) => void;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
  updateConfig: (id: string, config: Record<string, any>) => void;
  resetDefaultWidgets: () => void;
}

const STORAGE_KEY = 'flowos_desktop_widgets_v1';

const DEFAULT_WIDGETS: WidgetInstance[] = [
  {
    id: 'widget-default-clock',
    type: 'clock',
    title: 'Flow Clock',
    position: { x: 32, y: 56 },
  },
  {
    id: 'widget-default-telemetry',
    type: 'telemetry',
    title: 'Kernel Telemetry',
    position: { x: 32, y: 210 },
  },
  {
    id: 'widget-default-sticky',
    type: 'sticky',
    title: 'Quick Scratchpad',
    position: { x: 32, y: 390 },
    config: {
      content: '⚡ Welcome to FlowOS!\n• Press Ctrl+K for Spotlight\n• Drag widgets anywhere on desktop\n• Right click desktop for more',
      color: 'amber',
    },
  },
];

function loadSavedWidgets(): WidgetInstance[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load saved widgets from localStorage', e);
  }
  return DEFAULT_WIDGETS;
}

function persistWidgets(widgets: WidgetInstance[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  } catch (e) {
    console.error('Failed to persist widgets', e);
  }
}

export const useWidgetStore = create<WidgetStoreState>((set, get) => ({
  widgets: loadSavedWidgets(),
  isWidgetsVisible: true,
  isDrawerOpen: false,

  toggleWidgetsVisibility: () => {
    set((state) => ({ isWidgetsVisible: !state.isWidgetsVisible }));
  },

  openDrawer: () => {
    set({ isDrawerOpen: true });
  },

  closeDrawer: () => {
    set({ isDrawerOpen: false });
  },

  addWidget: (type: WidgetType, position) => {
    const catalogItem = WIDGET_CATALOG.find((c) => c.type === type);
    const existing = get().widgets;
    const count = existing.filter((w) => w.type === type).length;
    
    // Auto calculate stagger position if not provided
    const defaultPos = position ?? {
      x: 32 + (existing.length % 3) * 260,
      y: 56 + Math.floor(existing.length / 3) * 200,
    };

    const newWidget: WidgetInstance = {
      id: `widget-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      title: count > 0 ? `${catalogItem?.title ?? type} ${count + 1}` : (catalogItem?.title ?? type),
      position: defaultPos,
      config: type === 'sticky' ? { content: 'New note...', color: 'slate' } : {},
    };

    const nextWidgets = [...existing, newWidget];
    set({ widgets: nextWidgets });
    persistWidgets(nextWidgets);
  },

  removeWidget: (id: string) => {
    const nextWidgets = get().widgets.filter((w) => w.id !== id);
    set({ widgets: nextWidgets });
    persistWidgets(nextWidgets);
  },

  updatePosition: (id: string, position: { x: number; y: number }) => {
    const nextWidgets = get().widgets.map((w) =>
      w.id === id ? { ...w, position } : w
    );
    set({ widgets: nextWidgets });
    persistWidgets(nextWidgets);
  },

  updateConfig: (id: string, config: Record<string, any>) => {
    const nextWidgets = get().widgets.map((w) =>
      w.id === id ? { ...w, config: { ...(w.config ?? {}), ...config } } : w
    );
    set({ widgets: nextWidgets });
    persistWidgets(nextWidgets);
  },

  resetDefaultWidgets: () => {
    set({ widgets: DEFAULT_WIDGETS });
    persistWidgets(DEFAULT_WIDGETS);
  },
}));
