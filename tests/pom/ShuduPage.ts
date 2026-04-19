import { Page, Locator } from '@playwright/test';
import { WasmBridge } from './WasmBridge';

export class ShuduPage {
  readonly page: Page;
  readonly wasm: WasmBridge;
  readonly editor: Locator;
  readonly punctuationSelect: Locator;
  readonly translationSelect: Locator;
  readonly convertButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.wasm = new WasmBridge(page);
    this.editor = page.locator('#origin .ql-editor');
    this.punctuationSelect = page.locator('#punctuation');
    this.translationSelect = page.locator('#translation');
    this.convertButton = page.locator('#convert button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  /**
   * Fills the Quill editor with the provided text.
   */
  async fillEditor(text: string) {
    await this.editor.fill(text);
  }

  /**
   * Returns the inner text of the editor.
   */
  async getEditorContent() {
    return await this.editor.innerText();
  }

  /**
   * Selects the translation target.
   */
  async selectTranslation(value: 's2twp' | 'tw2sp') {
    await this.translationSelect.selectOption(value);
  }

  /**
   * Selects the punctuation style.
   */
  async selectPunctuation(value: 'fullWidth' | 'default') {
    await this.punctuationSelect.selectOption(value);
  }

  /**
   * Clicks the convert button and waits for the conversion to finish.
   * Conversion is finished when the button is no longer disabled and doesn't contain the spinner.
   */
  async clickConvert() {
    await this.convertButton.click();
    // Wait for the button to be enabled again (conversion complete)
    await this.convertButton.waitFor({ state: 'visible' });
    await this.page.waitForFunction((btn) => {
        // @ts-ignore
        return !btn.disabled && !btn.querySelector('.spinner');
    }, await this.convertButton.elementHandle());
  }
}
