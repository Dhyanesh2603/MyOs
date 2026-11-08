import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

function flowOsBrowserProxyPlugin(): Plugin {
  return {
    name: 'flowos-browser-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        // 1. YouTube Live Search API: /api/youtube/search?q=...
        if (req.url.startsWith('/api/youtube/search')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            const query = urlObj.searchParams.get('q') || '';
            const ytResp = await fetch(
              `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
              {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept-Language': 'en-US,en;q=0.9',
                },
              }
            );
            const html = await ytResp.text();
            const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/s);
            let videos: Array<{ id: string; title: string; channel: string; thumbnail: string }> = [];
            if (match && match[1]) {
              try {
                const data = JSON.parse(match[1]);
                const contents =
                  data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
                    ?.contents?.[0]?.itemSectionRenderer?.contents || [];
                videos = contents
                  .filter((c: any) => c.videoRenderer && c.videoRenderer.videoId)
                  .map((c: any) => ({
                    id: c.videoRenderer.videoId,
                    title: c.videoRenderer.title?.runs?.[0]?.text || 'YouTube Video',
                    channel: c.videoRenderer.ownerText?.runs?.[0]?.text || '',
                    thumbnail:
                      c.videoRenderer.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
                      `https://i.ytimg.com/vi/${c.videoRenderer.videoId}/hqdefault.jpg`,
                  }));
              } catch {
                // fallback
              }
            }

            // Fallback regex if ytInitialData parse fails
            if (videos.length === 0) {
              const regex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
              const seen = new Set<string>();
              let m: RegExpExecArray | null;
              while ((m = regex.exec(html)) !== null && videos.length < 15) {
                const vid = m[1];
                if (vid && !seen.has(vid)) {
                  seen.add(vid);
                  videos.push({
                    id: vid,
                    title: `YouTube Video (${vid})`,
                    channel: 'YouTube',
                    thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
                  });
                }
              }
            }

            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify({ success: true, videos }));
            return;
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ success: false, error: err.message, videos: [] }));
            return;
          }
        }

        // 2. Universal Unblock Proxy: /api/proxy?url=...
        if (req.url.startsWith('/api/proxy')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3000');
            let targetUrl = urlObj.searchParams.get('url');
            if (!targetUrl) {
              res.writeHead(400, { 'Content-Type': 'text/plain' });
              res.end('Missing url parameter');
              return;
            }

            // Ensure Google requests always carry the official igu=1 iframe embed parameter
            let effectiveUrl = targetUrl;
            try {
              const parsedTarget = new URL(targetUrl);
              if (parsedTarget.hostname.includes('google.')) {
                parsedTarget.searchParams.set('igu', '1');
                effectiveUrl = parsedTarget.toString();
              }
            } catch {
              // Ignore parse error
            }

            const proxyResp = await fetch(effectiveUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
              },
              redirect: 'follow',
            });

            const rawContentType = proxyResp.headers.get('content-type') || 'text/html';
            const contentType = rawContentType.split(';')[0]?.trim() || 'text/html';

            const headers: Record<string, string> = {
              'Content-Type': rawContentType,
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            };

            if (contentType === 'text/html' || rawContentType.includes('text/html')) {
              let html = await proxyResp.text();
              const baseHref = proxyResp.url || effectiveUrl;
              const baseTag = `<base href="${baseHref}">`;

              // Client-side interceptor: ensures link clicks and form submissions route back through /api/proxy
              const interceptorScript = `
<script data-flowos-interceptor="true">
(function() {
  if (window.__flowos_proxy_active) return;
  window.__flowos_proxy_active = true;

  var currentBase = "${baseHref}";

  function toProxy(raw) {
    try {
      if (!raw) return raw;
      var str = String(raw).trim();
      if (str.startsWith('javascript:') || str.startsWith('data:') || str.startsWith('blob:') || str.startsWith('#')) {
        return raw;
      }
      var targetObj = new URL(str, currentBase);
      if (targetObj.origin === window.location.origin && targetObj.pathname.startsWith('/api/proxy')) {
        return targetObj.href;
      }
      // Retain igu=1 for Google searches and links
      if (targetObj.hostname.includes('google.')) {
        targetObj.searchParams.set('igu', '1');
        return targetObj.href;
      }
      // Rewriting YouTube video links
      if (targetObj.hostname.includes('youtube.com') && targetObj.searchParams.has('v')) {
        var v = targetObj.searchParams.get('v');
        return 'https://www.youtube.com/embed/' + v + '?autoplay=1&enablejsapi=1&rel=0';
      }
      return '/api/proxy?url=' + encodeURIComponent(targetObj.href);
    } catch (e) {
      return raw;
    }
  }

  // Intercept all link clicks in capture phase
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    var proxied = toProxy(href);
    if (proxied && proxied !== href) {
      if (a.getAttribute('target') === '_blank') {
        a.href = proxied;
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
      try {
        var resolved = new URL(href, currentBase).href;
        window.parent.postMessage({ type: 'flowos:browser:navigate', url: resolved }, '*');
      } catch (err) {}
      window.location.href = proxied;
    }
  }, true);

  // Intercept all form submissions (e.g. Google Search, DuckDuckGo search) in capture phase
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form) return;
    var rawAction = form.getAttribute('action') || '';
    var method = (form.method || 'GET').toUpperCase();

    if (method === 'GET') {
      e.preventDefault();
      e.stopImmediatePropagation();

      var formData = new FormData(form);
      var params = new URLSearchParams();
      formData.forEach(function(val, key) {
        params.append(key, String(val));
      });

      var actionObj = new URL(rawAction || currentBase, currentBase);
      actionObj.search = params.toString();
      var finalUrl = actionObj.href;

      if (actionObj.hostname.includes('google.') && (actionObj.pathname === '/search' || actionObj.pathname.startsWith('/search') || rawAction.includes('search'))) {
        actionObj.searchParams.set('igu', '1');
        finalUrl = actionObj.href;
      }

      try {
        window.parent.postMessage({ type: 'flowos:browser:navigate', url: finalUrl }, '*');
      } catch (err) {}

      window.location.href = toProxy(finalUrl);
    } else {
      form.action = toProxy(rawAction);
    }
  }, true);
})();
</script>`;

              if (html.includes('<head>')) {
                html = html.replace('<head>', `<head>${baseTag}${interceptorScript}`);
              } else if (html.includes('<head ')) {
                html = html.replace(/<head[^>]*>/, `$&${baseTag}${interceptorScript}`);
              } else {
                html = `${baseTag}${interceptorScript}${html}`;
              }

              // Strip frame busters
              html = html.replace(/top\.location\s*=\s*(self\.location|location)/gi, '/* blocked */');
              html = html.replace(/window\.top\.location\s*=/gi, '/* blocked */');

              res.writeHead(proxyResp.status, headers);
              res.end(html);
              return;
            }

            const arrayBuffer = await proxyResp.arrayBuffer();
            res.writeHead(proxyResp.status, headers);
            res.end(Buffer.from(arrayBuffer));
            return;
          } catch (err: any) {
            res.writeHead(502, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
            res.end(
              `<!DOCTYPE html><html><body style="background:#0b0f17;color:#f87171;font-family:sans-serif;padding:30px;"><h3>Proxy Navigation Error</h3><p>${err.message}</p></body></html>`
            );
            return;
          }
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), flowOsBrowserProxyPlugin()],
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@shell': fileURLToPath(new URL('./src/shell', import.meta.url)),
      '@design': fileURLToPath(new URL('./src/design', import.meta.url)),
      '@apps': fileURLToPath(new URL('./src/apps', import.meta.url)),
      '@contracts': fileURLToPath(new URL('./src/contracts', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
