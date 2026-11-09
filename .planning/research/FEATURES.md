# Feature Landscape

**Domain:** Shudu (WASM-based text conversion)
**Researched:** 2024-05-24

## Table Stakes (E2E Targets)

Features that MUST be verified by the E2E suite.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| WASM Load Success | App is useless without it. | Low | Check `window.shudu.isWasmReady`. |
| Quill Editor Input | Users need to type/paste text. | Low | Target `.ql-editor`. |
| Basic Conversion | S2T and T2S conversion. | Medium | Verify text changes after clicking "Convert". |
| Vocabulary Mapping | "鼠标" -> "滑鼠" conversion. | Medium | Specific test cases for localized terms. |
| Pangu Spacing | "A中" -> "A 中" spacing. | Low | Verify `pangu.js` logic integration. |

## Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Offline Processing | Privacy and speed. | Medium | Verify no network requests are made during conversion. |
| Formatting Retention | Quill rich text support. | High | Ensure bold/italic/links are preserved after conversion. |

## Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| External API Calls | Shudu is privacy-focused. | Verify conversion is purely local (mock/block network). |

## Feature Dependencies

```
WASM Ready → Conversion Ready
Editor Ready → Text Input Ready
```

## MVP Recommendation

Prioritize:
1. **WASM Initialization Check**: First thing every test should do.
2. **Simple Text Conversion Flow**: Fill -> Click Convert -> Assert Result.
3. **Pangu Spacing Verification**: Ensure typography rules are applied.

## Sources
- [Shudu Project Overview](/.planning/PROJECT.md)
- [Quill Documentation](https://quilljs.com/)
