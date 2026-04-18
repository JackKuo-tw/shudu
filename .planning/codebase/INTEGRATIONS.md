# External Integrations

**Analysis Date:** 2026-04-18

## APIs & External Services

**Analytics:**
- Google Analytics (GA4) — tracking via `gtag.js`
  - Measurement ID: `G-XNL8RVH47B`
  - Loaded in: `web/index.html` (CDN script tag `https://www.googletagmanager.com/gtag/js`)
  - No server-side tracking; client-side only

**Fonts:**
- Google Fonts — Inter font family
  - Loaded in: `web/index.html` via `https://fonts.googleapis.com` and `https://fonts.gstatic.com`

**CDN-delivered Libraries:**
- jQuery 3.4.1 — `https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js` (loaded in `web/index.html`)
- TinyMCE 4.5.12 — `https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.5.12/tinymce.min.js` (loaded in `web/index.html`)

## Data Storage

**Databases:**
- None — no database is used; all text conversion is performed locally (in-browser WASM or local Go binary)

**File Storage:**
- Local filesystem only — CLI and GUI tools read/write from stdin/stdout or in-memory WASM FS
- Browser extension uses Chrome/Firefox `storage.sync` API for persisting user preferences (e.g., `whats_new` version key in `browser_ext/background.js`)

**Caching:**
- None — no caching layer detected

## Authentication & Identity

**Auth Provider:**
- None — no user accounts or authentication

## Cloud & Hosting

**Web Hosting:**
- Cloudflare Workers (static assets)
  - Config: `wrangler.toml`
  - Serves: `web/` directory
  - `compatibility_date = "2026-01-19"`
  - No KV, Durable Objects, or Workers logic — purely static asset serving

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Go CLI/GUI: `log.Fatal`, `log.Println` (standard library, stderr)
- Node.js: `console.log` / `console.error` (no structured logging)
- Browser extension: `console.log` (no error aggregation)

## CI/CD & Deployment

**CI/CD Platform:**
- GitHub Actions (`.github/workflows/main.yml`)

**Pipeline:**
- Triggers on push to `master` branch and all pull requests targeting `master`
- Triggers on tags matching `v*` (release workflow)
- Test job:
  1. Checkout code (`actions/checkout@v4`)
  2. Setup Node.js 24 (`actions/setup-node@v4`)
  3. Build browser extensions (`cd browser_ext && make`)
  4. Upload browser extension ZIP artifacts (`actions/upload-artifact@v4`)
  5. Run inline conversion test (shell assertion on Node.js output)
- Release job (tag-triggered, requires test job to pass):
  1. Checkout + build browser extensions
  2. Create GitHub Release with browser extension ZIPs (`softprops/action-gh-release@v2`, `generate_release_notes: true`)

**Deployment:**
- Web: Manual deploy to Cloudflare Workers via `wrangler` (no automated deploy in CI)
- Browser Extension: GitHub Releases (automated via release job); manual submission to Chrome Web Store / Firefox Add-ons
- CLI/GUI: No automated binary distribution pipeline detected

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Third-Party SDKs (bundled)

**OpenCC (Open Chinese Convert):**
- Used for Simplified ↔ Traditional Chinese conversion
- Distributed as pre-compiled WASM (`opencc.wasm` + `opencc.js`) in:
  - `src/opencc.wasm` (Node.js runtime)
  - `web/public/libs/opencc/opencc.wasm` (web frontend)
  - `browser_ext/libs/opencc/opencc.wasm` (browser extension)
- Also used via Go binding `github.com/longbridgeapp/opencc` in `cli/main.go` and `gui/main.go`
- Conversion config files (`.ocd2`, `.json`) bundled alongside WASM in all three locations

**pangu.js / pangu (Go):**
- Adds spacing between CJK and Latin characters for readability
- JavaScript: `src/pangu.js`, `web/public/javascripts/pangu.js`, `browser_ext/libs/pangu.js`
- Go: `github.com/vinta/pangu` in `cli/main.go` and `gui/main.go`

**Materialize CSS:**
- UI framework for browser extension options page
- Bundled at `browser_ext/libs/materialize.min.css` and `browser_ext/libs/materialize.min.js`

## Environment Configuration

**Required env vars:**
- None — no environment variables required for any component

**Secrets location:**
- No secrets detected; the application performs all processing locally (client-side WASM or local Go binary)
- Cloudflare deployment may require `CLOUDFLARE_API_TOKEN` set in CI secrets (not found in workflow file — deploy is manual)

---

*Integration audit: 2026-04-18*
