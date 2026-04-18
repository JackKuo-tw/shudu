# Testing Strategy

## Summary

Testing coverage is minimal. There is no test framework installed and no test files in the repository. The only automated test is a single smoke test embedded in CI.

## Test Framework

**None.** `package.json` has no test dependencies (no Jest, Mocha, Vitest, or similar).

## Test Files

Zero test files exist in the repository. No `*.test.*` or `*.spec.*` files anywhere.

## Existing Tests

### CI Smoke Test (`.github/workflows/main.yml`)
- **Type:** Shell-based output comparison
- **What it tests:** Runs `node src/shudu.js "燕燕于飞，差池其羽。"` and asserts output equals `"燕燕于飛，差池其羽。"`
- **Coverage:** Single happy-path conversion (simplified → traditional Chinese)

## Coverage Gaps

| Component | Coverage |
|-----------|----------|
| `src/shudu.js` (main CLI entry) | Smoke test only |
| `src/core.js` (Pangu class) | None |
| `src/sp2tw.js` / `src/tw2sp.js` (conversion logic) | None |
| `cli/` (Go CLI) | None |
| `browser_ext/` (browser extension) | None |
| `gui/` (desktop GUI) | None |
| `web/` (Cloudflare Worker API) | None |
| Dictionary loading (`dict/`) | None |
| Error handling paths | None |
| Edge cases (empty input, mixed scripts, punctuation) | None |

## CI Configuration

- **Platform:** GitHub Actions (`.github/workflows/main.yml`)
- **Test step:** Single `node` invocation with output diff check
- **No dedicated test script** in `package.json`

## Recommendations

- Add a test framework (Jest or Vitest recommended for Node.js)
- Unit test `Pangu` class methods in `src/core.js`
- Test both `sp2tw` and `tw2sp` conversion paths
- Test dictionary loading and edge cases
- Add Go tests for `cli/` package
- Add integration tests for the Cloudflare Worker API endpoint
