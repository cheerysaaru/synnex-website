"""After `npm run build`: give every public page its own real HTML file.

Search engines and link previews (WhatsApp, Facebook) then see each page's
own title, description, canonical address and text straight away, instead of
the same empty shell for every address. The React app still starts as usual
and takes over the page.

Writes into dist/:
  _p/<page>.html   one rendered page per public route
  sitemap.xml      all public pages on https://synnex-technology.com
  .htaccess        redirects to the one official address, then serves the
                   rendered pages, the quotation tool and the app fallback

Usage: python3 scripts/postbuild_seo.py [dist] (needs `pip install playwright`
and `python -m playwright install chromium`; CHROME=/path uses another browser).
"""
import datetime
import http.server
import json
import os
import re
import subprocess
import sys
import threading

from playwright.sync_api import sync_playwright

SITE = 'https://synnex-technology.com'
DIST = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else 'dist')
HERE = os.path.dirname(os.path.abspath(__file__))
PORT = 4179

routes = json.loads(subprocess.check_output(['node', os.path.join(HERE, 'routes.mjs')], cwd=os.path.dirname(HERE)))
shell = open(os.path.join(DIST, 'index.html'), encoding='utf-8').read()


class Handler(http.server.SimpleHTTPRequestHandler):
    """Serves dist/ with the app fallback; /api calls get a quick 401 (logged out)."""

    def __init__(self, *a, **k):
        super().__init__(*a, directory=DIST, **k)

    def log_message(self, *a):
        pass

    def do_GET(self):
        path = self.path.split('?')[0]
        if path.startswith('/api/') or 'api.synnex-technology.com' in self.path:
            self.send_response(401)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"message":"Unauthenticated."}')
            return
        if not os.path.isfile(os.path.join(DIST, path.lstrip('/'))):
            self.path = '/index.html'
        return super().do_GET()


server = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()


def page_file(route):
    return 'home' if route == '/' else route.strip('/').replace('/', '__')


def tidy(html):
    """Undo things the browser changed while rendering that must not be baked in."""
    # Google Fonts must stay non-blocking (the onload handler already ran here).
    html = re.sub(
        r'<link rel="stylesheet" href="(https://fonts\.googleapis\.com/css2[^"]+)" media="all" onload="this\.media=\'all\'">',
        r'<link rel="stylesheet" href="\1" media="print" onload="this.media=\'all\'">',
        html,
    )
    # The hero video is chosen per screen size by the app; don't start a download here.
    html = re.sub(r'(<video class="lh-video"[^>]*?) src="[^"]*"', r'\1', html)
    # The cookie banner depends on each visitor's choice; the app shows it itself.
    html = re.sub(r'<section class="sck".*?</section>', '', html, flags=re.S)
    # Per-visitor state that the app sets again on load.
    html = re.sub(r'<body([^>]*?) class="cookie-open"', r'<body\1', html)
    html = html.replace(' class="cookie-open"', '')
    return html


written = []
with sync_playwright() as p:
    opts = {'args': ['--no-sandbox']}
    if os.environ.get('CHROME'):
        opts['executable_path'] = os.environ['CHROME']
    browser = p.chromium.launch(**opts)
    ctx = browser.new_context(viewport={'width': 1366, 'height': 900}, locale='en-US')
    # Outside resources (photos, Google Fonts) are not needed to render the HTML.
    ctx.route(re.compile(r'^https://(images\.unsplash\.com|fonts\.(googleapis|gstatic)\.com)/'), lambda r: r.abort())
    # Render every page as a logged-out visitor, without calling the live API.
    ctx.route(re.compile(r'^https://api\.synnex-technology\.com/'), lambda r: r.fulfill(status=401, content_type='application/json', body='{"message":"Unauthenticated."}'))
    os.makedirs(os.path.join(DIST, '_p'), exist_ok=True)
    for route in routes:
        page = ctx.new_page()
        page.goto(f'http://127.0.0.1:{PORT}{route}', wait_until='networkidle', timeout=60000)
        page.wait_for_timeout(800)
        canonical = page.eval_on_selector('link[rel=canonical]', 'e => e.href') if page.query_selector('link[rel=canonical]') else ''
        title = page.title()
        html = tidy('<!doctype html>\n' + page.evaluate('document.documentElement.outerHTML'))
        if 'could not be found' in html and route != '/':
            raise SystemExit(f'Route {route} rendered the 404 page')
        if canonical != SITE + (route if route != '/' else '/'):
            raise SystemExit(f'Route {route}: canonical is {canonical!r}')
        name = page_file(route)
        with open(os.path.join(DIST, '_p', f'{name}.html'), 'w', encoding='utf-8') as f:
            f.write(html)
        written.append((route, name))
        print(f'{route:45} {title[:60]}')
        page.close()
    browser.close()
server.shutdown()

# sitemap.xml
today = datetime.date.today().isoformat()
urls = '\n'.join(
    f'  <url><loc>{SITE}{r if r != "/" else "/"}</loc><lastmod>{today}</lastmod></url>' for r, _ in written
)
with open(os.path.join(DIST, 'sitemap.xml'), 'w', encoding='utf-8') as f:
    f.write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n')

# .htaccess (OpenLiteSpeed reads it after a restart)
page_rules = '\n'.join(
    ('RewriteRule ^$ /_p/home.html [L]' if r == '/' else f'RewriteRule ^{re.escape(r.strip("/"))}/?$ /_p/{n}.html [L]')
    for r, n in written
)
htaccess = f"""AddType text/javascript .mjs
RewriteEngine On
RewriteBase /

# One official address: https://synnex-technology.com (no www, always https)
RewriteCond %{{HTTP_HOST}} ^www\\.synnex-technology\\.com$ [NC]
RewriteRule ^(.*)$ {SITE}/$1 [R=301,L]
RewriteCond %{{HTTP:X-Forwarded-Proto}} ^http$
RewriteRule ^(.*)$ {SITE}/$1 [R=301,L]

# Admin quotation tool: its own app in /quotation-app, shown at /admin/quotation/
RewriteRule ^admin/quotation$ /admin/quotation/ [R=301,L]
RewriteRule ^admin/quotation/$ /quotation-app/index.html [L]
RewriteRule ^admin/quotation/(.+)$ /quotation-app/$1 [L]

# Public pages: ready-made HTML (generated by scripts/postbuild_seo.py)
{page_rules}

# Everything else: the app. Missing files (anything with an extension, e.g.
# /.well-known/ard.json or /old.png) get a real 404 instead of the app page.
RewriteRule ^index\\.html$ - [L]
RewriteCond %{{REQUEST_FILENAME}} !-f
RewriteCond %{{REQUEST_FILENAME}} !-d
RewriteCond %{{REQUEST_URI}} !\\.[A-Za-z0-9]{{1,8}}$
RewriteRule . /index.html [L]
"""
with open(os.path.join(DIST, '.htaccess'), 'w', encoding='utf-8') as f:
    f.write(htaccess)

assert open(os.path.join(DIST, 'index.html'), encoding='utf-8').read() == shell, 'index.html must stay the plain app shell'
print(f'\n{len(written)} pages, sitemap.xml and .htaccess written to {DIST}')
