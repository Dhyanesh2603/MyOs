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
  BookOpen,
  ShieldCheck,
  AlertCircle,
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
  history: { url: string; title: string; srcDoc?: string; isReaderMode?: boolean }[];
  historyIdx: number;
  isLoading: boolean;
  refreshKey: number;
  isReaderMode?: boolean;
  hasLoadError?: boolean;
}

const DEFAULT_HOME_URL = 'https://www.google.com/webhp?igu=1';

const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://www.google.com/webhp?igu=1' },
  { name: 'DuckDuckGo', url: 'https://html.duckduckgo.com/html/' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com' },
  { name: 'Localhost:3000', url: 'http://localhost:3000' },
];

/**
 * Normalizes input text into a direct destination URL.
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
      if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
        if (!parsed.pathname.startsWith('/embed/')) {
          const videoId =
            parsed.searchParams.get('v') ||
            (parsed.hostname.includes('youtu.be') ? parsed.pathname.replace(/^\//, '') : '');
          if (videoId) {
            return {
              url: `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`,
              title: 'YouTube Video',
            };
          }
        }
      }
      return {
        url: trimmed,
        title: parsed.hostname || 'Web',
      };
    } catch {
      return { url: trimmed, title: 'Web' };
    }
  }

  // 2. Domain without protocol (e.g. news.ycombinator.com, wikipedia.org, github.com)
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
 * Calculates the actual iframe src to load.
 * Routes external websites through the unblock proxy to bypass X-Frame-Options
 * and Content-Security-Policy restrictions.
 */
export function getEffectiveIframeUrl(rawUrl: string, isReaderMode: boolean = false): string {
  if (!rawUrl) return DEFAULT_HOME_URL;

  // Local/VFS files are rendered via srcDoc
  if (
    rawUrl.startsWith('file:///') ||
    rawUrl.startsWith('vfs:///') ||
    rawUrl.startsWith('/device/') ||
    rawUrl.startsWith('/home/')
  ) {
    return '';
  }

  // Reader Mode: Jina Reader provides distraction-free framing for any article
  if (isReaderMode) {
    const cleanUrl = rawUrl.replace(/^\/api\/proxy\?url=/, '');
    const decoded = cleanUrl.startsWith('http') ? cleanUrl : decodeURIComponent(cleanUrl);
    return `https://r.jina.ai/${decoded}`;
  }

  // Already routed through proxy or data/blob URI
  if (rawUrl.startsWith('/api/proxy') || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
    return rawUrl;
  }

  try {
    const parsed = new URL(rawUrl);

    // Localhost / Loopback URLs - directly embeddable
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '0.0.0.0' ||
      parsed.hostname === '[::1]'
    ) {
      return rawUrl;
    }

    // Google with igu=1 is explicitly allowed by Google for iframe embedding
    if (parsed.hostname.includes('google.')) {
      if (!parsed.searchParams.has('igu')) {
        parsed.searchParams.set('igu', '1');
      }
      return parsed.toString();
    }

    // YouTube /embed/ is explicitly allowed for iframe embedding
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      if (parsed.pathname.startsWith('/embed/')) {
        return rawUrl;
      }
      const videoId =
        parsed.searchParams.get('v') ||
        (parsed.hostname.includes('youtu.be') ? parsed.pathname.replace(/^\//, '') : '');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`;
      }
    }
  } catch {
    return rawUrl;
  }

  // External websites that block iframes (X-Frame-Options / frame-ancestors):
  // Route through unblock proxy which strips restrictive response headers
  return `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
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
      history: [{ url: DEFAULT_HOME_URL, title: 'Google', isReaderMode: false }],
      historyIdx: 0,
      isLoading: false,
      refreshKey: 0,
      isReaderMode: false,
      hasLoadError: false,
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
   * Main navigation dispatcher
   */
  const handleNavigate = useCallback(
    async (target: string, pushToHistory = true, forceReaderMode?: boolean) => {
      const rawTarget = target.trim();
      if (!rawTarget) return;

      const currentTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]!;
      const isReader = forceReaderMode !== undefined ? forceReaderMode : false;
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
        newHistory.push({ url: finalUrl, title, srcDoc, isReaderMode: isReader });
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
                isReaderMode: isReader,
                hasLoadError: false,
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
          isReaderMode: prevEntry.isReaderMode || false,
        });
        handleNavigate(prevEntry.url, false, prevEntry.isReaderMode);
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
          isReaderMode: nextEntry.isReaderMode || false,
        });
        handleNavigate(nextEntry.url, false, nextEntry.isReaderMode);
      }
    }
  };

  /**
   * Reload active tab
   */
  const handleReload = () => {
    updateTab(activeTabId, {
      isLoading: true,
      hasLoadError: false,
      refreshKey: activeTab.refreshKey + 1,
    });
  };

  /**
   * Toggle Reader Mode
   */
  const handleToggleReader = () => {
    const nextReader = !activeTab.isReaderMode;
    updateTab(activeTabId, {
      isReaderMode: nextReader,
      isLoading: true,
      hasLoadError: false,
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
        history: [{ url: `file:///${file.name}`, title: file.name, srcDoc, isReaderMode: false }],
        historyIdx: 0,
        isLoading: false,
        refreshKey: 0,
        isReaderMode: false,
        hasLoadError: false,
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
      history: [{ url: DEFAULT_HOME_URL, title: 'Google', isReaderMode: false }],
      historyIdx: 0,
      isLoading: true,
      refreshKey: 0,
      isReaderMode: false,
      hasLoadError: false,
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

  // Safety timeout to dismiss stuck loading spinners
  useEffect(() => {
    if (!activeTab.isLoading) return;
    const timer = setTimeout(() => {
      updateTab(activeTabId, { isLoading: false });
    }, 12000);
    return () => clearTimeout(timer);
  }, [activeTab.isLoading, activeTab.refreshKey, activeTabId, updateTab]);

  // Listen for navigation messages from child iframes (from proxy interceptor)
  useEffect(() => {
    const handleFrameMessage = (event: MessageEvent) => {
      if (
        event.data &&
        (event.data.type === 'onyx:browser:navigate' || event.data.type === 'flowos:browser:navigate') &&
        typeof event.data.url === 'string'
      ) {
        let navigatedUrl = event.data.url;
        if (navigatedUrl.startsWith('/api/proxy?url=')) {
          navigatedUrl = decodeURIComponent(navigatedUrl.replace(/^\/api\/proxy\?url=/, ''));
        }
        setInputUrl(navigatedUrl);
        updateTab(activeTabId, {
          url: navigatedUrl,
          displayUrl: navigatedUrl,
          title: navigatedUrl.replace(/^https?:\/\//, '').split('/')[0] || 'Web',
          hasLoadError: false,
        });
      }
    };
    window.addEventListener('message', handleFrameMessage);
    return () => window.removeEventListener('message', handleFrameMessage);
  }, [activeTabId, updateTab]);

  const effectiveIframeUrl = activeTab.srcDoc
    ? undefined
    : getEffectiveIframeUrl(activeTab.url, activeTab.isReaderMode);

  const isProxied =
    Boolean(effectiveIframeUrl && effectiveIframeUrl.startsWith('/api/proxy'));

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
                ) : tab.isReaderMode ? (
                  <BookOpen className="h-3 w-3 shrink-0 text-amber-400" />
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
              <Lock className="h-3 w-3 text-emerald-400" />
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

        {/* Reader Mode Toggle Button */}
        {activeTab.url.startsWith('http') && (
          <button
            onClick={handleToggleReader}
            title={activeTab.isReaderMode ? 'Exit Reader Mode' : 'Reader Mode (Bypasses all frame restrictions)'}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors cursor-pointer ${
              activeTab.isReaderMode
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                : 'border-white/10 bg-white/[0.02] text-neutral-300 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px] font-medium">
              {activeTab.isReaderMode ? 'Reader On' : 'Reader'}
            </span>
          </button>
        )}

        {/* Quick Action: Open Host Device File */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Open Local File from PC"
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-neutral-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-[11px] font-medium">Open File</span>
        </button>

        {/* Direct External Window Link */}
        {activeTab.url.startsWith('http') && (
          <a
            href={activeTab.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open directly in native browser tab"
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

      {/* Browser Viewport */}
      <div className="relative flex-1 overflow-hidden bg-white">
        <iframe
          ref={iframeRef}
          key={`${activeTab.refreshKey}-${activeTab.isReaderMode ? 'reader' : 'live'}`}
          src={effectiveIframeUrl}
          srcDoc={activeTab.srcDoc}
          title={activeTab.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-presentation allow-pointer-lock"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone; geolocation; display-capture"
          referrerPolicy="no-referrer"
          allowFullScreen
          className="h-full w-full border-none bg-white"
          onLoad={() => {
            updateTab(activeTab.id, { isLoading: false, hasLoadError: false });
          }}
          onError={() => {
            updateTab(activeTab.id, { isLoading: false, hasLoadError: true });
          }}
        />

        {/* Loading Spinner Overlay */}
        {activeTab.isLoading && (
          <div className="absolute top-2 right-2 pointer-events-none flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] text-white border border-white/10 shadow-lg">
            <RotateCw className="h-3 w-3 animate-spin text-white" />
            <span>Loading...</span>
          </div>
        )}

        {/* Connection Fallback Card if Page Refuses or Fails */}
        {activeTab.hasLoadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d1117] p-6 text-center text-neutral-200">
            <AlertCircle className="h-10 w-10 text-amber-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Website Refused Direct Framing</h3>
            <p className="max-w-md text-xs text-neutral-400 mb-4">
              This website enforces strict bot verification or frame-ancestors headers. You can read it cleanly in Reader Mode or launch it in a direct browser tab.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleReader}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors font-medium cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Open in Reader Mode</span>
              </button>
              <a
                href={activeTab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-white border border-white/15 hover:bg-white/15 transition-colors font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in Native Window</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Modern Status & Security Footer */}
      <div className="flex h-6 items-center justify-between border-t border-white/[0.08] bg-[#0c0e14] px-3 text-[10px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          {activeTab.isReaderMode ? (
            <>
              <BookOpen className="h-3 w-3 text-amber-400" />
              <span className="text-amber-400 font-medium">Reader Mode Active</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-500">Ad-free article extraction</span>
            </>
          ) : isProxied ? (
            <>
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Unblock Proxy Active</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-500">Frame restrictions bypassed</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-3 w-3 text-white/80" />
              <span className="text-neutral-300 font-medium">Direct Embed</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeTab.url.startsWith('http') && (
            <button
              onClick={handleToggleReader}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="h-2.5 w-2.5" />
              <span>{activeTab.isReaderMode ? 'Exit Reader' : 'Reader View'}</span>
            </button>
          )}
          {activeTab.url.startsWith('http') && (
            <a
              href={activeTab.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              <span>External Tab</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export const browserManifest: AppManifest = {
  id: 'browser',
  name: 'Browser',
  description: 'Sandboxed web browser with unblock proxy, direct embeds, and reader mode.',
  category: 'productivity',
  icon: Globe,
  defaultSize: { width: 880, height: 600 },
  constraints: { minWidth: 480, minHeight: 320, maxWidth: 1600, maxHeight: 1100 },
  allowMultipleInstances: true,
  permissions: [],
  component: BrowserApp,
};
