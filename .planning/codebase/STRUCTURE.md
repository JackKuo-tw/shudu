# Directory Structure

## Top-Level Layout

```
shudu/
├── index.js              # Node.js CLI entry point (thin wrapper over src/)
├── package.json          # npm config (opencc dependency)
├── wrangler.toml         # Cloudflare Workers config (routes assets → web/)
├── .jshintrc             # JSHint linting config
├── .gitignore
├── LICENSE               # GPL
├── README.md
├── src/                  # Node.js core library + WASM artifacts
├── cli/                  # Go CLI tool
├── web/                  # Static web app (Cloudflare Workers)
├── browser_ext/          # Chrome + Firefox extension
├── gui/                  # Go Fyne desktop app
├── dict/                 # Dictionary diff reference file
└── .github/workflows/    # CI/CD
```

## `src/` — Node.js Core

```
src/
├── shudu.js          # Core logic: WASM init, convertText(), punctuate(), getArgText()
├── core.js           # Pangu regex definitions (Pangu class)
├── pangu.js          # Pangu spacing library (local copy)
├── opencc.js         # Emscripten WASM loader (61KB)
├── opencc.wasm       # OpenCC compiled to WASM (313KB)
├── s2twp.json        # Conversion config: Simplified → Traditional Taiwan
├── tw2sp.json        # Conversion config: Traditional Taiwan → Simplified
└── *.ocd2            # OpenCC dictionary binary files (9 files)
```

## `cli/` — Go CLI

```
cli/
├── main.go           # stdin→stdout pipeline, Go OpenCC + pangu
├── go.mod            # Go 1.17 module definition
├── go.sum
├── Makefile          # Build targets
└── shudu             # Pre-compiled binary (committed to repo)
```

## `web/` — Static Web App

```
web/
├── index.html        # Main UI (TinyMCE editor, toolbar)
├── addon.html        # Browser extension download/info page
└── public/
    ├── javascripts/
    │   ├── shudu.js  # WASM bootstrap + window.shudu API
    │   ├── query.js  # jQuery UI event handlers
    │   └── pangu.js  # Pangu spacing library
    ├── stylesheets/
    │   └── style.css
    └── libs/opencc/  # WASM + dictionaries (duplicate of src/)
```

## `browser_ext/` — Browser Extension

```
browser_ext/
├── shudu.js              # Content script: DOM traversal, CJK detection, conversion
├── background.js         # Service worker: toolbar click → message to tab
├── options.js            # Settings page logic
├── options.html          # Settings page UI
├── manifest.json         # Base manifest
├── manifest-chrome.json  # Chrome MV3 manifest
├── manifest-firefox.json # Firefox manifest
├── Makefile              # Builds .zip packages per browser
├── libs/
│   ├── opencc/           # WASM + dictionaries (duplicate of src/)
│   └── pangu.js
├── _locales/
│   ├── zh/messages.json
│   └── zh_TW/messages.json
└── icons/                # Extension icons
```

## `gui/` — Go Desktop GUI

```
gui/
├── main.go           # Fyne window, radio group, convert button
├── go.mod
├── go.sum
└── FyneApp.toml      # Fyne app metadata
```

## `dict/`

```
dict/
└── dictionary_diff_v1.txt  # Reference dictionary diff notes
```

## `.github/`

```
.github/workflows/
└── main.yml          # CI: build extension zips, smoke test, GitHub release on tags
```

## Module Boundaries

| Directory | Language | Dependency on others |
|-----------|----------|---------------------|
| `src/` | JavaScript | None (self-contained with WASM) |
| `cli/` | Go | None (Go-native OpenCC) |
| `web/` | JavaScript/HTML | Duplicates `src/` WASM artifacts |
| `browser_ext/` | JavaScript | Duplicates `src/` WASM artifacts |
| `gui/` | Go | None (Go-native OpenCC) |

Each surface is intentionally self-contained with no cross-dependencies.
