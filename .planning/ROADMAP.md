# Roadmap - Shudu Editor Replacement & Automation

## Phase 01: Editor Replacement (TinyMCE to Quill)
**Goal:** Replace the legacy TinyMCE 4 editor with a modern Quill.js (v2) implementation in the web interface.

**Requirements:**
- [WEB-01] Remove TinyMCE dependencies and usage.
- [WEB-02] Integrate Quill v2.0.2 via CDN.
- [WEB-03] Re-implement editor logic (init, get, set) in `query.js`.
- [WEB-04] Apply styling overrides in `style.css`.
- [WEB-05] Verify visual consistency and functional parity.

**Plans:**
- [x] 01-01-PLAN.md — Replace TinyMCE with Quill in web/ directory.

## Phase 02: Browser Automation (Playwright)
**Goal:** Implement E2E testing for the web editor to verify core conversion and UI behavior.

**Requirements:**
- [TEST-01] Setup Playwright with local server support.
- [TEST-02] Implement Page Object Model (ShuduPage, WasmBridge).
- [TEST-03] Implement Core Conversion Flow tests (S2T, T2S).
- [TEST-04] Implement Pangu Spacing tests.
- [TEST-05] Integrate tests into GitHub Actions.

**Plans:**
- [x] 02-01-PLAN.md — Setup Playwright foundation, configuration, and base POM.
- [x] 02-02-PLAN.md — Implement core functional test suites and CI integration.
