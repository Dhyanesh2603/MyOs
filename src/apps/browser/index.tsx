import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  Search,
  Plus,
  X,
  ExternalLink,
  Bookmark,
  FolderOpen,
  Laptop,
  FileCode,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useDeviceStorageStore } from '@core/vfs/deviceStorage';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  srcDoc?: string;
  history: { url: string; title: string; srcDoc?: string }[];
  historyIdx: number;
  isLoading: boolean;
  refreshKey: number;
}

const DEFAULT_HOME_URL = 'https://www.google.com/webhp?igu=1';

const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://www.google.com/webhp?igu=1' },
  { name: 'DuckDuckGo', url: 'https://html.duckduckgo.com/html/' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com' },
  { name: 'Localhost:3000', url: 'http://localhost:3000' },
];

/**
 * Normalizes input text into a direct embeddable URL for the iframe.
 * No hardcoded website special-casing; straightforward URL resolution.
 */
function normalizeUrl(input: string): { url: string; title: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { url: DEFAULT_HOME_URL, title: 'Google' };
  }

  // 1. Direct Protocol (http:// or https://)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname.includes('google.') && !parsed.searchParams.has('igu')) {
        parsed.searchParams.set('igu', '1');
        return {
          url: parsed.toString(),
          title: parsed.searchParams.get('q') ? `${parsed.searchParams.get('q')} - Google Search` : 'Google',
        };
      }
      return {
        url: trimmed,
        title: parsed.hostname || 'Web',
      };
    } catch {
      return { url: trimmed, title: 'Web' };
    }
  }

  // 2. Domain without protocol (e.g. news.ycombinator.com, github.com, etc.)
  if (
    trimmed.includes('.') &&
    !trimmed.includes(' ') &&
    !trimmed.startsWith('/')
  ) {
    return {
      url: `https://${trimmed}`,
      title: trimmed.split('/')[0] || 'Web',
    };
  }

  // 3. Localhost without protocol
  if (trimmed.startsWith('localhost:') || trimmed.startsWith('127.0.0.1:')) {
    return {
      url: `http://${trimmed}`,
      title: trimmed,
    };
  }

  // 4. Otherwise, treat as search query in Google (with igu=1 for iframe embedding)
  return {
    url: `https://www.google.com/search?igu=1&q=${encodeURIComponent(trimmed)}`,
    title: `${trimmed} - Google Search`,
  };
}

/**
 * Escapes raw strings for safe inclusion in generated HTML.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const BrowserApp: React.FC<AppProps> = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'Google',
      url: DEFAULT_HOME_URL,
      displayUrl: 'https://www.google.com',
      history: [{ url: DEFAULT_HOME_URL, title: 'Google' }],
      historyIdx: 0,
      isLoading: false,
      refreshKey: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [inputUrl, setInputUrl] = useState<string>('https://www.google.com');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Device Storage mounted folders
  const mountedFolders = useDeviceStorageStore((s) => s.mountedFolders);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]!;

  const updateTab = useCallback((tabId: string, patch: Partial<BrowserTab>) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...patch } : t)));
  }, []);

  /**
   * Main navigation dispatcher - routes everything into the iframe
   */
  const handleNavigate = useCallback(
    async (target: string, pushToHistory = true) => {
      const rawTarget = target.trim();
      if (!rawTarget) return;

      const currentTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]!;
      let finalUrl = rawTarget;
      let displayUrl = rawTarget;
      let title = 'Web';
      let srcDoc: string | undefined;

      // Handle VFS / Device local file
      if (
        rawTarget.startsWith('/device/') ||
        rawTarget.startsWith('/home/') ||
        rawTarget.startsWith('file:///') ||
        rawTarget.startsWith('vfs:///')
      ) {
        const cleanPath = rawTarget.replace(/^(file:\/\/\/|vfs:\/\/\/)/, '/');
        const fileName = cleanPath.split('/').pop() || 'File';
        title = fileName;
        displayUrl = cleanPath;

        try {
          const content = await useVFSStore.getState().readFile(cleanPath);
          const ext = fileName.split('.').pop()?.toLowerCase() || '';

          if (ext === 'html' || ext === 'htm') {
            srcDoc = content;
          } else if (ext === 'svg') {
            srcDoc = content.startsWith('<svg')
              ? content
              : `<div style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:#111;">${content}</div>`;
          } else {
            srcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(fileName)}</title><style>body{margin:0;padding:24px;background:#0d1117;color:#e6edf3;font-family:monospace;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-all;}</style></head><body>${escapeHtml(content)}</body></html>`;
          }
        } catch {
          srcDoc = `<!DOCTYPE html><html><body style="background:#0f141c;color:#f87171;font-family:sans-serif;padding:30px;"><h3>File Not Found</h3><p>Could not load ${escapeHtml(cleanPath)} from VFS.</p></body></html>`;
        }
      } else {
        const normalized = normalizeUrl(rawTarget);
        finalUrl = normalized.url;
        title = normalized.title;
        displayUrl = finalUrl.includes('google.com') && finalUrl.includes('igu=1')
          ? finalUrl.replace(/[?&]igu=1/, '')
          : finalUrl;
      }

      // History tracking
      let newHistory = currentTab.history;
      let newIdx = currentTab.historyIdx;
      if (pushToHistory) {
        newHistory = currentTab.history.slice(0, currentTab.historyIdx + 1);
        newHistory.push({ url: finalUrl, title, srcDoc });
        newIdx = newHistory.length - 1;
      }

      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                title,
                url: finalUrl,
                displayUrl,
                srcDoc,
                history: newHistory,
                historyIdx: newIdx,
                isLoading: true,
                refreshKey: t.refreshKey + 1,
              }
            : t
        )
      );

      setInputUrl(displayUrl);
    },
    [tabs, activeTabId]
  );

  /**
   * Back navigation
   */
  const handleBack = () => {
    if (activeTab.historyIdx > 0) {
      const prevEntry = activeTab.history[activeTab.historyIdx - 1];
      if (prevEntry) {
        updateTab(activeTabId, {
          historyIdx: activeTab.historyIdx - 1,
        });
        handleNavigate(prevEntry.url, false);
      }
    }
  };

  /**
   * Forward navigation
   */
  const handleForward = () => {
    if (activeTab.historyIdx < activeTab.history.length - 1) {
      const nextEntry = activeTab.history[activeTab.historyIdx + 1];
      if (nextEntry) {
        updateTab(activeTabId, {
          historyIdx: activeTab.historyIdx + 1,
        });
        handleNavigate(nextEntry.url, false);
      }
    }
  };

  /**
   * Reload active tab
   */
  const handleReload = () => {
    updateTab(activeTabId, {
      isLoading: true,
      refreshKey: activeTab.refreshKey + 1,
    });
  };

  /**
   * Home button navigation
   */
  const handleHome = () => {
    handleNavigate(DEFAULT_HOME_URL);
  };

  /**
   * Handle picking local files from host device via native input
   */
  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let srcDoc = '';

      if (ext === 'html' || ext === 'htm') {
        srcDoc = content;
      } else if (ext === 'svg') {
        srcDoc = content.startsWith('<svg')
          ? content
          : `<div style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:#111;">${content}</div>`;
      } else {
        srcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(file.name)}</title><style>body{margin:0;padding:24px;background:#0d1117;color:#e6edf3;font-family:monospace;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-all;}</style></head><body>${escapeHtml(content)}</body></html>`;
      }

      const newId = `tab-${Date.now()}`;
      const newTab: BrowserTab = {
        id: newId,
        title: file.name,
        url: `file:///${file.name}`,
        displayUrl: `file:///${file.name}`,
        srcDoc,
        history: [{ url: `file:///${file.name}`, title: file.name, srcDoc }],
        historyIdx: 0,
        isLoading: false,
        refreshKey: 0,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newId);
      setInputUrl(`file:///${file.name}`);
    };
    reader.readAsText(file);
  };

  /**
   * New tab creation
   */
  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: 'Google',
      url: DEFAULT_HOME_URL,
      displayUrl: 'https://www.google.com',
      history: [{ url: DEFAULT_HOME_URL, title: 'Google' }],
      historyIdx: 0,
      isLoading: true,
      refreshKey: 0,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setInputUrl('https://www.google.com');
  };

  /**
   * Close tab
   */
  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      handleNavigate(DEFAULT_HOME_URL);
      return;
    }
    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      const nextTab = filtered[filtered.length - 1]!;
      setActiveTabId(nextTab.id);
      setInputUrl(nextTab.displayUrl);
    }
  };

  /**
   * Select active tab
   */
  const handleSelectTab = (tab: BrowserTab) => {
    setActiveTabId(tab.id);
    setInputUrl(tab.displayUrl);
  };

  // Keep inputUrl synchronized when active tab changes
  useEffect(() => {
    setInputUrl(activeTab.displayUrl);
  }, [activeTab.displayUrl, activeTabId]);

  // Listen for navigation messages from child iframes if any
  useEffect(() => {
    const handleFrameMessage = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === 'flowos:browser:navigate' &&
        typeof event.data.url === 'string'
      ) {
        const navigatedUrl = event.data.url;
        setInputUrl(navigatedUrl);
        updateTab(activeTabId, {
          url: navigatedUrl,
          displayUrl: navigatedUrl,
          title: navigatedUrl.replace(/^https?:\/\//, '').split('/')[0] || 'Web',
        });
      }
    };
    window.addEventListener('message', handleFrameMessage);
    return () => window.removeEventListener('message', handleFrameMessage);
  }, [activeTabId, updateTab]);

  return (
    <div className="flex h-full w-full flex-col bg-[#0a0b10] text-neutral-100 select-none text-xs">
      {/* Hidden file input for opening host PC files */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleLocalFileSelect}
        className="hidden"
      />

      {/* Modern Browser Tab Bar */}
      <div className="flex h-10 items-center border-b border-white/[0.08] bg-[#0f1118] px-2.5 gap-1.5 overflow-x-auto scrollbar-none no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => handleSelectTab(tab)}
              className={`group flex h-7.5 max-w-[200px] min-w-[120px] items-center justify-between rounded-lg px-3 transition-colors cursor-pointer border ${
                isActive
                  ? 'border-white/15 bg-[#171924] text-white shadow-sm font-medium'
                  : 'border-transparent text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {tab.url.startsWith('file:///') ? (
                  <FileCode className="h-3 w-3 shrink-0 text-white/80" />
                ) : (
                  <Globe className="h-3 w-3 shrink-0 text-white/80" />
                )}
                <span className="truncate text-[11px]">{tab.title}</span>
              </div>
              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 text-neutral-400 hover:text-white transition-all ml-1.5"
                title="Close Tab"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={handleNewTab}
          title="New Tab"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Navigation & Address Bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-[#12141c] px-3 py-2">
        <div className="flex items-center gap-0.5 text-neutral-400">
          <button
            onClick={handleHome}
            title="Home"
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          >
            <Home className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleBack}
            disabled={activeTab.historyIdx <= 0}
            title="Back"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              activeTab.historyIdx > 0
                ? 'hover:bg-white/[0.06] hover:text-white cursor-pointer'
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleForward}
            disabled={activeTab.historyIdx >= activeTab.history.length - 1}
            title="Forward"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              activeTab.historyIdx < activeTab.history.length - 1
                ? 'hover:bg-white/[0.06] hover:text-white cursor-pointer'
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleReload}
            title="Reload"
            className={`flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer ${
              activeTab.isLoading ? 'animate-spin text-white' : ''
            }`}
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Omnibox URL / Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNavigate(inputUrl);
          }}
          className="flex flex-1 items-center rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 transition-colors focus-within:border-white/30 focus-within:bg-black/60 shadow-inner"
        >
          <div className="flex items-center gap-1.5 text-neutral-400 mr-2 shrink-0">
            {inputUrl.startsWith('https://') ? (
              <Lock className="h-3 w-3 text-white/80" />
            ) : inputUrl.startsWith('file:///') ? (
              <FileCode className="h-3 w-3 text-white/80" />
            ) : (
              <Search className="h-3 w-3" />
            )}
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter any URL or search terms..."
            className="w-full bg-transparent font-sans text-xs text-white placeholder:text-neutral-500 focus:outline-none"
          />
        </form>

        {/* Quick Action: Open Host Device File */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Open Local File from PC"
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-neutral-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-[11px] font-medium">Open File</span>
        </button>

        {/* External Window Link */}
        {activeTab.url.startsWith('http') && (
          <a
            href={activeTab.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in native external browser window"
            className="flex items-center rounded-lg p-1.5 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-[#0f1118]/60 px-3 py-1 text-[11px] text-neutral-400 overflow-x-auto scrollbar-none no-scrollbar">
        <Bookmark className="h-3 w-3 shrink-0 opacity-50 mr-1" />
        {DEFAULT_BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            onClick={() => handleNavigate(bm.url)}
            className="flex items-center gap-1 rounded-md px-2 py-0.5 hover:bg-white/[0.05] hover:text-white transition-colors font-medium whitespace-nowrap cursor-pointer"
          >
            <span>{bm.name}</span>
          </button>
        ))}

        {/* Mounted Device Shortcut in Bookmarks */}
        {mountedFolders.length > 0 && (
          <div className="flex items-center gap-1 ml-auto pl-2 border-l border-white/10">
            <Laptop className="h-3 w-3 text-white/80" />
            <span className="text-[10px] text-white/80 font-medium truncate max-w-[120px]">
              {mountedFolders[0]?.name}
            </span>
          </div>
        )}
      </div>

      {/* Browser Viewport: ALWAYS an Iframe for All URLs */}
      <div className="relative flex-1 overflow-hidden bg-white">
        <iframe
          ref={iframeRef}
          key={activeTab.refreshKey}
          src={activeTab.srcDoc ? undefined : activeTab.url}
          srcDoc={activeTab.srcDoc}
          title={activeTab.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-presentation allow-pointer-lock"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone; geolocation; display-capture"
          referrerPolicy="no-referrer"
          allowFullScreen
          className="h-full w-full border-none bg-white"
          onLoad={() => {
            updateTab(activeTab.id, { isLoading: false });
          }}
        />

        {/* Subtle loading spinner overlay when switching tabs or navigating */}
        {activeTab.isLoading && (
          <div className="absolute top-2 right-2 pointer-events-none flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] text-white border border-white/10 shadow-lg">
            <RotateCw className="h-3 w-3 animate-spin text-white" />
            <span>Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const browserManifest: AppManifest = {
  id: 'browser',
  name: 'Browser',
  description: 'Sandboxed web browser with direct iframe embed for all URLs and local storage.',
  category: 'productivity',
  icon: Globe,
  defaultSize: { width: 880, height: 600 },
  constraints: { minWidth: 480, minHeight: 320, maxWidth: 1600, maxHeight: 1100 },
  allowMultipleInstances: true,
  permissions: [],
  component: BrowserApp,
};
