import { Page } from '@playwright/test';

export class WasmBridge {
  constructor(private page: Page) {}

  /**
   * Waits for the Shudu WASM engine to be fully initialized.
   * This ensures that conversion calls won't fail or hang.
   */
  async waitForReady() {
    await this.page.waitForFunction(() => {
      // @ts-ignore
      return window.shudu && window.shudu.ready;
    }, { timeout: 30000 });
    
    // Additionally wait for the promise to resolve if it's already defined
    await this.page.evaluate(async () => {
      // @ts-ignore
      if (window.shudu && window.shudu.ready) {
        // @ts-ignore
        await window.shudu.ready;
      }
    });
  }
}
