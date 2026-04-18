# Codebase Concerns

**Analysis Date:** 2026-04-18

---

## Tech Debt

### Unimplemented Features (stated in README TODO)

**Severity: MED**
- Issue: README.md lines 35-37 lists three incomplete items: "Conversion Option", "Fix Some Wrong Conversions", and "Redis cache". These are acknowledged gaps with no implementation progress visible in the codebase.
- Files: `README.md` (lines 35-37)
- Impact: "Fix Some Wrong Conversions" implies known conversion inaccuracies exist in the output. "Redis cache" suggests performance was identified as a concern but never addressed.
- Fix approach: Prioritize the known wrong conversions by auditing `dict/dictionary_diff_v1.txt` and updating OpenCC config files. The Redis cache item is no longer relevant since the architecture is now fully client-side WASM — remove it from TODO.

---

### Multiple Divergent Implementations of the Same Logic

**Severity: MED**
- Issue: The conversion pipeline (WASM init, dependency loading, `input.txt`/`output.txt` file I/O pattern) is copy-pasted across three separate files with slight variations rather than shared.
- Files:
  - `src/shudu.js` (lines 38-105) — Node.js version
  - `web/public/javascripts/shudu.js` (lines 55-114) — Web version
  - `browser_ext/shudu.js` (lines 56-191) — Browser extension version
- Impact: Bug fixes or improvements must be applied to all three independently. Already diverged: the browser extension uses `globalThis.FS` while the web version uses `Module.FS`.
- Fix approach: Extract a shared conversion core. The browser extension and web versions could share a single module if bundled. At minimum, document the intentional split.

---

### `halfWidth` Punctuation Category Not Implemented

**Severity: LOW**
- Issue: `src/shudu.js` line 128 has `converted = origin; // default or halfWidth (not implemented)`. The punctuation function silently falls through to no-op for any category other than `fullWidth`.
- Files: `src/shudu.js` (lines 119-131)
- Impact: Passing `category = 'halfWidth'` returns unmodified text with no warning. The web UI offers only `fullWidth` and `default` so this is unexposed, but the API surface is misleading.
- Fix approach: Either implement halfWidth conversion or remove the else branch and document that only `fullWidth` is supported.

---

### `global.Module` Pollution in Node.js Entry Point

**Severity: MED**
- Issue: `src/shudu.js` line 15 sets `global.Module = Module` to emulate the Emscripten browser environment in Node.js. This pollutes the global namespace and is a known workaround.
- Files: `src/shudu.js` (lines 6-18), comment at line 13: "Emulate Emscripten environment setup"
- Impact: If `shudu.js` is ever required alongside other Emscripten-compiled WASM modules in the same process, the global `Module` will conflict.
- Fix approach: Use Emscripten's `moduleOverrides` pattern or the WASM module factory function pattern to scope Module configuration without touching globals.

---

### Commented-Out Debug Code Left in Production

**Severity: LOW**
- Issue: `src/core.js` contains a large commented-out debug block (lines 102-113 and 165-167) that patches `String.prototype.replace` for tracing. These are dead code committed to the main branch.
- Files: `src/core.js` (lines 102-113, 165-167)
- Impact: Misleading to future contributors; increases maintenance surface.
- Fix approach: Remove the commented debug blocks entirely. If debugging is needed, use a `DEBUG` environment variable guard.

---

### `pangu.js` in `src/` is a Browser-Targeted File Used in Node.js

**Severity: LOW**
- Issue: `src/pangu.js` defines a `BrowserPangu` class extending `Pangu` from `core.js`, with DOM APIs (`document`, `Node`, `TreeWalker`). The Node.js CLI at `src/shudu.js` imports `./pangu` which resolves to this file. The CLI only uses `pangu.spacing()` (inherited from `Pangu` in `core.js`), so it works, but the file carries dead browser-specific code weight in the Node.js context.
- Files: `src/pangu.js`, `src/shudu.js` (line 3)
- Impact: Importing a browser class in Node.js is fragile; any future code path touching DOM APIs in `src/pangu.js` will throw at runtime in Node.js.
- Fix approach: Import from `./core` directly in `src/shudu.js` since only `pangu.spacing()` is needed there.

---

### Multiple TODO / "dirty hack" Comments in `src/pangu.js`

**Severity: LOW**
- Issue: Upstream `pangu.js` vendored into `src/pangu.js` contains acknowledged known limitations: unhandled nested tag spacing (line 180), `spacingPage` lacks Promise support (line 326), iframe/class ignore lists not implemented (lines 54-57), and a self-described "dirty hack" for video page handling (line 349) and inline element spacing (line 221).
- Files: `src/pangu.js` (lines 54, 180, 221, 242, 326, 348-349)
- Impact: These are upstream pangu.js known issues. The project vendors the code, so updates require manual sync.
- Fix approach: Track upstream pangu.js version explicitly. Current vendored version is `4.0.7` (`src/core.js` line 77). Consider switching to the npm package `pangu` instead of vendoring if browser extension CSP allows it.

---

## Security Considerations

### Broad Host Permissions in Browser Extension

**Severity: MED**
- Issue: Both Chrome and Firefox manifests request `http://*/*` and `https://*/*` host permissions, giving the extension access to all web pages. This is the broadest possible permission scope.
- Files: `browser_ext/manifest-chrome.json` (lines 49-52), `browser_ext/manifest-firefox.json` (lines 52-56)
- Impact: Store reviewers and users may flag this. All conversion is local (no data exfiltration), but the permission footprint is larger than necessary.
- Current mitigation: Content scripts run at `document_end` and only process text nodes. No network requests are made from content scripts.
- Recommendation: This is inherent to a "convert any page" use case. Add a clear privacy statement to the store listing. Consider `activeTab`-only mode as an opt-in.

### `alert()` Used for User-Facing Errors in Extension

**Severity: LOW**
- Issue: `browser_ext/shudu.js` lines 103 and 115 use native `alert()` for error messages during WASM initialization failure and conversion failure. `alert()` is synchronous and blocks the tab.
- Files: `browser_ext/shudu.js` (lines 103, 115)
- Impact: Poor UX; blocks the page thread. Firefox may also show a "prevent this page from creating additional dialogs" prompt.
- Fix approach: Use browser notifications API or inject a non-blocking toast element.

### Auto-Translation URL Matching is Substring-Based (No Pattern Validation)

**Severity: LOW**
- Issue: `browser_ext/shudu.js` line 81 uses `href.includes(item)` to match auto-translation URLs. `browser_ext/options.js` does no validation on the URL values before saving to storage.
- Files: `browser_ext/shudu.js` (line 81), `browser_ext/options.js` (lines 58-73)
- Impact: A user who enters a very short or common string (e.g., `.com`) will trigger auto-translation on nearly every page they visit.
- Fix approach: Validate that stored URLs are reasonable (minimum length, not just whitespace) and consider switching to `URLPattern` matching.

---

## Browser Extension Compatibility Concerns

### Firefox Uses Manifest V2; Chrome Uses Manifest V3 — Two Separate Manifests

**Severity: MED**
- Issue: The project maintains two separate manifest files (`manifest-chrome.json` and `manifest-firefox.json`) with MV3 and MV2 respectively. The working `manifest.json` is overwritten by the Makefile build step.
- Files: `browser_ext/Makefile` (lines 7-10), `browser_ext/manifest.json`, `browser_ext/manifest-chrome.json`, `browser_ext/manifest-firefox.json`
- Impact: The committed `manifest.json` is the last build artifact — it is MV3/Chrome format. Any developer who runs the extension directly from the `browser_ext/` directory without building gets the Chrome version for Firefox (or vice versa). The Makefile `clean` target doesn't restore `manifest.json` to a safe state.
- Fix approach: Add a warning comment to `manifest.json` that it is build-generated. Consider using a single source manifest with a build transform rather than two separate files.

### `shudu.js` Content Script Uses `chrome.*` Namespace Directly

**Severity: MED**
- Issue: `browser_ext/shudu.js` lines 11-12 and 58, 77 use `chrome.runtime.getURL` and `chrome.storage.sync.get` directly. The `background.js` correctly normalizes to `browserApi` (line 1), but the content script does not.
- Files: `browser_ext/shudu.js` (lines 11, 38, 58, 77), `browser_ext/background.js` (line 1)
- Impact: Firefox exposes `browser.*` (with Promises) not `chrome.*`. This works in Firefox because Firefox provides a `chrome` compatibility shim, but the shim uses callbacks not Promises and may behave differently in edge cases.
- Fix approach: Normalize to `const browser = typeof browser !== 'undefined' ? browser : chrome;` at the top of `shudu.js` as `background.js` already does.

### `background.js` Uses Floating-Point Version Comparison

**Severity: LOW**
- Issue: `browser_ext/background.js` line 12 sets `const version = 1.4` (a float). It compares this against the stored string `'v0'` from `storage.sync.get`. If the version is ever `1.40` it will be `1.4` as a float, and `1.10` would be less than `1.9` numerically — classic float version bug.
- Files: `browser_ext/background.js` (lines 12-19)
- Impact: Release notes page may be shown or not shown incorrectly when version format changes.
- Fix approach: Use a string version like `'1.4.1'` matching the manifest version field.

### Firefox Minimum Version Set to 60.0 (Very Old)

**Severity: LOW**
- Issue: `browser_ext/manifest-firefox.json` line 11 sets `strict_min_version: "60.0"`. Firefox 60 was released in 2018 and lacks many modern Web APIs. WASM and the Fetch API are supported from FF 60, so this works, but the constraint is unnecessarily broad.
- Files: `browser_ext/manifest-firefox.json` (line 11)
- Impact: Testing against old Firefox is impractical; actual compatibility with FF 60 is unverified.
- Fix approach: Raise `strict_min_version` to at least `109` (MV2 last well-supported release) or `115` (current ESR).

---

## Scalability / Performance Risks

### WASM + 11 Dictionary Files Loaded on Every Page Load (Extension)

**Severity: MED**
- Issue: Each tab that matches content script injection loads the full OpenCC WASM binary and fetches all 11 dictionary files (`.ocd2` + `.json`) into MEMFS. With `all_frames: true` in the manifest, iframed pages trigger additional loads.
- Files: `browser_ext/manifest.json` (line 27), `browser_ext/shudu.js` (lines 42-54, 56-69)
- Impact: Memory pressure and startup latency on pages with many iframes. No caching of loaded dictionary data between tabs (WASM runs per content script context).
- Current mitigation: 10-second timeout guards against infinite hangs (`browser_ext/shudu.js` line 95-99). `isProcessing` flag prevents concurrent conversions per tab.
- Recommendation: Move WASM initialization to the background service worker and use message passing for conversions. This would share one WASM instance across all tabs.

### Sequential Processing of All Text Nodes via a Single WASM Call

**Severity: LOW**
- Issue: All page text is concatenated with `'\n<<<<SHUDU_SEP>>>>\n'` before being written to MEMFS and processed in one synchronous `callMain()` invocation (`browser_ext/shudu.js` lines 144-166). For very large pages, this could block the main thread.
- Files: `browser_ext/shudu.js` (lines 144-147)
- Impact: Potential UI freeze on large pages. `callMain` is synchronous — there is no way to yield mid-conversion.
- Recommendation: Chunk input if text exceeds a threshold (e.g., 50,000 characters) and process in batches.

### Web Version Has No Rate Limiting or Input Size Guard

**Severity: LOW**
- Issue: `web/public/javascripts/query.js` line 17 passes the full TinyMCE editor content to WASM without any size check. `web/public/javascripts/shudu.js` line 70's `convertText` has no input length guard.
- Files: `web/public/javascripts/query.js` (line 17), `web/public/javascripts/shudu.js` (line 70)
- Impact: A user pasting a very large document could cause the browser tab to hang.
- Fix approach: Add a character count limit with a user-visible warning before triggering conversion.

---

## Dependency Risks

### `opencc` npm Package is Missing / Not Installed

**Severity: HIGH**
- Issue: `package.json` declares `"opencc": "^1.1.2"` as a production dependency, but running `npm outdated` shows the package as `MISSING`. The project no longer uses the npm `opencc` package in any source file — all conversion is done via the vendored WASM binary in `src/opencc.wasm`.
- Files: `package.json` (line 16), `src/opencc.wasm`
- Impact: `npm install` will attempt to install a dependency that is unused. The stale declaration is confusing and could cause install failures if the package is unpublished.
- Fix approach: Remove `opencc` from `package.json` dependencies. Document in README that the WASM binary in `src/` is the conversion engine.

### `eslint` and `eslint-config-airbnb-base` Are Severely Outdated

**Severity: MED**
- Issue: `package.json` pins `eslint@^6.8.0` (released 2020) and `eslint-config-airbnb-base@^14.1.0`. ESLint is currently at v9.x with a changed flat config format. The project has a `.jshintrc` file suggesting it previously used JSHint before ESLint was added.
- Files: `package.json` (lines 19-23), `.jshintrc`
- Impact: Linting rules are outdated; new ESLint rules beneficial for async/await patterns are unavailable. `.jshintrc` is dead config that confuses editors.
- Fix approach: Upgrade to ESLint v9 with flat config or remove linting if it is not enforced in CI (the CI workflow has no lint step).

### CLI Go Dependencies Use Minimum Pinned Versions from 2021

**Severity: LOW**
- Issue: `cli/go.mod` requires Go 1.17 and depends on `github.com/longbridgeapp/opencc v0.1.0` (2021) and `github.com/liuzl/goutil` (2021). These have not been updated.
- Files: `cli/go.mod`, `cli/go.sum`
- Impact: Potential unpatched vulnerabilities in indirect dependencies. Go 1.17 module graph semantics differ from current Go 1.22+.
- Fix approach: Run `go get -u ./...` and `go mod tidy` to update dependencies. Raise the `go` directive to at least `1.21`.

### GUI Uses `fyne.io/fyne/v2 v2.3.1` (2023 — Two Major Releases Behind)

**Severity: LOW**
- Issue: `gui/go.mod` pins Fyne at `v2.3.1`. Fyne is now at v2.5.x with accessibility improvements and bug fixes.
- Files: `gui/go.mod` (line 6)
- Impact: Missing security patches and rendering improvements. GUI is not referenced in CI and appears unmaintained relative to the other delivery targets.

### Web Page Loads jQuery 3.4.1 and TinyMCE 4.5.12 from CDN

**Severity: MED**
- Issue: `web/index.html` lines 137-138 load jQuery 3.4.1 (from cdnjs) and TinyMCE 4.5.12. jQuery 3.4.1 has known prototype pollution vulnerabilities (patched in 3.5.0). TinyMCE 4.x reached end-of-life in 2022; current version is 7.x.
- Files: `web/index.html` (lines 137-138)
- Impact: Known CVEs in vendored jQuery version. TinyMCE 4.x may have unpatched XSS vectors in its HTML sanitization. CDN dependency means the site breaks if cdnjs is unreachable.
- Fix approach: Upgrade jQuery to 3.7.x and TinyMCE to 6.x or 7.x. Alternatively, replace TinyMCE with a simpler `<textarea>` since the rich text features are not used meaningfully — `query.js` immediately converts TinyMCE content back to raw text.

---

## Missing Error Handling

### WASM Initialization Failure Not Propagated to UI (Web Version)

**Severity: MED**
- Issue: `web/public/javascripts/shudu.js` lines 22-34 handle `onRuntimeInitialized` and reject `wasmReadyPromise` on failure. However, `query.js` line 14 calls `await window.shudu.ready` without a `.catch()` or try/catch around the ready wait itself — only the outer try/catch on line 12 covers the conversion step. If WASM fails to initialize, the error message to the user is just `alert("轉換失敗")` with no detail.
- Files: `web/public/javascripts/query.js` (lines 12-34), `web/public/javascripts/shudu.js` (lines 22-34)
- Fix approach: Add specific error state handling for WASM init failure separate from conversion failure.

### Silent Fallback to Original Text on Conversion Error

**Severity: LOW**
- Issue: In `src/shudu.js` line 101 and `web/public/javascripts/shudu.js` line 103, when any individual text chunk fails conversion, the original text is silently pushed as the result. The caller gets back text that looks correct but may be unconverted Simplified Chinese.
- Files: `src/shudu.js` (line 101), `web/public/javascripts/shudu.js` (lines 102-104)
- Impact: Silent data quality failure. Users cannot tell if conversion succeeded or silently fell back.
- Fix approach: At minimum, log a warning with the failed chunk. Consider propagating partial failure indicators to the UI.

### CLI Error from `goutil.ForEachLine` Not Checked

**Severity: LOW**
- Issue: `cli/main.go` line 33 calls `goutil.ForEachLine(br, ...)` and assigns the result to `err` but never checks it — line 42 is the end of `main()` with no `if err != nil` check.
- Files: `cli/main.go` (lines 33-43)
- Impact: Errors from stdin processing (e.g., failed conversion) are silently swallowed. Exit code is always 0.
- Fix approach: Add `if err != nil { log.Fatal(err) }` after `goutil.ForEachLine`.

---

## Missing Documentation

### No API Documentation for `src/shudu.js` Exports

**Severity: LOW**
- Issue: `src/shudu.js` exports `getArgText`, `punctuate`, and `convertText` with no JSDoc. The `convertText` function's `conf` parameter accepts arbitrary config filenames but this is undocumented.
- Files: `src/shudu.js` (lines 108-134)

### No Tests Exist for Browser Extension or Web UI Logic

**Severity: MED**
- Issue: The CI workflow (`/.github/workflows/main.yml` lines 33-42) runs exactly one end-to-end test: a single string conversion check via `node src/shudu.js`. There are no unit tests for `src/core.js` regex rules, `browser_ext/shudu.js` DOM traversal logic, or the web query/setContent pipeline.
- Files: `.github/workflows/main.yml`
- Impact: Regressions in spacing rules or DOM traversal can ship undetected. The single CI test only covers Node.js WASM initialization and basic conversion — not pangu spacing, not punctuation conversion, not edge cases.
- Fix approach: Add tests using Jest/Vitest for `src/core.js` spacing rules. Add integration tests for the conversion pipeline.

### GUI is Completely Undocumented

**Severity: LOW**
- Issue: `gui/` directory has no README, no build instructions, and is not mentioned in the root README.md. The `gui/main.go` requires `Arial Unicode.ttf` to be present on the system (`gui/main.go` line 20) and will `panic` if not found.
- Files: `gui/main.go` (line 20-23), `README.md`
- Impact: The GUI cannot be built or used without knowing to install the font. `panic` on init is a hard crash with no user-friendly message.

---

## Miscellaneous Concerns

### Stale Build Artifacts Committed to Repository

**Severity: LOW**
- Issue: `browser_ext/shudu_chrome-1.4.1.zip` (988 KB) and `browser_ext/shudu_firefox-1.4.1.zip` (988 KB) are present in the working tree. While not tracked in git (confirmed via `git ls-files`), they exist as untracked files and are not ignored by `.gitignore` (which ignores `.gz` but not `.zip` selectively for `browser_ext/`).
- Files: `browser_ext/shudu_chrome-1.4.1.zip`, `browser_ext/shudu_firefox-1.4.1.zip`
- Impact: Risk of accidentally committing ~2 MB of binary artifacts. The Makefile `clean` target handles removal, but only if explicitly run.
- Fix approach: Add `browser_ext/*.zip` to `.gitignore`.

### `browser_ext/libs/jquery.min.js.save` Committed

**Severity: LOW**
- Issue: `browser_ext/libs/jquery.min.js.save` (86 KB) is an editor backup artifact present in the repository.
- Files: `browser_ext/libs/jquery.min.js.save`
- Impact: Unnecessary binary in the repo; included in extension zip via Makefile (`make` zips `libs/` directory).
- Fix approach: Remove the file and add `*.save` to `.gitignore`.

### Browser Detection in `addon.js` Uses Deprecated Heuristics

**Severity: LOW**
- Issue: `web/public/javascripts/addon.js` lines 4-27 use deprecated browser detection patterns: `window.chrome.webstore` (removed in Chrome 71+), `InstallTrigger` (removed in Firefox 105), and `!!window.StyleMedia` for Edge (pre-Chromium). The Chrome detection (`isChrome`) will fail on modern Chrome because `window.chrome.webstore` no longer exists.
- Files: `web/public/javascripts/addon.js` (lines 4-27)
- Impact: `isChrome` evaluates to `false` on modern Chrome, causing the auto-redirect to the Chrome Web Store to fail. Users on Chrome see the "not supported" error screen.
- Fix approach: Use `navigator.userAgentData.brands` (Chrome 90+) for Chrome detection, or simply redirect to the Chrome store by default and let Firefox redirect be the special case.

---

*Concerns audit: 2026-04-18*
