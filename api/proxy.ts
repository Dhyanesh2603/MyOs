export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get('url');

  if (!target) {
    return new Response('Missing url parameter', { status: 400 });
  }

  try {
    let effectiveUrl = target;
    try {
      const parsed = new URL(target);
      if (parsed.hostname.includes('google.')) {
        parsed.searchParams.set('igu', '1');
        effectiveUrl = parsed.toString();
      }
    } catch {}

    const resp = await fetch(effectiveUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    const contentType = resp.headers.get('content-type') || 'text/html';
    const newHeaders = new Headers();
    newHeaders.set('Content-Type', contentType);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', '*');

    // Strip frame restrictions by omitting X-Frame-Options and Content-Security-Policy

    if (contentType.includes('text/html')) {
      let html = await resp.text();
      const baseTag = `<base href="${resp.url || effectiveUrl}">`;

      // Interceptor script to route relative links and forms back through /api/proxy
      const interceptor = `
<script data-onyx-interceptor="true">
(function() {
  if (window.__onyx_proxy_active) return;
  window.__onyx_proxy_active = true;
  var currentBase = "${resp.url || effectiveUrl}";
  function toProxy(raw) {
    try {
      if (!raw) return raw;
      var str = String(raw).trim();
      if (str.startsWith('javascript:') || str.startsWith('data:') || str.startsWith('blob:') || str.startsWith('#')) return raw;
      var obj = new URL(str, currentBase);
      if (obj.origin === window.location.origin && obj.pathname.startsWith('/api/proxy')) return obj.href;
      if (obj.hostname.includes('google.')) { obj.searchParams.set('igu', '1'); return obj.href; }
      if (obj.hostname.includes('youtube.com') && obj.searchParams.has('v')) {
        return 'https://www.youtube.com/embed/' + obj.searchParams.get('v') + '?autoplay=1&enablejsapi=1&rel=0';
      }
      return '/api/proxy?url=' + encodeURIComponent(obj.href);
    } catch (e) { return raw; }
  }
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    var proxied = toProxy(href);
    if (proxied && proxied !== href) {
      if (a.getAttribute('target') === '_blank') { a.href = proxied; return; }
      e.preventDefault();
      e.stopImmediatePropagation();
      try {
        var resolved = new URL(href, currentBase).href;
        window.parent.postMessage({ type: 'onyx:browser:navigate', url: resolved }, '*');
        window.parent.postMessage({ type: 'flowos:browser:navigate', url: resolved }, '*');
      } catch (err) {}
      window.location.href = proxied;
    }
  }, true);

  // Intercept form submissions (e.g. search forms)
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
      formData.forEach(function(val, key) { params.append(key, String(val)); });
      var actionObj = new URL(rawAction || currentBase, currentBase);
      actionObj.search = params.toString();
      var finalUrl = actionObj.href;
      if (actionObj.hostname.includes('google.') && (actionObj.pathname === '/search' || actionObj.pathname.startsWith('/search') || rawAction.includes('search'))) {
        actionObj.searchParams.set('igu', '1');
        finalUrl = actionObj.href;
      }
      try {
        window.parent.postMessage({ type: 'onyx:browser:navigate', url: finalUrl }, '*');
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
        html = html.replace('<head>', `<head>${baseTag}${interceptor}`);
      } else if (html.includes('<head ')) {
        html = html.replace(/<head[^>]*>/, `$&${baseTag}${interceptor}`);
      } else {
        html = `${baseTag}${interceptor}${html}`;
      }

      // Remove frame busting code
      html = html.replace(/top\.location\s*=\s*(self\.location|location)/gi, '/* blocked */');
      html = html.replace(/window\.top\.location\s*=/gi, '/* blocked */');

      return new Response(html, { status: resp.status, headers: newHeaders });
    }

    return new Response(resp.body, { status: resp.status, headers: newHeaders });
  } catch (err: any) {
    return new Response(
      `<!DOCTYPE html><html><body style="background:#0b0f17;color:#f87171;font-family:sans-serif;padding:30px;"><h3>Proxy Navigation Error</h3><p>${err.message}</p></body></html>`,
      { status: 502, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
