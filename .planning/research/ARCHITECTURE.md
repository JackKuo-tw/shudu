# Architecture Patterns

**Domain:** Shudu E2E Testing
**Researched:** 2024-05-24

## Recommended Architecture

A **Page Object Model (POM)** structure to encapsulate Shudu's specific interactions (Quill, WASM).

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `ShuduPage` | Main page object. Controls URL and global state. | Playwright `Page` |
| `EditorComponent` | Encapsulates Quill editor interactions (`.ql-editor`). | `ShuduPage` |
| `WasmBridge` | Utility to wait for and verify WASM status. | `window.shudu` |

### Data Flow

```
Test (Fixtures) → ShuduPage → EditorComponent → UI Actions
                                  ↳ WasmBridge → WASM Initialization Check
```

## Patterns to Follow

### Pattern 1: Waiting for WASM via Window Flag
**What:** Shudu exposes `window.shudu.isWasmReady`.
**When:** Before any conversion action.
**Example:**
```typescript
await page.waitForFunction(() => window.shudu.isWasmReady === true);
```

### Pattern 2: Quill Content Manipulation
**What:** Target the internal editable div.
**When:** To fill or read text.
**Example:**
```typescript
const editor = page.locator('.ql-editor');
await editor.fill('Testing text');
const result = await editor.innerText();
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Hard Wait (Timeouts)
**What:** `await page.waitForTimeout(3000)`
**Why bad:** Flaky on CI (especially WASM compilation which varies).
**Instead:** Use `page.waitForFunction` or wait for the WASM network response.

### Anti-Pattern 2: Targeting Outer Quill Div
**What:** `page.locator('#origin').fill('text')`
**Why bad:** Quill hides the actual editable area inside a nested div with `.ql-editor`.
**Instead:** Target `.ql-editor`.

## Scalability Considerations

| Concern | At 100 tests | At 10K tests |
|---------|--------------|--------------|
| WASM Fetch | Repetitive 1MB binary download. | Use Playwright's `browserContext.route` to cache or mock WASM. |
| Test Speed | Sequential runs are slow. | Use Playwright sharding across multiple CI nodes. |

## Sources
- [Shudu JS Core Analysis](/web/public/javascripts/shudu.js)
- [Playwright POM Pattern](https://playwright.dev/docs/pom)
