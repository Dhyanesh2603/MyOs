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
            const targetUrl = urlObj.searchParams.get('url');
            if (!targetUrl) {
              res.writeHead(400, { 'Content-Type': 'text/plain' });
              res.end('Missing url parameter');
              return;
            }

            const proxyResp = await fetch(targetUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
              const baseTag = `<base href="${proxyResp.url || targetUrl}">`;
              if (html.includes('<head>')) {
                html = html.replace('<head>', `<head>${baseTag}`);
              } else if (html.includes('<head ')) {
                html = html.replace(/<head[^>]*>/, `$&${baseTag}`);
              } else {
                html = `${baseTag}${html}`;
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
