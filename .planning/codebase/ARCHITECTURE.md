# Architecture

## Overview

Shudu is a multi-surface Chinese text processing tool that performs two functions:
1. **Script conversion** — Simplified ↔ Traditional Chinese (via OpenCC)
2. **Pangu spacing** — adds CJK-friendly spacing between Chinese and Latin text

Five independent surfaces share the same conceptual pipeline but different runtimes:

## Components

### 1. Node.js Core (`src/`, `index.js`)
- CLI entry via `index.js` → `src/shudu.js`
- Uses OpenCC compiled to WASM (Emscripten), loaded via `src/opencc.js`
- **WASM MEMFS pattern:** writes `input.txt` to virtual FS → calls `Module.callMain()` → reads `output.txt`
- Pangu spacing applied via `src/pangu.js` + `src/core.js` (regex definitions)
- Conversion configs: `src/s2twp.json` (Simplified→Traditional Taiwan), `src/tw2sp.json` (reverse)
- Dictionary binaries: 9 × `.ocd2` files bundled in `src/`

### 2. Go CLI (`cli/`)
- stdin→stdout pipeline
- Uses Go-native OpenCC: `github.com/longbridgeapp/opencc`
- Go pangu library for spacing
- Pre-compiled binary at `cli/shudu`

### 3. Web App (`web/`)
- Static site deployed on **Cloudflare Workers** (`wrangler.toml`)
- Same WASM pattern as Node.js but browser-side
- UI: TinyMCE rich text editor + jQuery event handlers + Google Analytics
- WASM + dictionaries duplicated under `web/public/libs/opencc/`

### 4. Browser Extension (`browser_ext/`)
- Supports Chrome (MV3) and Firefox
- **Background service worker** (`background.js`): listens for toolbar click → sends `'shudu it'` message to active tab
- **Content script** (`shudu.js`): 
  - Traverses DOM (including shadow DOM)
  - Detects CJK text nodes
  - Batches strings with `\n<<<<SHUDU_SEP>>>>\n` separator into single WASM call
  - Replaces text nodes in-place after conversion
- Settings page (`options.html/js`) for user preferences
- WASM + dictionaries duplicated under `browser_ext/libs/opencc/`

### 5. Go GUI (`gui/`)
- Desktop app built with **Fyne** framework
- Radio group for conversion direction selection
- Same Go-native OpenCC + pangu as CLI

## Data Flow

```
User Input
    ↓
[Surface: Node CLI / Web / Browser Ext / Go CLI / Go GUI]
    ↓
Script Conversion (OpenCC WASM or Go-native OpenCC)
    ↓
Pangu Spacing (pangu.js or Go pangu)
    ↓
Output
```

## Deployment Topology

- **Web:** Cloudflare Workers serving static assets from `web/` directory
- **CLI (Node):** npm package, run with `node index.js`
- **CLI (Go):** Pre-compiled binary, or `go build` from `cli/`
- **Browser Extension:** `.zip` packages built via `browser_ext/Makefile`, uploaded to Chrome Web Store / Firefox AMO
- **GUI:** Go binary built from `gui/`
- **CI/CD:** GitHub Actions — builds extension artifacts, runs smoke test, publishes GitHub releases on tags

## Key Design Decisions

- WASM is duplicated across `src/`, `web/public/libs/opencc/`, and `browser_ext/libs/opencc/` — each surface is self-contained
- Node.js and browser surfaces use WASM for OpenCC; Go surfaces use native Go bindings
- No shared backend/API — all conversion is client-side
