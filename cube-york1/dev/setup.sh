#!/usr/bin/env bash
# Prepara i test visivi di Cube York (Linux, WSL, ambiente cloud di Claude Code). Basta una volta per sessione.
# - three.js 0.147 in dev/lib: i test lo servono in locale (nel cloud il CDN può essere bloccato)
# - Playwright per Python + un Chromium (se il download di Playwright è bloccato: Chrome for Testing in dev/.browsers)
set -u
cd "$(dirname "$0")"
if [ ! -f lib/package/build/three.min.js ]; then
  mkdir -p lib
  ( cd lib && npm pack three@0.147.0 --silent >/dev/null 2>&1 && tar xzf three-0.147.0.tgz && rm -f three-0.147.0.tgz ) \
    && echo "three.js 0.147 pronto" || echo "three.js non scaricato: i test lo prenderanno dal CDN"
fi
python3 -c "import playwright" 2>/dev/null || python3 -m pip install --quiet playwright 2>/dev/null \
  || python3 -m pip install --quiet --break-system-packages playwright
if python3 -m playwright install chromium >/dev/null 2>&1; then
  echo "Chromium di Playwright pronto"
else
  echo "Chromium di Playwright non scaricabile: provo Chrome for Testing"
  npx --yes @puppeteer/browsers install chrome-headless-shell@stable --path "$PWD/.browsers" >/dev/null 2>&1 \
    && echo "Chrome for Testing pronto in dev/.browsers (shoot.py lo trova da solo)" \
    || echo "ATTENZIONE: nessun browser per i test; build e controllo di sintassi funzionano lo stesso"
fi
