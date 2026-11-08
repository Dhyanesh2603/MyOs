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
  ShieldCheck,
  Bookmark,
  Zap,
  FolderSync,
  FileCode,
  FolderOpen,
  Laptop,
  Play,
  Info,
  TrendingUp,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useVFSStore } from '@core/vfs/vfsStore';
import { useDeviceStorageStore } from '@core/vfs/deviceStorage';

type BrowserMode = 'embed' | 'reader' | 'vfs' | 'local';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  mode: BrowserMode;
  srcDoc?: string;
  mediaSrc?: string;
  history: { url: string; mode: BrowserMode; title: string }[];
  historyIdx: number;
  isLoading: boolean;
  refreshKey: number;
  error?: string | null;
}

export interface YouTubeVideoItem {
  id: string;
  title: string;
  thumbnail: string;
  channel?: string;
}

const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://www.google.com/webhp?igu=1', mode: 'embed' as BrowserMode },
  { name: 'DuckDuckGo', url: 'https://html.duckduckgo.com/html/', mode: 'embed' as BrowserMode },
  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org/wiki/Operating_system', mode: 'embed' as BrowserMode },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', mode: 'embed' as BrowserMode },
  { name: 'YouTube', url: 'flow://youtube', mode: 'embed' as BrowserMode },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/', mode: 'reader' as BrowserMode },
  { name: 'Localhost:3000', url: 'http://localhost:3000', mode: 'embed' as BrowserMode },
];

const YOUTUBE_CATEGORIES = [
  { label: '🔥 Trending', query: 'trending videos' },
  { label: '💻 Coding', query: 'programming coding tutorial' },
  { label: '🎵 Music', query: 'popular music hits official' },
  { label: '🎮 Gaming', query: 'gaming gameplay walkthrough' },
  { label: '⚡ Tech', query: 'tech gadget review mhd' },
  { label: '🎧 Lo-Fi', query: 'lofi hip hop radio live' },
  { label: '🚀 Science', query: 'science documentary veritasium' },
  { label: '🍿 Trailers', query: 'movie trailer official 2026' },
];

const POPULAR_YOUTUBE_SEED: YouTubeVideoItem[] = [
  { id: '2j_g2W9h9-E', title: 'The History of the Linux OS', channel: 'Fireship', thumbnail: 'https://i.ytimg.com/vi/2j_g2W9h9-E/hqdefault.jpg' },
  { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', channel: 'Lofi Girl', thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg' },
  { id: 'A5w-dEgEx10', title: 'The Illusion of Speed', channel: 'Veritasium', thumbnail: 'https://i.ytimg.com/vi/A5w-dEgEx10/hqdefault.jpg' },
  { id: 'rrB13utjYV4', title: 'Linux in 100 Seconds', channel: 'Fireship', thumbnail: 'https://i.ytimg.com/vi/rrB13utjYV4/hqdefault.jpg' },
  { id: '4xDzrJKXOOY', title: 'Synthwave Radio - Chill Synth Vibes', channel: 'Lofi Beats', thumbnail: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg' },
  { id: '5yx6BWlEVcY', title: 'Chillhop Music - Jazzy Beats', channel: 'Chillhop Music', thumbnail: 'https://i.ytimg.com/vi/5yx6BWlEVcY/hqdefault.jpg' },
  { id: 'xND0t1pr3KY', title: 'C Programming Full Course for free', channel: 'Bro Code', thumbnail: 'https://i.ytimg.com/vi/xND0t1pr3KY/hqdefault.jpg' },
  { id: '_uQrJ0TkZlc', title: 'Python Full Course for Beginners', channel: 'Programming with Mosh', thumbnail: 'https://i.ytimg.com/vi/_uQrJ0TkZlc/hqdefault.jpg' },
  { id: 'aircAruvnKk', title: 'Neural Networks and Deep Learning', channel: '3Blue1Brown', thumbnail: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault.jpg' },
  { id: 'JyECrGp-Sw8', title: 'What If We Detonated All Nuclear Bombs at Once?', channel: 'Kurzgesagt', thumbnail: 'https://i.ytimg.com/vi/JyECrGp-Sw8/hqdefault.jpg' },
  { id: '1WeIN3m3a4w', title: '$1 vs $1,000,000 Hotel Room!', channel: 'MrBeast', thumbnail: 'https://i.ytimg.com/vi/1WeIN3m3a4w/hqdefault.jpg' },
  { id: '3bGNuRtl98Y', title: 'The Best Smartphone Camera Blind Test', channel: 'MKBHD', thumbnail: 'https://i.ytimg.com/vi/3bGNuRtl98Y/hqdefault.jpg' },
];

/**
 * Parses and extracts a YouTube video ID from various URL formats.
 */
function extractYouTubeVideoId(input: string): string | null {
  try {
    const raw = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
      return raw;
    }
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v && v.length === 11) return v;
      if (url.pathname.startsWith('/embed/')) {
        return url.pathname.split('/')[2]?.slice(0, 11) || null;
      }
      if (url.pathname.startsWith('/shorts/')) {
        return url.pathname.split('/')[2]?.slice(0, 11) || null;
      }
      if (url.pathname.startsWith('/v/')) {
        return url.pathname.split('/')[2]?.slice(0, 11) || null;
      }
    } else if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace(/^\//, '').slice(0, 11);
      if (id.length === 11) return id;
    }
  } catch {
    // Ignore invalid URL
  }
  return null;
}

/**
 * Checks if a URL represents the YouTube root home page.
 */
function isYouTubeHome(input: string): boolean {
  try {
    const raw = input.trim();
    if (raw.toLowerCase() === 'youtube' || raw.toLowerCase() === 'yt') return true;
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    const isRoot = url.pathname === '/' || url.pathname === '';
    return (host === 'youtube.com' || host === 'm.youtube.com') && isRoot && !url.searchParams.has('v');
  } catch {
    return false;
  }
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

/**
 * Lightweight, safe parser for converting markdown/reader text into rich HTML.
 */
function buildReaderHtml(title: string, rawContent: string, sourceUrl: string): string {
  const lines = rawContent.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        htmlParts.push(
          `<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    // Headers
    if (trimmed.startsWith('#### ')) {
      htmlParts.push(`<h4>${escapeHtml(trimmed.slice(5))}</h4>`);
    } else if (trimmed.startsWith('### ')) {
      htmlParts.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith('## ')) {
      htmlParts.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith('# ')) {
      htmlParts.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith('> ')) {
      htmlParts.push(`<blockquote>${escapeHtml(trimmed.slice(2))}</blockquote>`);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      htmlParts.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`);
    } else if (trimmed.startsWith('![')) {
      const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
      if (match && match[2]) {
        htmlParts.push(`<img src="${escapeHtml(match[2])}" alt="${escapeHtml(match[1] || '')}" loading="lazy" />`);
      } else {
        htmlParts.push(`<p>${escapeHtml(trimmed)}</p>`);
      }
    } else {
      let formatted = escapeHtml(trimmed);
      formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
      formatted = formatted.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      );
      htmlParts.push(`<p>${formatted}</p>`);
    }
  }

  if (inCodeBlock && codeBuffer.length > 0) {
    htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #0b0f17;
      --card-bg: #111827;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --border: #1e293b;
      --code-bg: #1e293b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 36px 20px 80px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      font-size: 15px;
    }
    .reader-container {
      max-width: 760px;
      margin: 0 auto;
    }
    .header-bar {
      margin-bottom: 28px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(56, 189, 248, 0.12);
      color: var(--accent);
      border: 1px solid rgba(56, 189, 248, 0.25);
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .source-link {
      font-size: 12px;
      color: var(--text-muted);
      word-break: break-all;
    }
    .source-link a {
      color: var(--accent);
      text-decoration: none;
    }
    .source-link a:hover { text-decoration: underline; }
    h1, h2, h3, h4 { color: #f8fafc; line-height: 1.35; margin-top: 1.8em; margin-bottom: 0.6em; }
    h1 { font-size: 26px; margin-top: 0; }
    h2 { font-size: 20px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
    h3 { font-size: 17px; }
    p { margin: 1.1em 0; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: var(--code-bg); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    pre { background: var(--code-bg); padding: 14px 16px; border-radius: 8px; overflow-x: auto; border: 1px solid var(--border); line-height: 1.5; }
    pre code { background: transparent; padding: 0; }
    blockquote { border-left: 3px solid var(--accent); margin: 1.2em 0; padding-left: 16px; color: var(--text-muted); font-style: italic; }
    ul, ol { padding-left: 24px; margin: 1em 0; }
    li { margin: 0.4em 0; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5em 0; display: block; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="reader-container">
    <div class="header-bar">
      <div class="badge">⚡ FlowOS Reader Engine</div>
      <div class="source-link">
        Source: <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sourceUrl)}</a>
      </div>
    </div>
    <div class="reader-content">
      ${htmlParts.join('\n')}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Builds HTML document preview for raw text, code, or markdown files from host device / VFS.
 */
function buildLocalFileHtml(fileName: string, content: string, isMarkdown = false): string {
  if (isMarkdown) {
    return buildReaderHtml(fileName, content, `file:///${fileName}`);
  }

  const escaped = escapeHtml(content);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(fileName)}</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: #0d1117;
      color: #e6edf3;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
    }
    .header {
      padding-bottom: 12px;
      margin-bottom: 16px;
      border-bottom: 1px solid #30363d;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      color: #8b949e;
      display: flex;
      justify-content: space-between;
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="header">
    <span>💻 Local Host File: <strong>${escapeHtml(fileName)}</strong></span>
    <span>Rendered in FlowOS</span>
  </div>
  <pre>${escaped}</pre>
</body>
</html>`;
}

export const BrowserApp: React.FC<AppProps> = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'FlowOS Start Page',
      url: 'flow://start',
      displayUrl: 'flow://start',
      mode: 'embed',
      history: [{ url: 'flow://start', mode: 'embed', title: 'FlowOS Start Page' }],
      historyIdx: 0,
      isLoading: false,
      refreshKey: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [inputUrl, setInputUrl] = useState<string>('flow://start');

  // Universal Live YouTube Engine State
  const [ytVideos, setYtVideos] = useState<YouTubeVideoItem[]>(POPULAR_YOUTUBE_SEED);
  const [ytActiveVideo, setYtActiveVideo] = useState<YouTubeVideoItem | null>(null);
  const [ytQuery, setYtQuery] = useState<string>('');
  const [ytActiveCategory, setYtActiveCategory] = useState<string>('🔥 Trending');
  const [ytIsSearching, setYtIsSearching] = useState<boolean>(false);
  const [ytSearchError, setYtSearchError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // VFS & Device Storage stores
  const vfsNodes = useVFSStore((s) => s.nodes);
  const mountedFolders = useDeviceStorageStore((s) => s.mountedFolders);
  const mountDirectoryPicker = useDeviceStorageStore((s) => s.mountDirectoryPicker);
  const isMounting = useDeviceStorageStore((s) => s.isMounting);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]!;

  const updateTab = useCallback((tabId: string, patch: Partial<BrowserTab>) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...patch } : t)));
  }, []);

  /**
   * Performs live real-time YouTube search across the entire YouTube catalog.
   */
  const handleYouTubeSearch = useCallback(async (query: string, categoryLabel?: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    if (categoryLabel) {
      setYtActiveCategory(categoryLabel);
    } else {
      setYtActiveCategory(`Search: "${cleanQuery}"`);
    }

    // Check if user entered a direct video link or ID
    const directId = extractYouTubeVideoId(cleanQuery);
    if (directId) {
      setYtActiveVideo({
        id: directId,
        title: `YouTube Video (${directId})`,
        thumbnail: `https://i.ytimg.com/vi/${directId}/hqdefault.jpg`,
      });
      return;
    }

    setYtIsSearching(true);
    setYtSearchError(null);

    try {
      // 1. Try local Vite dev backend search proxy (extracts live real-time videos)
      const proxyResp = await fetch(`/api/youtube/search?q=${encodeURIComponent(cleanQuery)}`);
      if (proxyResp.ok) {
        const data = await proxyResp.json();
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          setYtVideos(data.videos);
          return;
        }
      }
    } catch {
      // Fall through to public proxy / invidious
    }

    try {
      // 2. Fallback to public Invidious instance search
      const invResp = await fetch(
        `https://invidious.privacyredirect.com/api/v1/search?q=${encodeURIComponent(cleanQuery)}&type=video`
      );
      if (invResp.ok) {
        const invData = await invResp.json();
        if (Array.isArray(invData) && invData.length > 0) {
          const invVideos: YouTubeVideoItem[] = invData.slice(0, 16).map((v: any) => ({
            id: v.videoId,
            title: v.title,
            channel: v.author,
            thumbnail: v.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          }));
          setYtVideos(invVideos);
          return;
        }
      }
    } catch {
      // Invidious fallback failed
    }

    // 3. Fallback: filter seed catalog
    const filtered = POPULAR_YOUTUBE_SEED.filter(
      (v) =>
        v.title.toLowerCase().includes(cleanQuery.toLowerCase()) ||
        v.channel?.toLowerCase().includes(cleanQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      setYtVideos(filtered);
    } else {
      setYtSearchError(`No direct video links found for "${cleanQuery}". Showing recommended catalog.`);
      setYtVideos(POPULAR_YOUTUBE_SEED);
    }
    setYtIsSearching(false);
  }, []);

  /**
   * Main navigation dispatcher
   */
  const handleNavigate = useCallback(
    async (target: string, forcedMode?: BrowserMode, pushToHistory = true) => {
      let finalUrl = target.trim();
      if (!finalUrl) return;

      const currentTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]!;
      let mode: BrowserMode = forcedMode ?? 'embed';
      let title = 'Web';
      let srcDoc: string | undefined;
      let mediaSrc: string | undefined;

      // 1. Start page / Blank
      if (finalUrl === 'flow://start' || finalUrl === 'about:blank' || finalUrl === 'flow://newtab') {
        finalUrl = 'flow://start';
        title = 'Start Page';
        mode = 'embed';
      }
      // 2. YouTube Portal or Root YouTube Home or search
      else if (
        finalUrl === 'flow://youtube' ||
        isYouTubeHome(finalUrl) ||
        finalUrl.startsWith('youtube.com') ||
        finalUrl.startsWith('www.youtube.com') ||
        finalUrl.startsWith('https://youtube.com') ||
        finalUrl.startsWith('https://www.youtube.com') ||
        finalUrl.startsWith('http://youtube.com') ||
        finalUrl.startsWith('http://www.youtube.com')
      ) {
        const videoId = extractYouTubeVideoId(finalUrl);
        if (videoId) {
          finalUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`;
          title = 'YouTube Player';
          mode = 'embed';
        } else {
          try {
            const parsed = new URL(finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`);
            const query = parsed.searchParams.get('search_query');
            if (query) {
              handleYouTubeSearch(query);
            }
          } catch {
            // Ignore parse error
          }
          finalUrl = 'flow://youtube';
          title = 'YouTube';
          mode = 'embed';
        }
      }
      // 3. YouTube Video (watch?v=, youtu.be/, shorts/, embed/)
      else if (extractYouTubeVideoId(finalUrl)) {
        const videoId = extractYouTubeVideoId(finalUrl)!;
        finalUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`;
        title = 'YouTube Player';
        mode = 'embed';
      }
      // 4. VFS / Device file: starts with /device/, /home/, file:///, or vfs:///
      else if (
        finalUrl.startsWith('/device/') ||
        finalUrl.startsWith('/home/') ||
        finalUrl.startsWith('file:///') ||
        finalUrl.startsWith('vfs:///')
      ) {
        mode = 'vfs';
        const cleanPath = finalUrl.replace(/^(file:\/\/\/|vfs:\/\/\/)/, '/');
        const fileName = cleanPath.split('/').pop() || 'File';
        title = fileName;

        try {
          const content = await useVFSStore.getState().readFile(cleanPath);
          const ext = fileName.split('.').pop()?.toLowerCase() || '';

          if (ext === 'html' || ext === 'htm') {
            srcDoc = content;
          } else if (ext === 'svg') {
            srcDoc = content.startsWith('<svg')
              ? content
              : `<div style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:#111;">${content}</div>`;
          } else if (content.startsWith('data:image/') || content.startsWith('data:video/')) {
            mediaSrc = content;
          } else {
            srcDoc = buildLocalFileHtml(fileName, content, ext === 'md' || ext === 'markdown');
          }
        } catch {
          srcDoc = `<!DOCTYPE html><html><body style="background:#0f141c;color:#f87171;font-family:sans-serif;padding:30px;"><h3>File Not Found</h3><p>Could not load ${escapeHtml(cleanPath)} from VFS.</p></body></html>`;
        }
      }
      // 5. Standard Web URL or Search
      else {
        if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
          // Valid URL
        } else if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
          finalUrl = `https://${finalUrl}`;
        } else {
          // Web search directly in Google with igu=1 (unrestricted iframe parameter)
          finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
        }

        // Ensure any Google home or search navigation always retains igu=1
        try {
          const parsed = new URL(finalUrl);
          if (parsed.hostname.includes('google.')) {
            if (parsed.pathname === '/' || parsed.pathname === '' || parsed.pathname === '/webhp') {
              parsed.pathname = '/webhp';
              parsed.searchParams.set('igu', '1');
              finalUrl = parsed.toString();
              title = 'Google';
            } else if (parsed.pathname.startsWith('/search')) {
              parsed.searchParams.set('igu', '1');
              finalUrl = parsed.toString();
              const q = parsed.searchParams.get('q');
              title = q ? `${q} - Google Search` : 'Google Search';
            }
          }
        } catch {
          // Ignore parse errors
        }

        if (title === 'Web') {
          title = finalUrl.replace(/^https?:\/\//, '').split('/')[0] || 'Web';
        }

        // Check if forced into reader mode or explicitly requested
        if (mode === 'reader') {
          updateTab(activeTabId, { isLoading: true, error: null });
          try {
            const resp = await fetch(`https://r.jina.ai/${finalUrl}`);
            if (!resp.ok) {
              throw new Error(`Failed to fetch reader view (${resp.status})`);
            }
            const markdown = await resp.text();
            srcDoc = buildReaderHtml(title, markdown, finalUrl);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            srcDoc = `<!DOCTYPE html><html><body style="background:#0f141c;color:#f87171;font-family:sans-serif;padding:30px;"><h3>Reader Mode Error</h3><p>${escapeHtml(msg)}</p><p><a href="${escapeHtml(finalUrl)}" target="_blank" style="color:#38bdf8;">Open in external browser window</a></p></body></html>`;
          }
        }
      }

      // History management
      let newHistory = currentTab.history;
      let newIdx = currentTab.historyIdx;
      if (pushToHistory) {
        newHistory = currentTab.history.slice(0, currentTab.historyIdx + 1);
        newHistory.push({ url: finalUrl, mode, title });
        newIdx = newHistory.length - 1;
      }

      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                title,
                url: finalUrl,
                displayUrl: finalUrl,
                mode,
                srcDoc,
                mediaSrc,
                history: newHistory,
                historyIdx: newIdx,
                isLoading: false,
                refreshKey: t.refreshKey + 1,
              }
            : t
        )
      );

      setInputUrl(finalUrl);
    },
    [tabs, activeTabId, updateTab]
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
        handleNavigate(prevEntry.url, prevEntry.mode, false);
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
        handleNavigate(nextEntry.url, nextEntry.mode, false);
      }
    }
  };

  /**
   * Reload active tab
   */
  const handleReload = () => {
    handleNavigate(activeTab.url, activeTab.mode, false);
  };

  /**
   * Toggle between Direct Embed and Reader mode for web URLs
   */
  const handleToggleReader = () => {
    if (activeTab.url === 'flow://start' || activeTab.url === 'flow://youtube') return;
    const targetMode: BrowserMode = activeTab.mode === 'reader' ? 'embed' : 'reader';
    handleNavigate(activeTab.url, targetMode, false);
  };

  /**
   * Handle picking local files from host device via native input
   */
  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (isImage || isPdf) {
      reader.onload = () => {
        const result = reader.result as string;
        const newId = `tab-${Date.now()}`;
        const newTab: BrowserTab = {
          id: newId,
          title: file.name,
          url: `file:///${file.name}`,
          displayUrl: `file:///${file.name}`,
          mode: 'local',
          mediaSrc: result,
          history: [{ url: `file:///${file.name}`, mode: 'local', title: file.name }],
          historyIdx: 0,
          isLoading: false,
          refreshKey: 0,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newId);
        setInputUrl(`file:///${file.name}`);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        const text = reader.result as string;
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        let srcDoc = '';

        if (ext === 'html' || ext === 'htm') {
          srcDoc = text;
        } else if (ext === 'svg') {
          srcDoc = text.startsWith('<svg')
            ? text
            : `<div style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:#111;">${text}</div>`;
        } else {
          srcDoc = buildLocalFileHtml(file.name, text, ext === 'md' || ext === 'markdown');
        }

        const newId = `tab-${Date.now()}`;
        const newTab: BrowserTab = {
          id: newId,
          title: file.name,
          url: `file:///${file.name}`,
          displayUrl: `file:///${file.name}`,
          mode: 'local',
          srcDoc,
          history: [{ url: `file:///${file.name}`, mode: 'local', title: file.name }],
          historyIdx: 0,
          isLoading: false,
          refreshKey: 0,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newId);
        setInputUrl(`file:///${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  /**
   * New tab creation
   */
  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: 'New Tab',
      url: 'flow://start',
      displayUrl: 'flow://start',
      mode: 'embed',
      history: [{ url: 'flow://start', mode: 'embed', title: 'New Tab' }],
      historyIdx: 0,
      isLoading: false,
      refreshKey: 0,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setInputUrl('flow://start');
  };

  /**
   * Close tab
   */
  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
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

  // Listen for navigation messages from proxied iframes
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

  // Find mounted device files in VFS to show in quick access
  const deviceFiles = Object.values(vfsNodes).filter(
    (n) => n.type === 'file' && n.path.startsWith('/device/')
  );

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel text-content-primary select-none text-xs">
      {/* Hidden file input for opening host PC files */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleLocalFileSelect}
        className="hidden"
      />

      {/* Browser Tab Bar */}
      <div className="flex h-9 items-center border-b border-border-subtle bg-surface-overlay/90 px-2 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isYouTubeTab =
            tab.url === 'flow://youtube' ||
            tab.url.includes('youtube.com/embed') ||
            tab.url.includes('youtube-nocookie.com');
          return (
            <div
              key={tab.id}
              onClick={() => handleSelectTab(tab)}
              className={`group flex h-7 max-w-[190px] min-w-[110px] items-center justify-between rounded-md px-2.5 transition-colors cursor-pointer border ${
                isActive
                  ? 'border-border-subtle bg-surface-panel text-content-primary shadow-sm font-medium'
                  : 'border-transparent text-content-tertiary hover:bg-surface-subtle/50 hover:text-content-secondary'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {isYouTubeTab ? (
                  <Play className="h-3 w-3 shrink-0 text-red-500 fill-red-500" />
                ) : tab.mode === 'reader' ? (
                  <Zap className="h-3 w-3 shrink-0 text-amber-400" />
                ) : tab.mode === 'vfs' || tab.mode === 'local' ? (
                  <Laptop className="h-3 w-3 shrink-0 text-emerald-400" />
                ) : (
                  <Globe className="h-3 w-3 shrink-0 text-accent-primary" />
                )}
                <span className="truncate text-[11px]">{tab.title}</span>
              </div>
              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-surface-subtle hover:text-content-primary transition-all"
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
            onClick={handleBack}
            disabled={activeTab.historyIdx <= 0}
            title="Back"
            className={`rounded p-1 transition-colors ${
              activeTab.historyIdx > 0
                ? 'hover:bg-surface-subtle hover:text-content-primary'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleForward}
            disabled={activeTab.historyIdx >= activeTab.history.length - 1}
            title="Forward"
            className={`rounded p-1 transition-colors ${
              activeTab.historyIdx < activeTab.history.length - 1
                ? 'hover:bg-surface-subtle hover:text-content-primary'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleReload}
            title="Reload"
            className={`rounded p-1 hover:bg-surface-subtle hover:text-content-primary transition-colors ${
              activeTab.isLoading ? 'animate-spin text-accent-primary' : ''
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
            ) : inputUrl.startsWith('flow://youtube') || inputUrl.includes('youtube') ? (
              <Play className="h-3 w-3 text-red-500 fill-red-500" />
            ) : inputUrl.startsWith('flow://') ? (
              <ShieldCheck className="h-3 w-3 text-accent-primary" />
            ) : inputUrl.startsWith('file:///') || inputUrl.startsWith('/device/') ? (
              <Laptop className="h-3 w-3 text-emerald-400" />
            ) : (
              <Search className="h-3 w-3" />
            )}
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter web address, YouTube URL, search query, or file path (/device/...)..."
            className="w-full bg-transparent font-mono text-xs text-content-primary placeholder:text-content-tertiary focus:outline-none"
          />

          {/* Mode Switcher inside Omnibox */}
          {activeTab.url !== 'flow://start' &&
            activeTab.url !== 'flow://youtube' &&
            !activeTab.url.startsWith('file:///') && (
              <button
                type="button"
                onClick={handleToggleReader}
                title={
                  activeTab.mode === 'reader'
                    ? 'Switch to Direct Iframe Embed'
                    : 'Switch to Reader Engine (Bypasses iframe blockers)'
                }
                className={`ml-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  activeTab.mode === 'reader'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'bg-surface-subtle text-content-secondary hover:text-content-primary hover:bg-surface-subtle/80'
                }`}
              >
                <Zap className="h-2.5 w-2.5" />
                <span>{activeTab.mode === 'reader' ? 'Reader Active' : 'Reader'}</span>
              </button>
            )}
        </form>

        {/* Quick Action: Open Host Device File */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Open Local File from PC"
          className="flex items-center gap-1 rounded border border-border-subtle bg-surface-subtle/50 px-2 py-1 text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
        >
          <FolderOpen className="h-3.5 w-3.5 text-accent-primary" />
          <span className="hidden sm:inline text-[11px]">Open File</span>
        </button>

        {/* External Window Link */}
        {activeTab.url.startsWith('http') && (
          <a
            href={activeTab.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in native browser tab"
            className="flex items-center rounded p-1 text-content-tertiary hover:bg-surface-subtle hover:text-content-primary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center gap-1.5 border-b border-border-subtle bg-surface-overlay/30 px-3 py-1 text-[11px] text-content-tertiary overflow-x-auto">
        <Bookmark className="h-3 w-3 shrink-0 opacity-60 mr-1" />
        {DEFAULT_BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            onClick={() => handleNavigate(bm.url, bm.mode)}
            className="flex items-center gap-1 rounded px-2 py-0.5 hover:bg-surface-subtle hover:text-content-primary transition-colors font-medium whitespace-nowrap"
          >
            {bm.name === 'YouTube' ? (
              <Play className="h-2.5 w-2.5 fill-red-500 text-red-500" />
            ) : null}
            <span>{bm.name}</span>
          </button>
        ))}

        {/* Mounted Device Shortcut in Bookmarks */}
        {mountedFolders.length > 0 && (
          <div className="flex items-center gap-1 ml-auto pl-2 border-l border-border-subtle">
            <Laptop className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-medium truncate max-w-[120px]">
              {mountedFolders[0]?.name}
            </span>
          </div>
        )}
      </div>

      {/* Browser Viewport */}
      <div className="relative flex-1 overflow-hidden bg-surface-panel">
        {activeTab.url === 'flow://start' ? (
          /* FlowOS Start Page */
          <div className="flex h-full w-full flex-col items-center justify-start p-6 overflow-y-auto">
            <div className="flex flex-col items-center text-center max-w-xl w-full my-auto py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-primary/20 bg-accent-primary/10 text-accent-primary mb-3 shadow-sm">
                <Globe className="h-6 w-6" />
              </div>
              <h2 className="font-sans text-xl font-bold tracking-tight text-content-primary">
                FlowOS Web & Device Browser
              </h2>
              <p className="mt-1 text-xs text-content-tertiary">
                Direct Iframe Web Embed, Bypass Reader Engine, Universal YouTube Client, and Real Host File Access.
              </p>

              {/* Start Page Search Omnibox */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNavigate(inputUrl);
                }}
                className="mt-5 flex w-full items-center rounded-xl border border-border-subtle bg-surface-subtle/50 px-3.5 py-2 shadow-sm transition-all focus-within:border-accent-primary focus-within:bg-surface-panel"
              >
                <Search className="h-4 w-4 text-content-tertiary mr-2.5" />
                <input
                  type="text"
                  value={inputUrl === 'flow://start' ? '' : inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Search the web with DuckDuckGo or enter URL / file path..."
                  className="w-full bg-transparent text-xs text-content-primary placeholder:text-content-tertiary focus:outline-none"
                />
              </form>

              {/* Quick Bookmarks */}
              <div className="mt-6 w-full">
                <div className="text-[11px] font-medium text-content-secondary text-left mb-2 px-1">
                  Featured Web Destinations
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full">
                  {DEFAULT_BOOKMARKS.map((bm) => (
                    <button
                      key={bm.name}
                      onClick={() => handleNavigate(bm.url, bm.mode)}
                      className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-surface-subtle/30 p-2.5 hover:border-accent-primary/40 hover:bg-surface-subtle transition-all text-left group"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-panel border border-border-subtle text-accent-primary group-hover:scale-105 transition-transform">
                        {bm.name === 'YouTube' ? (
                          <Play className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                        ) : bm.mode === 'reader' ? (
                          <Zap className="h-3.5 w-3.5 text-amber-400" />
                        ) : (
                          <Globe className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-xs text-content-primary truncate">{bm.name}</div>
                        <div className="text-[10px] text-content-tertiary truncate">
                          {bm.url === 'flow://youtube' ? 'Video Player & Search' : bm.url.replace(/^https?:\/\//, '')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Host Device Storage Section */}
              <div className="mt-6 w-full rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-xs text-content-primary">
                      Host Device Files & Storage
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-400/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {mountedFolders.length > 0 ? `${mountedFolders.length} Folders Connected` : 'Ready to Connect'}
                  </span>
                </div>

                <p className="text-[11px] text-content-tertiary mb-3">
                  Connect physical directories from your computer or pick individual HTML/SVG/text files to render directly inside the browser.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => mountDirectoryPicker()}
                    disabled={isMounting}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    <FolderSync className={`h-3.5 w-3.5 ${isMounting ? 'animate-spin' : ''}`} />
                    <span>{isMounting ? 'Connecting...' : 'Mount Host PC Folder'}</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg bg-surface-subtle hover:bg-surface-panel text-content-primary border border-border-subtle px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    <FolderOpen className="h-3.5 w-3.5 text-accent-primary" />
                    <span>Open File from PC</span>
                  </button>
                </div>

                {/* Show list of real files if mounted */}
                {deviceFiles.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/15">
                    <div className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400/80 mb-2">
                      Mounted Device Files ({deviceFiles.length}):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                      {deviceFiles.slice(0, 8).map((df) => (
                        <button
                          key={df.path}
                          onClick={() => handleNavigate(df.path)}
                          className="flex items-center gap-2 rounded px-2 py-1 bg-surface-panel/60 hover:bg-surface-panel border border-border-subtle text-left text-[11px] truncate transition-colors"
                        >
                          <FileCode className="h-3 w-3 text-accent-primary shrink-0" />
                          <span className="truncate text-content-primary font-mono">{df.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Engine Capabilities Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] text-content-tertiary">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent-primary" />
                  <span>Full Iframe Sandbox</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                  <span>Live Universal YouTube</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Jina Reader Engine</span>
                </div>
                <div className="flex items-center gap-1">
                  <Laptop className="h-3.5 w-3.5 text-emerald-400" />
                  <span>W3C File System Access</span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab.url === 'flow://youtube' ? (
          /* FlowTube - Universal Live YouTube Client */
          <div className="flex h-full w-full flex-col bg-surface-panel p-4 overflow-y-auto">
            <div className="max-w-6xl w-full mx-auto flex flex-col gap-4">
              {/* Header / YouTube Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm">
                    <Play className="h-4 w-4 fill-white ml-0.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-bold text-sm tracking-tight text-content-primary">FlowTube</h2>
                      <span className="rounded bg-red-600/10 border border-red-600/30 px-1.5 py-0.2 text-[9px] font-bold text-red-400 uppercase tracking-wider">
                        Universal
                      </span>
                    </div>
                    <p className="text-[11px] text-content-tertiary">
                      Search, browse, and watch any video in the entire YouTube catalog
                    </p>
                  </div>
                </div>

                {/* Real-time YouTube Search Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (ytQuery.trim()) {
                      handleYouTubeSearch(ytQuery);
                    }
                  }}
                  className="flex flex-1 sm:max-w-md items-center gap-1.5"
                >
                  <div className="flex flex-1 items-center rounded-lg border border-border-subtle bg-surface-subtle/50 px-3 py-1.5 focus-within:border-red-500 focus-within:bg-surface-panel transition-all">
                    <Search className="h-3.5 w-3.5 text-content-tertiary mr-2 shrink-0" />
                    <input
                      type="text"
                      value={ytQuery}
                      onChange={(e) => setYtQuery(e.target.value)}
                      placeholder="Search any video, topic, or paste YouTube link..."
                      className="w-full bg-transparent text-xs text-content-primary placeholder:text-content-tertiary focus:outline-none"
                    />
                    {ytQuery && (
                      <button
                        type="button"
                        onClick={() => setYtQuery('')}
                        className="text-content-tertiary hover:text-content-primary"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={ytIsSearching}
                    className="flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-medium text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {ytIsSearching ? (
                      <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Search className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </form>

                {/* External link */}
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-subtle px-3 py-1.5 text-[11px] font-medium text-content-secondary hover:bg-surface-overlay hover:text-content-primary transition-colors shrink-0"
                >
                  <span>Native Tab</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Category Filter Rail */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {YOUTUBE_CATEGORIES.map((cat) => {
                  const isActive = ytActiveCategory === cat.label;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => handleYouTubeSearch(cat.query, cat.label)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-surface-subtle text-content-secondary hover:bg-surface-overlay hover:text-content-primary border border-border-subtle'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Video Player (Theater Mode) */}
              {ytActiveVideo && (
                <div className="relative w-full rounded-2xl overflow-hidden border border-border-subtle bg-black shadow-2xl">
                  {/* Top Bar inside Player */}
                  <div className="flex items-center justify-between bg-black/90 backdrop-blur px-4 py-2 border-b border-white/10 text-white">
                    <div className="flex items-center gap-2 truncate pr-4">
                      <Play className="h-3.5 w-3.5 text-red-500 fill-red-500 shrink-0" />
                      <span className="font-semibold text-xs truncate">{ytActiveVideo.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://www.youtube.com/watch?v=${ytActiveVideo.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in native YouTube tab"
                        className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => setYtActiveVideo(null)}
                        title="Close Player and view feed"
                        className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 16:9 Responsive Embed */}
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      key={ytActiveVideo.id}
                      src={`https://www.youtube.com/embed/${ytActiveVideo.id}?autoplay=1&enablejsapi=1&rel=0`}
                      title={ytActiveVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="w-full h-full border-none"
                    />
                  </div>
                </div>
              )}

              {/* Feed Header */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="font-semibold text-xs text-content-primary">
                    {ytActiveCategory}
                  </span>
                  <span className="text-[10px] text-content-tertiary">
                    ({ytVideos.length} videos loaded)
                  </span>
                </div>

                {ytIsSearching && (
                  <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium">
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Searching YouTube in real time...</span>
                  </div>
                )}
              </div>

              {/* Search Error Notice (if any) */}
              {ytSearchError && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
                  {ytSearchError}
                </div>
              )}

              {/* Universal Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pb-6">
                {ytVideos.map((video) => {
                  const isCurrent = ytActiveVideo?.id === video.id;
                  return (
                    <div
                      key={video.id}
                      onClick={() => {
                        setYtActiveVideo(video);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`group flex flex-col rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 ${
                        isCurrent
                          ? 'border-red-500 bg-red-500/10 shadow-md ring-1 ring-red-500'
                          : 'border-border-subtle bg-surface-subtle/30 hover:border-red-500/50 hover:bg-surface-subtle hover:shadow-lg hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Play Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="h-9 w-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="h-4 w-4 fill-white ml-0.5" />
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="absolute top-2 left-2 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow">
                            Playing Now
                          </span>
                        )}
                      </div>

                      {/* Video Details */}
                      <div className="p-2.5 flex flex-col flex-1 justify-between">
                        <h3 className="font-semibold text-xs text-content-primary line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                          {video.title}
                        </h3>
                        {video.channel && (
                          <p className="mt-1 text-[10px] text-content-tertiary truncate">
                            {video.channel}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informative Security Banner */}
              <div className="rounded-xl border border-border-subtle bg-surface-subtle/30 p-3 text-xs text-content-secondary flex gap-3">
                <Info className="h-4 w-4 text-accent-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-content-primary">
                    How FlowTube Universal Engine Works
                  </div>
                  <p className="text-[11px] text-content-tertiary leading-relaxed">
                    Google serves <code>X-Frame-Options: SAMEORIGIN</code> on <code>youtube.com</code> to prevent clickjacking of account cookies. FlowTube queries YouTube’s live catalog in real time and streams videos through YouTube’s official Embed Engine (<code>youtube.com/embed/...</code>), providing unrestricted access to the entire YouTube library directly inside FlowOS!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab.isLoading ? (
          /* Loading State */
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary animate-spin mb-3">
              <RotateCw className="h-5 w-5" />
            </div>
            <div className="font-medium text-xs text-content-primary">
              {activeTab.mode === 'reader' ? 'Loading Reader View via Proxy...' : 'Connecting to host...'}
            </div>
            <div className="mt-1 font-mono text-[10px] text-content-tertiary truncate max-w-sm">
              {activeTab.url}
            </div>
          </div>
        ) : activeTab.mode === 'reader' ||
          (activeTab.mode === 'vfs' && activeTab.srcDoc) ||
          (activeTab.mode === 'local' && activeTab.srcDoc) ? (
          /* Rendered via srcDoc (Reader mode or Local HTML / Markdown / Code) */
          <div className="relative h-full w-full">
            <iframe
              title={activeTab.title}
              srcDoc={activeTab.srcDoc}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="h-full w-full border-none bg-surface-panel"
            />
          </div>
        ) : (activeTab.mode === 'vfs' || activeTab.mode === 'local') && activeTab.mediaSrc ? (
          /* Rendered Media / PDF from Local or VFS */
          <div className="flex h-full w-full items-center justify-center bg-black/90 p-4">
            {activeTab.mediaSrc.startsWith('data:image/') ? (
              <img
                src={activeTab.mediaSrc}
                alt={activeTab.title}
                className="max-h-full max-w-full object-contain rounded shadow-lg"
              />
            ) : (
              <iframe
                title={activeTab.title}
                src={activeTab.mediaSrc}
                className="h-full w-full border-none"
              />
            )}
          </div>
        ) : (
          /* Direct / Proxied Web Embed Iframe */
          <div className="relative h-full w-full">
            <iframe
              key={activeTab.refreshKey}
              src={
                activeTab.url.includes('google.')
                  ? activeTab.url.includes('igu=1')
                    ? activeTab.url
                    : `${activeTab.url}${activeTab.url.includes('?') ? '&' : '?'}igu=1`
                  : activeTab.url.startsWith('http') &&
                    !activeTab.url.includes('localhost:') &&
                    !activeTab.url.includes('youtube.com/embed/')
                  ? `/api/proxy?url=${encodeURIComponent(activeTab.url)}`
                  : activeTab.url
              }
              title={activeTab.title}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-presentation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="no-referrer"
              allowFullScreen
              className="h-full w-full border-none bg-white"
            />

            {/* Smart Banner: Provides status and 1-click Reader Mode fallback */}
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-panel/95 backdrop-blur px-3 py-1.5 text-[11px] shadow-lg select-none">
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Unblocked Proxy
              </span>
              <span className="text-content-tertiary">|</span>
              <button
                onClick={handleToggleReader}
                className="flex items-center gap-1 rounded bg-amber-400/20 px-2 py-0.5 font-medium text-amber-300 hover:bg-amber-400/30 transition-colors cursor-pointer"
                title="Bypass X-Frame-Options with Jina Reader Engine"
              >
                <Zap className="h-3 w-3" />
                <span>Reader Mode</span>
              </button>
              <span className="text-content-tertiary">|</span>
              <a
                href={activeTab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-accent-primary hover:underline font-medium"
              >
                <span>New Window</span>
                <ExternalLink className="h-3 w-3" />
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
  description: 'Multi-mode web browser with direct embed, universal YouTube engine, reader mode bypass, and host device file support.',
  category: 'productivity',
  icon: Globe,
  defaultSize: { width: 840, height: 580 },
  constraints: { minWidth: 480, minHeight: 320, maxWidth: 1600, maxHeight: 1100 },
  allowMultipleInstances: true,
  permissions: [],
  component: BrowserApp,
};
