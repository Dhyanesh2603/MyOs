import React, { useState } from 'react';
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
  ShieldCheck,
  Bookmark,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
}

const DEFAULT_BOOKMARKS = [
  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org/wiki/Operating_system' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com' },
  { name: 'MDN Web', url: 'https://developer.mozilla.org/en-US/' },
  { name: 'DuckDuckGo', url: 'https://html.duckduckgo.com/html/' },
];

export const BrowserApp: React.FC<AppProps> = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'FlowOS Start Page',
      url: 'flow://start',
      displayUrl: 'flow://start',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [inputUrl, setInputUrl] = useState<string>('flow://start');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]!;

  const handleNavigate = (target: string) => {
    let finalUrl = target.trim();
    if (!finalUrl) return;

    if (finalUrl === 'flow://start' || finalUrl === 'about:blank') {
      // Internal start page
    } else if (
      finalUrl.startsWith('http://') ||
      finalUrl.startsWith('https://')
    ) {
      // Fully qualified URL
    } else if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
      // Domain without scheme
      finalUrl = `https://${finalUrl}`;
    } else {
      // Search query via DuckDuckGo
      finalUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(finalUrl)}`;
    }

    const hostName =
      finalUrl === 'flow://start'
        ? 'Start Page'
        : finalUrl.replace(/^https?:\/\//, '').split('/')[0] || 'Web';

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              title: hostName,
              url: finalUrl,
              displayUrl: finalUrl,
            }
          : t
      )
    );
    setInputUrl(finalUrl);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: 'New Tab',
      url: 'flow://start',
      displayUrl: 'flow://start',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setInputUrl('flow://start');
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // Reset solitary tab to start page
      handleNavigate('flow://start');
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

  const handleSelectTab = (tab: BrowserTab) => {
    setActiveTabId(tab.id);
    setInputUrl(tab.displayUrl);
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel text-content-primary select-none text-xs">
      {/* Browser Tab Bar */}
      <div className="flex h-9 items-center border-b border-border-subtle bg-surface-overlay/90 px-2 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => handleSelectTab(tab)}
              className={`group flex h-7 max-w-[180px] min-w-[110px] items-center justify-between rounded-md px-2.5 transition-colors cursor-pointer border ${
                isActive
                  ? 'border-border-subtle bg-surface-panel text-content-primary shadow-sm font-medium'
                  : 'border-transparent text-content-tertiary hover:bg-surface-subtle/50 hover:text-content-secondary'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Globe className="h-3 w-3 shrink-0 text-accent-primary" />
                <span className="truncate text-[11px]">{tab.title}</span>
              </div>
              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-surface-subtle hover:text-content-primary transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={handleNewTab}
          title="New Tab"
          className="flex h-6 w-6 items-center justify-center rounded text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Navigation & Address Bar */}
      <div className="flex items-center gap-1.5 border-b border-border-subtle bg-surface-overlay/50 px-2.5 py-1.5">
        <div className="flex items-center gap-0.5 text-content-tertiary">
          <button
            onClick={() => handleNavigate('flow://start')}
            title="Start Page"
            className="rounded p-1 hover:bg-surface-subtle hover:text-content-primary transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
          </button>
          <button
            title="Back"
            className="rounded p-1 hover:bg-surface-subtle hover:text-content-primary transition-colors opacity-50 cursor-not-allowed"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            title="Forward"
            className="rounded p-1 hover:bg-surface-subtle hover:text-content-primary transition-colors opacity-50 cursor-not-allowed"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleNavigate(inputUrl)}
            title="Reload"
            className={`rounded p-1 hover:bg-surface-subtle hover:text-content-primary transition-colors ${
              isLoading ? 'animate-spin text-accent-primary' : ''
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
          className="flex flex-1 items-center rounded-md border border-border-subtle bg-surface-panel px-2.5 py-1 transition-colors focus-within:border-accent-primary"
        >
          <div className="flex items-center gap-1.5 text-content-tertiary mr-1.5">
            {inputUrl.startsWith('https://') ? (
              <Lock className="h-3 w-3 text-emerald-400" />
            ) : inputUrl === 'flow://start' ? (
              <ShieldCheck className="h-3 w-3 text-accent-primary" />
            ) : (
              <Search className="h-3 w-3" />
            )}
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Search or enter web address..."
            className="w-full bg-transparent font-mono text-xs text-content-primary placeholder:text-content-tertiary focus:outline-none"
          />
        </form>
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-overlay/30 px-3 py-1 text-[11px] text-content-tertiary">
        <Bookmark className="h-3 w-3 opacity-60" />
        {DEFAULT_BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            onClick={() => handleNavigate(bm.url)}
            className="rounded px-1.5 py-0.5 hover:bg-surface-subtle hover:text-content-primary transition-colors font-medium"
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* Browser Viewport */}
      <div className="relative flex-1 overflow-hidden bg-surface-panel">
        {activeTab.url === 'flow://start' ? (
          /* FlowOS Start Page */
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-primary/20 bg-accent-primary/10 text-accent-primary mb-4 shadow-sm">
              <Globe className="h-7 w-7" />
            </div>
            <h2 className="font-sans text-lg font-semibold tracking-tight text-content-primary">
              FlowOS Web Browser
            </h2>
            <p className="mt-1 max-w-sm text-xs text-content-tertiary">
              Sandboxed in-OS client browser. Enter any URL or search query to browse.
            </p>

            {/* Quick Access Tiles */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg w-full">
              {DEFAULT_BOOKMARKS.map((bm) => (
                <button
                  key={bm.name}
                  onClick={() => handleNavigate(bm.url)}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-subtle/50 p-4 hover:border-accent-primary/40 hover:bg-surface-subtle active:scale-95 transition-all shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-panel border border-border-subtle text-accent-primary">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-xs text-content-primary">{bm.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-1.5 font-mono text-[10px] text-content-tertiary opacity-70">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sandbox Isolation Enabled (iframe security perimeter)</span>
            </div>
          </div>
        ) : (
          /* Live Web Frame */
          <div className="relative h-full w-full">
            <iframe
              src={activeTab.url}
              title={activeTab.title}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="h-full w-full border-none bg-white"
            />
            {/* Disclaimer pill if site blocks iframes */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-panel/90 px-2 py-1 text-[10px] text-content-tertiary backdrop-blur shadow-sm select-none">
              <span>Restricted by X-Frame-Options?</span>
              <a
                href={activeTab.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-0.5 text-accent-primary hover:underline"
              >
                <span>Open in Tab</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const browserManifest: AppManifest = {
  id: 'browser',
  name: 'Browser',
  description: 'Sandboxed web browser with multi-tabs, address bar, bookmarks, and start page.',
  category: 'productivity',
  icon: Globe,
  defaultSize: { width: 780, height: 540 },
  constraints: { minWidth: 460, minHeight: 320, maxWidth: 1600, maxHeight: 1100 },
  allowMultipleInstances: true,
  permissions: [],
  component: BrowserApp,
};
