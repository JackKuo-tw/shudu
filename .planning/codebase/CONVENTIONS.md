# Coding Conventions

**Analysis Date:** 2026-04-18

## Naming Patterns

**Files:**
- JavaScript source files use camelCase: `shudu.js`, `pangu.js`, `opencc.js`, `core.js`
- Browser extension entry files use lowercase: `background.js`, `options.js`
- Go source files follow Go standard conventions: `main.go`
- Config/data files use lowercase with extensions: `s2twp.json`, `tw2sp.json`

**Functions:**
- camelCase for all JavaScript function names: `convertText`, `loadDependencies`, `getUnconvertedTextArray`, `localizeHtmlPage`, `parsePage`, `replaceText`, `checkAutoTranslation`
- Go functions follow PascalCase for exported, camelCase for unexported (standard Go)

**Variables:**
- camelCase: `isReady`, `initPromise`, `conv_dict` (exception: `conv_dict` uses snake_case — inconsistency)
- Constants defined as `const` at module scope, UPPER_CASE naming is not used; descriptive camelCase/SCREAMING names reserved for regex patterns: `CJK`, `ANY_CJK`, `CONVERT_TO_FULLWIDTH_CJK_SYMBOLS_CJK`
- `var` used in browser extension scripts (`background.js`, `shudu.js`) alongside `const`/`let`

**Classes:**
- PascalCase: `Pangu` class in `src/core.js`

**Regex Constants:**
- SCREAMING_SNAKE_CASE for compiled regex patterns: `CONVERT_TO_FULLWIDTH_CJK_SYMBOLS_CJK`, `DOTS_CJK`, `CJK_QUOTE`, `FIX_POSSESSIVE_SINGLE_QUOTE`

## Code Style

**Indentation:**
- 4 spaces in `src/shudu.js`, `index.js`
- 2 spaces in `src/core.js` (class body), `browser_ext/shudu.js`, `browser_ext/options.js`
- Inconsistent across files — no enforced formatter is active

**Quotes:**
- Single quotes preferred: `require('./pangu')`, `'use strict'`, `'s2twp.json'`
- Template literals used for string interpolation: `` `${leftCjk}${fullwidthSymbols}${rightCjk}` ``
- Double quotes appear in some browser extension code and Go code

**Semicolons:**
- Present throughout all JavaScript files

**Strict Mode:**
- `'use strict'` declared at the top of `index.js`
- Not declared in `src/shudu.js` or browser extension scripts

**Arrow Functions:**
- Used consistently for callbacks and short functions: `(text) => console.log(text)`, `resolve => initPromiseResolve = resolve`

**Async/Await:**
- Used throughout `src/shudu.js` and `browser_ext/shudu.js` for async operations
- Promise-based patterns mixed with async/await in `browser_ext/shudu.js`

## Module System

**Node.js (src/):**
- CommonJS: `require()` and `module.exports` used exclusively
- `module.exports` as an object with named exports in `src/shudu.js`
- `module.exports` with `.default` and named class export in `src/core.js`

**Browser Extension:**
- No module system — global scripts loaded via manifest `content_scripts` and service worker
- Browser API accessed via global `chrome` / `browser` references

**Go (cli/):**
- Standard Go package/import system

## Error Handling Patterns

**Try/Catch:**
- Used in async functions throughout `src/shudu.js`
- `onWasmReady` wraps the dependency loading loop in try/catch, logs via `console.error`
- `convertText` catches per-iteration errors and falls back to original input string
- `browser_ext/shudu.js` uses try/catch in `loadDependencies` and `runLocalConversion`
- Bare `catch (e) { }` (swallowed error) present in `runLocalConversion` cleanup block

**Error Propagation:**
- `throw new Error(...)` used to surface actionable failures
- Browser extension surfaces errors to users via `alert()` for critical failures (WASM timeout, conversion failure)
- Node.js code logs errors to `console.error` without process exit (except `getArgText` which calls `process.exit()`)

**Go:**
- Standard Go error handling: `if err != nil { log.Fatal(err) }` — fatal exit on unrecoverable errors

**Fallback Pattern:**
- `convertText` in `src/shudu.js` returns original input string on conversion failure (silent degradation)

## Linting / Formatting Setup

**JSHint:**
- Config: `.jshintrc` at project root
- Settings: `{ "node": true, "esversion": 6 }`
- Minimal configuration — only enables Node.js globals and ES6 syntax
- Also declared inline in `package.json` under `"jshintConfig": { "esversion": 6 }`

**ESLint:**
- Listed as a `devDependency` (`eslint ^6.8.0`) along with `eslint-config-airbnb-base ^14.1.0` and `eslint-plugin-import ^2.20.2`
- No `.eslintrc` config file is present in the repository — ESLint is installed but not configured or run
- No lint script defined in `package.json`

**Prettier / Biome:**
- Not present

**Go:**
- Standard `gofmt` conventions assumed (no explicit config)

## Comment Style

**Single-line comments:**
- `//` used throughout for inline and section comments
- Explanatory comments above non-obvious logic blocks: WASM initialization, regex character class definitions

**Block comments:**
- No `/* */` block comments found — only `//` line comments

**Inline ESLint disables:**
- `// eslint-disable-line no-console` used in `src/core.js` to suppress console warnings
- `// eslint-disable-line quotes` used in `src/core.js` for a specific string literal

**TODO/DEBUG comments:**
- DEBUG sections present in `src/core.js` (commented-out `String.prototype.replace` monkey-patch)
- Comments like `// DEBUG`, `// Handle concurrency properly...`, `// Since node is single threaded...` are informal notes left in production code

**Internationalization notes:**
- `browser_ext/` HTML and JS contain Chinese-language comments and UI strings; code comments in `src/` are English

---

*Convention analysis: 2026-04-18*
