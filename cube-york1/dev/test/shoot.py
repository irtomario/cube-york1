#!/usr/bin/env python3
"""Banco di prova per Cube York.
Uso: python3 dev/test/shoot.py dev/test/<x>_def.json [--q alta] [--w 640 --h 360] [--touch] [--gpu] [--port N]
<x>_def.json = lista di {"name": "...", "js": "codice", "shot": true/false, "page": true/false, "out": "file.json"}
Serve la radice del repository (index.html generato da dev/build.py), salva le immagini in dev/shots/<name>.jpg
(dev/shots/<name>_page.png con "page") e stampa gli errori della pagina e della console.
Senza --gpu usa SwiftShader (rendering su CPU: lento ma uguale ovunque). Chrome alternativo: variabile CUBE_CHROME
oppure quello scaricato da dev/setup.sh in dev/.browsers.
"""
import sys, json, time, base64, argparse, os, threading, http.server, socketserver, functools

ap = argparse.ArgumentParser()
ap.add_argument('shots')
ap.add_argument('--html', default='index.html')
ap.add_argument('--q', default='media')
ap.add_argument('--w', type=int, default=640)
ap.add_argument('--h', type=int, default=360)
ap.add_argument('--port', type=int, default=8765)
ap.add_argument('--init', default='')
ap.add_argument('--timeout', type=int, default=900000)
ap.add_argument('--touch', action='store_true')
ap.add_argument('--gpu', action='store_true')
args = ap.parse_args()

DEV = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # cartella dev/
ROOT = os.path.dirname(DEV)                                          # radice del repository
SHOTS = os.path.join(DEV, 'shots')
os.makedirs(SHOTS, exist_ok=True)
LIB = os.path.join(DEV, 'lib', 'package')
import glob
CHROME = os.environ.get('CUBE_CHROME') or next(iter(sorted(glob.glob(os.path.join(DEV, '.browsers', '**', 'chrome-headless-shell'), recursive=True) + glob.glob(os.path.join(DEV, '.browsers', '**', 'chrome-headless-shell.exe'), recursive=True))), None)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

def serve():
    handler = functools.partial(Quiet, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), handler) as httpd:
        httpd.serve_forever()

threading.Thread(target=serve, daemon=True).start()
time.sleep(0.5)

from playwright.sync_api import sync_playwright

shots = json.load(open(args.shots))
t0 = time.time()
with sync_playwright() as p:
    largs = ['--autoplay-policy=no-user-gesture-required', '--ignore-gpu-blocklist'] + ([] if args.gpu else ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=angle'])
    b = p.chromium.launch(args=largs, executable_path=CHROME) if CHROME and os.path.isfile(CHROME) else p.chromium.launch(args=largs)
    pg = b.new_page(viewport={'width': args.w, 'height': args.h}, has_touch=args.touch, is_mobile=args.touch)
    pg.set_default_timeout(args.timeout)
    errs = []
    pg.on('pageerror', lambda e: (errs.append(str(e)), print('PAGEERROR', e, (getattr(e,'stack',None) or '')[:1200], flush=True)))
    def onconsole(m):
        if m.type in ('error', 'warning'):
            t = m.text
            if 'GPU stall' in t or 'GL Driver Message' in t:
                return
            print('CONSOLE', m.type, t[:600], flush=True)
    pg.on('console', onconsole)
    def route_three(r):
        r.fulfill(path=os.path.join(LIB, 'build', 'three.min.js'), content_type='application/javascript')
    def route_sky(r):
        r.fulfill(path=os.path.join(LIB, 'examples', 'js', 'objects', 'Sky.js'), content_type='application/javascript')
    if os.path.isfile(os.path.join(LIB, 'build', 'three.min.js')):   # three.js locale (dev/setup.sh); altrimenti dal CDN
        pg.route('**/three@0.147.0/build/three.min.js', route_three)
        pg.route('**/three@0.147.0/examples/js/objects/Sky.js', route_sky)
    pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    pg.route('https://fonts.gstatic.com/**', lambda r: r.abort())
    pg.add_init_script("try{localStorage.setItem('cubeyork_q', JSON.stringify('%s'))}catch(e){}" % args.q)
    if args.init:
        pg.add_init_script(args.init)
    pg.goto('http://127.0.0.1:%d/%s' % (args.port, args.html))
    pg.wait_for_function('window.__ready===true', timeout=args.timeout)
    print('READY after %.1fs' % (time.time() - t0), flush=True)
    for s in shots:
        t1 = time.time()
        try:
            res = pg.evaluate("async ()=>{%s}" % s.get('js', ''))
            if res is not None:
                if s.get('out'):
                    json.dump(res, open(os.path.join(DEV, 'test', s['out']), 'w'))
                    print('  ', s['name'], 'js-> saved', s['out'], flush=True)
                else:
                    print('  ', s['name'], 'js->', json.dumps(res)[:1500], flush=True)
            if s.get('page'):
                pg.screenshot(path=os.path.join(SHOTS, s['name'] + '_page.png'))
                print('PAGESHOT', s['name'], flush=True)
            if s.get('shot', True):
                png = bool(s.get('png'))
                img = pg.evaluate("()=>{render();return canvas.toDataURL('image/%s',.9)}" % ('png' if png else 'jpeg'))
                data = base64.b64decode(img.split(',', 1)[1])
                fn = os.path.join(SHOTS, s['name'] + ('.png' if png else '.jpg'))
                open(fn, 'wb').write(data)
                print('SHOT', s['name'], '%.1fs' % (time.time() - t1), flush=True)
        except Exception as e:
            print('SHOTERROR', s['name'], str(e)[:1500], flush=True)
    b.close()
print('DONE %.1fs, page errors: %d' % (time.time() - t0, len(errs)), flush=True)
