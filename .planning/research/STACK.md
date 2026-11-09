# Technology Stack

**Project:** Shudu E2E Testing
**Researched:** 2024-05-24

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Playwright | Latest | E2E Testing | Industry standard, robust auto-waiting, built-in WASM support via network interception. |
| TypeScript | Latest | Language | Type safety for page objects and test data. |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `http-server` | Latest | Local Web Server | **Required** for serving WASM files with correct MIME types and avoiding CORS issues. |
| `@playwright/test` | Latest | Test Runner | Standard runner for Playwright. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Server | `http-server` | `file://` | `file://` fails to serve WASM with `application/wasm` MIME type, breaking `instantiateStreaming`. |
| Framework | Playwright | Cypress | Playwright has better multi-tab support and faster execution for WASM-heavy apps. |

## Installation

```bash
# Install Playwright and dependencies
npm install --save-dev @playwright/test typescript
npx playwright install

# Install local server for WASM
npm install --save-dev http-server
```

## Sources
- [Playwright Official Docs](https://playwright.dev/docs/intro)
- [MDN WebAssembly Loading](https://developer.mozilla.org/en-US/docs/WebAssembly/Loading_and_running)
- [Shudu source code analysis](/web/public/javascripts/shudu.js)
