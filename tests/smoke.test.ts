import { test, expect } from '@playwright/test';
import { ShuduPage } from './pom/ShuduPage';

test.describe('Shudu Smoke Tests', () => {
  test('should load the page and initialize WASM', async ({ page }) => {
    const shuduPage = new ShuduPage(page);
    
    // 1. Navigate to the app
    await shuduPage.goto();
    
    // 2. Verify basic page elements are visible
    await expect(page).toHaveTitle(/Shudu 舒讀/);
    await expect(page.locator('h1')).toHaveText('Shudu 舒讀');
    
    // 3. Wait for WASM readiness
    // This is the critical part of the infrastructure
    await shuduPage.wasm.waitForReady();
    
    // 4. Verify editor is ready
    await expect(shuduPage.editor).toBeVisible();
    const placeholder = await shuduPage.editor.getAttribute('data-placeholder');
    // Note: Quill might set placeholder on the container or use a specific class
    // In our index.html it's initialized with '請輸入欲轉換之文字...'
    
    // Check if the editor exists and is editable
    await shuduPage.fillEditor('鼠标');
    await shuduPage.selectTranslation('s2twp');
    await shuduPage.clickConvert();
    
    // '鼠标' should be converted to '滑鼠' in Taiwan variant
    const content = await shuduPage.getEditorContent();
    expect(content).toContain('滑鼠');
  });
});
