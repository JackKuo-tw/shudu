# Requirements - Browser Automation (Playwright)

## Environment & Infrastructure
- [x] **Local Server**: Tests must run against a local server (e.g., `http-server`) rather than `file://` to ensure correct `application/wasm` MIME types and CORS compliance.
- [x] **TypeScript**: The test suite must be implemented in TypeScript for type safety and better developer experience.
- [x] **CI Readiness**: Configuration must support headless execution in GitHub Actions with appropriate timeouts for WASM compilation.

## Architecture (Page Object Model)
- [x] **ShuduPage**: A Page Object representing the main editor interface, providing methods to:
  - Input text into the Quill editor (`.ql-editor`).
  - Retrieve text from the editor.
  - Trigger conversion (Simplified <-> Traditional).
  - Toggle Pangu spacing.
- [x] **WasmBridge**: A specialized component to handle the asynchronous nature of WASM:
  - **Waiting Logic**: Implementation of `page.waitForFunction(() => window.shudu.isWasmReady)` to ensure all dictionaries and WASM modules are loaded before interacting with the UI.

## Test Scenarios
- [x] **Core Conversion Flow**:
  - Verify Simplified Chinese to Traditional Chinese (Taiwan habit) conversion.
  - Verify Traditional Chinese to Simplified Chinese conversion.
- [x] **Pangu Spacing**:
  - Verify automatic spacing insertion between CJK and Latin/Numeric characters.
  - Verify spacing behavior remains consistent after multiple conversions.
- [x] **Editor Persistence**:
  - Verify that editor content is preserved through basic UI interactions.

## CI Automation
- [x] **GitHub Actions**: Tests run automatically on push/PR to master.
