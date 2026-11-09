# Research Summary: Shudu E2E Testing with Playwright

**Domain:** WASM + Rich Text Editor Testing
**Researched:** 2024-05-24
**Overall confidence:** HIGH

## Executive Summary

Testing Shudu requires a robust approach to handle asynchronous WASM initialization and interactions with the Quill rich-text editor. The most critical discovery is that **testing via `file://` is insufficient for WASM**; a local server (like `http-server`) must be used to ensure correct MIME types (`application/wasm`) and to avoid CORS issues when loading WASM modules and their dependencies.

For test stability, the suite must explicitly wait for `window.shudu.isWasmReady` (or the equivalent promise) before attempting any conversion actions. Interacting with the Quill editor is best achieved by targeting the `.ql-editor` class, using `fill()` for bulk text input and keyboard shortcuts for formatting.

## Key Findings

**Stack:** Playwright + TypeScript + `http-server`.
**Architecture:** Page Object Model (POM) with a specific `WasmBridge` component to manage initialization states.
**Critical pitfall:** Browser failure to compile WASM if served without the `application/wasm` header (occurs when using `file://` directly).

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Test Environment Setup** - Configure Playwright with `webServer` to run `http-server`.
   - Addresses: MIME type and CORS issues for WASM.
2. **Core Fixtures & POM** - Build the `ShuduPage` object and `WasmBridge`.
   - Addresses: WASM initialization race conditions.
3. **Quill Editor Integration** - Implement editor interaction helpers.
   - Addresses: Target `.ql-editor` instead of `#origin`.
4. **End-to-End Test Suite** - Write tests for S2T, T2S, and Pangu spacing.

**Phase ordering rationale:**
- Environmental stability (MIME types/Server) is a prerequisite for any WASM testing.
- POM/Fixtures are needed before writing actual tests to ensure DRY and maintainable code.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Standards are clear for WASM and Playwright. |
| Features | HIGH | Shudu source code explicitly provides initialization flags. |
| Architecture | HIGH | POM is the standard pattern for Playwright. |
| Pitfalls | HIGH | Common WASM/CORS/MIME pitfalls are well-documented. |

## Gaps to Address

- **Browser Extension Testing**: This research focused on `web/index.html`. Extension testing (`browser_ext/`) may require additional Playwright configuration (loading the extension folder).
- **Mobile Emulation**: While Playwright supports mobile, WASM performance on emulated mobile devices should be verified.
