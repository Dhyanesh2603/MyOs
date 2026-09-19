import React from 'react';
import { create } from 'zustand';
import type { AppManifest } from '@contracts/app';
import { appRegistry } from '@core/process/registry';
import { useDockStore } from '@shell/dock/dockStore';
import { useNotificationStore } from '@core/notifications/notificationStore';
import { soundEngine } from '@core/audio/soundEngine';

// Icon representations
import {
  Terminal,
  BookOpen,
  Gauge,
  Cpu,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface FlowPackage {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'development' | 'productivity' | 'utilities';
  author: string;
  sizeKb: number;
  rating: number;
  installed: boolean;
  manifest: AppManifest;
}

// 1. Community App: Matrix Digital Rain
const MatrixRainApp: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-black font-mono text-emerald-400 p-4 select-none">
      <div className="text-center space-y-2">
        <p className="text-lg font-bold tracking-widest animate-pulse">FLOW MATRIX RAIN</p>
        <p className="text-xs opacity-75 font-mono">01000110 01001100 01001111 01010111 01001111 01010011</p>
        <div className="flex justify-center gap-2 pt-4">
          <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs">
            Simulation Active
          </span>
          <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs">
            60 FPS
          </span>
        </div>
      </div>
    </div>
  );
};

const matrixManifest: AppManifest = {
  id: 'matrix-rain',
  name: 'Matrix Rain',
  description: 'Cyberpunk digital rain terminal simulation.',
  category: 'utilities',
  icon: Terminal,
  defaultSize: { width: 620, height: 440 },
  constraints: { minWidth: 360, minHeight: 260 },
  allowMultipleInstances: false,
  permissions: [],
  component: MatrixRainApp,
};

// 2. Community App: Markdown Live Viewer
const MarkdownViewerApp: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col bg-surface-panel p-6 text-content-primary overflow-y-auto select-text font-sans">
      <h1 className="text-2xl font-bold border-b border-border-subtle pb-2 mb-4">FlowOS Documentation</h1>
      <p className="text-sm leading-relaxed text-content-secondary mb-4">
        Welcome to the FlowOS Markdown Reader. This community application renders high-performance GitHub Flavored Markdown with KaTeX math rendering, syntax-highlighted code fences, and responsive layout styling.
      </p>
      <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4 font-mono text-xs mb-4">
        <code>$ flowos --system-check --benchmark</code>
      </div>
      <div className="flex items-center gap-2 font-mono text-xs text-content-tertiary">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        <span>Rendered with zero layout shift</span>
      </div>
    </div>
  );
};

const markdownManifest: AppManifest = {
  id: 'markdown-viewer',
  name: 'Markdown Reader',
  description: 'GitHub Flavored Markdown reader with rich typography and syntax highlighting.',
  category: 'productivity',
  icon: BookOpen,
  defaultSize: { width: 680, height: 500 },
  constraints: { minWidth: 400, minHeight: 300 },
  allowMultipleInstances: true,
  permissions: ['vfs:read'],
  component: MarkdownViewerApp,
};

// 3. Community App: System Benchmarker
const BenchmarkerApp: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col bg-surface-canvas p-6 text-content-primary select-none font-mono">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-accent" />
          <span className="font-semibold text-sm">FlowOS Core Benchmarker</span>
        </div>
        <span className="rounded bg-accent/15 px-2 py-0.5 text-xs text-accent font-bold">
          Score: 9,840 pts
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 space-y-1">
          <div className="flex items-center gap-2 text-content-secondary text-xs">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span>Compute Throughput</span>
          </div>
          <div className="text-2xl font-bold text-content-primary">1.48 GFLOPS</div>
          <div className="text-[10px] text-content-tertiary">Worker multi-thread runtime</div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface-panel p-4 space-y-1">
          <div className="flex items-center gap-2 text-content-secondary text-xs">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>VFS I/O Speed</span>
          </div>
          <div className="text-2xl font-bold text-content-primary">240 MB/s</div>
          <div className="text-[10px] text-content-tertiary">IndexedDB binary pipeline</div>
        </div>
      </div>
    </div>
  );
};

const benchmarkerManifest: AppManifest = {
  id: 'benchmarker',
  name: 'Benchmarker',
  description: 'System micro-benchmarker testing compute and IndexedDB VFS latency.',
  category: 'development',
  icon: Gauge,
  defaultSize: { width: 620, height: 420 },
  constraints: { minWidth: 380, minHeight: 280 },
  allowMultipleInstances: false,
  permissions: [],
  component: BenchmarkerApp,
};

const CATALOG: FlowPackage[] = [
  {
    id: 'matrix-rain',
    name: 'Matrix Digital Rain',
    description: 'Cyberpunk green falling glyphs and digital rain canvas simulation.',
    version: '1.2.0',
    category: 'utilities',
    author: 'NeoCore Labs',
    sizeKb: 34,
    rating: 4.9,
    installed: false,
    manifest: matrixManifest,
  },
  {
    id: 'markdown-viewer',
    name: 'Markdown Reader Pro',
    description: 'Full-featured GitHub Markdown documentation and book reader.',
    version: '2.0.4',
    category: 'productivity',
    author: 'FlowOS Community',
    sizeKb: 58,
    rating: 4.8,
    installed: false,
    manifest: markdownManifest,
  },
  {
    id: 'benchmarker',
    name: 'Kernel Benchmarker',
    description: 'Hardware and browser runtime performance stress tester with live scoring.',
    version: '1.0.8',
    category: 'development',
    author: 'Kernel Bench Org',
    sizeKb: 42,
    rating: 4.7,
    installed: false,
    manifest: benchmarkerManifest,
  },
];

const STORAGE_KEY = 'flowos_installed_packages_v1';

export interface PackageStoreState {
  packages: FlowPackage[];
  installPackage: (id: string) => boolean;
  uninstallPackage: (id: string) => boolean;
}

function loadInstalledIds(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return [];
}

function persistInstalledIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // fallback
  }
}

export const usePackageStore = create<PackageStoreState>((set, get) => {
  const installedIds = loadInstalledIds();

  // Register previously installed packages on load
  const initialPackages = CATALOG.map((pkg) => {
    const isInstalled = installedIds.includes(pkg.id);
    if (isInstalled) {
      appRegistry.register(pkg.manifest);
    }
    return { ...pkg, installed: isInstalled };
  });

  return {
    packages: initialPackages,

    installPackage: (id: string) => {
      const pkg = get().packages.find((p) => p.id === id);
      if (!pkg || pkg.installed) return false;

      // Register in app registry
      appRegistry.register(pkg.manifest);
      useDockStore.getState().pinApp(pkg.id);

      const nextPackages = get().packages.map((p) =>
        p.id === id ? { ...p, installed: true } : p
      );

      const currentInstalled = nextPackages.filter((p) => p.installed).map((p) => p.id);
      persistInstalledIds(currentInstalled);

      soundEngine.playChime();
      useNotificationStore.getState().notify({
        title: 'Package Installed',
        message: `${pkg.name} is ready to launch from Dock and Spotlight.`,
        type: 'success',
      });

      set({ packages: nextPackages });
      return true;
    },

    uninstallPackage: (id: string) => {
      const pkg = get().packages.find((p) => p.id === id);
      if (!pkg || !pkg.installed) return false;

      useDockStore.getState().unpinApp(pkg.id);

      const nextPackages = get().packages.map((p) =>
        p.id === id ? { ...p, installed: false } : p
      );

      const currentInstalled = nextPackages.filter((p) => p.installed).map((p) => p.id);
      persistInstalledIds(currentInstalled);

      soundEngine.playSnap();
      useNotificationStore.getState().notify({
        title: 'Package Uninstalled',
        message: `${pkg.name} has been removed.`,
        type: 'info',
      });

      set({ packages: nextPackages });
      return true;
    },
  };
});
