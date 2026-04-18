# Technology Stack

**Analysis Date:** 2026-04-18

## Languages

**Primary:**
- JavaScript (ES6+) - Node.js CLI entry point, browser extension content scripts, web frontend, core library (`src/shudu.js`, `index.js`, `browser_ext/*.js`, `web/public/javascripts/*.js`)
- Go 1.17 - CLI tool (`cli/main.go`) and desktop GUI (`gui/main.go`)

**Secondary:**
- HTML/CSS - Web frontend (`web/index.html`, `web/public/stylesheets/style.css`, `browser_ext/options.html`, `browser_ext/welcome.html`)
- WebAssembly (WASM) - OpenCC conversion engine (`src/opencc.wasm`, `web/public/libs/opencc/opencc.wasm`, `browser_ext/libs/opencc/opencc.wasm`)

**Approximate distribution:**
- JavaScript: ~50%
- Go: ~20%
- HTML/CSS: ~15%
- WebAssembly (pre-compiled binary): ~10%
- Other (JSON config, Makefile): ~5%

## Runtime

**Environment:**
- Node.js 24 (specified in CI via `actions/setup-node@v4` with `node-version: '24'`)
- Go 1.17+ (specified in `cli/go.mod` and `gui/go.mod`)

**Package Manager:**
- npm (implied by `package.json`)
- Lockfile: Not present in repository (no `package-lock.json` detected)

## Frameworks

**Desktop GUI:**
- Fyne v2.3.1 (`fyne.io/fyne/v2`) - Cross-platform GUI framework for Go (`gui/main.go`)
- fyne.io/systray v1.10.1 - System tray support (indirect, `gui/go.sum`)

**Browser Extension:**
- Manifest V3 (Chrome/Chromium) — `browser_ext/manifest-chrome.json`, `browser_ext/manifest.json`
- Manifest V2/Firefox compatible — `browser_ext/manifest-firefox.json`
- Materialize CSS v? — UI framework for extension options page (`browser_ext/libs/materialize.min.css`, `browser_ext/libs/materialize.min.js`)

**Web Frontend:**
- Vanilla JS (no framework) — `web/public/javascripts/`
- jQuery 3.4.1 (CDN) — loaded in `web/index.html`
- TinyMCE 4.5.12 (CDN) — rich text editor loaded in `web/index.html`
- Google Fonts (Inter) — loaded via CDN in `web/index.html`

**Testing:**
- No dedicated test framework detected; CI uses inline shell assertion (`main.yml`)

**Build/Dev:**
- GNU Make — browser extension packaging (`browser_ext/Makefile`)
- zip — used in Makefile to produce extension archives

## Key Dependencies

**Node.js (production):**
- `opencc` ^1.1.2 — OpenCC Chinese conversion library (npm package, `package.json`)

**Node.js (dev):**
- `eslint` ^6.8.0 — JavaScript linting
- `eslint-config-airbnb-base` ^14.1.0 — Airbnb linting ruleset
- `eslint-plugin-import` ^2.20.2 — import/export linting

**Go CLI (`cli/go.mod`):**
- `github.com/liuzl/goutil` v0.0.0-20210628080224 — line-by-line processing utility
- `github.com/longbridgeapp/opencc` v0.1.0 — OpenCC Go bindings for Chinese conversion
- `github.com/vinta/pangu` v3.0.0 — Pangu spacing (auto-spacing between CJK and Latin text)
- `github.com/liuzl/cedar-go` (indirect) — trie/cedar data structure
- `github.com/liuzl/da` (indirect) — double-array dependency

**Go GUI (`gui/go.mod`):**
- `fyne.io/fyne/v2` v2.3.1 — GUI framework
- `github.com/flopp/go-findfont` v0.1.0 — system font finder
- `github.com/golang/freetype` v0.0.0-20170609 — TrueType font rendering
- `github.com/longbridgeapp/opencc` v0.1.0 — Chinese conversion (same as CLI)
- `github.com/vinta/pangu` v3.0.0 — Pangu spacing (same as CLI)

**Bundled/Vendored Libraries (no build step):**
- OpenCC WASM (`opencc.js` + `opencc.wasm`) — pre-compiled, included in `src/`, `web/public/libs/opencc/`, `browser_ext/libs/opencc/`
- pangu.js — bundled in `src/pangu.js`, `web/public/javascripts/pangu.js`, `browser_ext/libs/pangu.js`
- jQuery — bundled in `browser_ext/libs/jquery.min.js`; CDN in `web/index.html`

## Configuration

**Environment:**
- No `.env` file detected; no server-side secrets required (processing is client-side/local)
- Cloudflare Workers assets configured via `wrangler.toml` (compatibility_date: 2026-01-19, serves `web/` directory)

**Build:**
- `wrangler.toml` — Cloudflare deployment config
- `browser_ext/Makefile` — browser extension packaging
- `.jshintrc` — JSHint config (esversion: 6)
- ESLint config in `package.json` (via `eslint-config-airbnb-base`)
- `gui/FyneApp.toml` — Fyne desktop app metadata

## Platform Requirements

**Development:**
- Node.js 24
- Go 1.17+
- GNU Make (for browser extension builds)
- zip utility

**Production:**
- Web: Cloudflare Workers (static assets via `wrangler.toml`)
- Browser Extension: Chrome Web Store and Firefox Add-ons (packaged as `.zip`)
- CLI: Binary compiled from `cli/main.go` (cross-platform Go binary)
- GUI: Binary compiled from `gui/main.go` (requires system font "Arial Unicode.ttf")

---

*Stack analysis: 2026-04-18*
