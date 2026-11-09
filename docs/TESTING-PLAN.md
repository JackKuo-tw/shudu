<!-- generated-by: gsd-doc-writer -->
# Shudu Browser Automation Plan

## Overview
This document defines the requirements and roadmap for the Playwright-based browser automation suite for the Shudu web editor. The goal is to provide a reliable end-to-end testing environment that verifies core conversion logic and editor interactions.

## Requirements

### Environment & Infrastructure
- **Local Server**: Tests must run against a local server (e.g., `http-server`) rather than `file://` to ensure correct `application/wasm` MIME types and CORS compliance.
- **TypeScript**: The test suite must be implemented in TypeScript for type safety and better developer experience.
- **CI Readiness**: Configuration must support headless execution in GitHub Actions with appropriate timeouts for WASM compilation.

### Architecture (Page Object Model)
- **ShuduPage**: A Page Object representing the main editor interface, providing methods to:
  - Input text into the Quill editor (`.ql-editor`).
  - Retrieve text from the editor.
  - Trigger conversion (Simplified <-> Traditional).
  - Toggle Pangu spacing.
- **WasmBridge**: A specialized component to handle the asynchronous nature of WASM:
  - **Waiting Logic**: Implementation of `page.waitForFunction(() => window.shudu.isWasmReady)` to ensure all dictionaries and WASM modules are loaded before interacting with the UI.

### Test Scenarios
- **Core Conversion Flow**:
  - Verify Simplified Chinese to Traditional Chinese (Taiwan habit) conversion.
  - Verify Traditional Chinese to Simplified Chinese conversion.
- **Pangu Spacing**:
  - Verify automatic spacing insertion between CJK and Latin/Numeric characters.
  - Verify spacing behavior remains consistent after multiple conversions.
- **Editor Persistence**:
  - Verify that editor content is preserved through basic UI interactions.

## Roadmap

### Phase 1: Foundation & Setup
- **Playwright Initialization**: Install `@playwright/test` and configure the project.
- **Web Server Integration**: Configure `playwright.config.ts` to automatically start and stop a local server during test runs.
- **Smoke Test**: Implement a basic test to verify the page loads and the server is reachable.

### Phase 2: Page Object Model Implementation
- **ShuduPage Object**: Build the primary interface for editor interactions, abstracting away Quill-specific CSS selectors.
- **WasmBridge Utility**: Implement the waiting logic to synchronize test actions with WASM initialization events.
- **Custom Fixtures**: Set up Playwright fixtures to provide a pre-initialized `ShuduPage` to every test.

### Phase 3: Core Functional Testing
- **Conversion Suite**: Implement comprehensive tests for S2T and T2S conversion paths using the POM.
- **Pangu Suite**: Implement tests for Pangu spacing logic, covering various character combinations (Chinese-English, Chinese-Numbers, etc.).
- **Validation**: Ensure results match expected output as defined in existing CLI smoke tests and dictionary specs.

### Phase 4: CI Integration & Hardening
- **GitHub Actions**: Add a `playwright-test` job to the existing CI workflow.
- **Performance Tuning**: Adjust timeouts and retry logic to handle the lower CPU resources typical of CI environments.
- **Reporting**: Configure Playwright HTML reports for failed test debugging in CI.
