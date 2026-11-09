# Domain Pitfalls

**Domain:** WASM + Rich Text Editor Testing
**Researched:** 2024-05-24

## Critical Pitfalls

### Pitfall 1: Incorrect WASM MIME Type
**What goes wrong:** `TypeError: Failed to execute 'instantiateStreaming' on 'WebAssembly'`.
**Why it happens:** Browsers refuse to compile WASM if the server doesn't send `Content-Type: application/wasm`.
**Consequences:** Tests fail with cryptic JS errors; WASM doesn't load.
**Prevention:** Always use a local server (`http-server`) instead of `file://`.
**Detection:** Check console logs for WASM loading errors.

### Pitfall 2: Race Condition on WASM Readiness
**What goes wrong:** Tests try to click "Convert" before the 11+ dependency files (OCD2, JSON) are loaded.
**Why it happens:** Page load event fires before WASM `onRuntimeInitialized`.
**Consequences:** Flaky tests; "Conversion failed" errors.
**Prevention:** Use `await page.waitForFunction(() => window.shudu.isWasmReady)`.

## Moderate Pitfalls

### Pitfall 1: Quill "Ghost" HTML
**What goes wrong:** `editor.innerText()` returns extra `\n` or spaces.
**Why it happens:** Quill injects `<p><br></p>` or other structure into `[contenteditable]`.
**Prevention:** Use `.innerText()` and trim, or use `.innerHTML()` if asserting on formatting.

### Pitfall 2: CI CPU Bottleneck
**What goes wrong:** WASM compilation takes much longer on CI (GitHub Actions) than local.
**Prevention:** Increase `actionTimeout` in `playwright.config.ts` to 10-15s for WASM-related actions.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Initial Setup | Port conflict with `http-server`. | Use `reuseExistingServer: !process.env.CI` in Playwright config. |
| Test Authoring | Targeting `#origin` instead of `.ql-editor`. | Use Page Object Model to hide selector complexity. |

## Sources
- [MDN WebAssembly Troubleshooting](https://developer.mozilla.org/en-US/docs/WebAssembly/Loading_and_running#troubleshooting)
- [Quill GitHub Issues (Testing)](https://github.com/quilljs/quill/issues)
