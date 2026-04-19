# Roadmap - Shudu Editor Replacement

## Phase 01: Editor Replacement (TinyMCE to Quill)
**Goal:** Replace the legacy TinyMCE 4 editor with a modern Quill.js (v2) implementation in the web interface.

**Requirements:**
- [WEB-01] Remove TinyMCE dependencies and usage.
- [WEB-02] Integrate Quill v2.0.2 via CDN.
- [WEB-03] Re-implement editor logic (init, get, set) in `query.js`.
- [WEB-04] Apply styling overrides in `style.css`.
- [WEB-05] Verify visual consistency and functional parity.

**Plans:**
- [ ] 01-01-PLAN.md — Replace TinyMCE with Quill in web/ directory.
