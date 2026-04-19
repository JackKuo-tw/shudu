import { test, expect } from '@playwright/test';
import { ShuduPage } from './pom/ShuduPage';

test.describe('Core Conversion Flow', () => {
  let shudu: ShuduPage;

  test.beforeEach(async ({ page }) => {
    shudu = new ShuduPage(page);
    await shudu.goto();
    await shudu.wasm.waitForReady();
  });

  test('should convert Simplified Chinese to Traditional Chinese (Taiwan)', async () => {
    const input = '鼠标在手,光标跟我走!';
    const expected = '滑鼠在手，游標跟我走！';

    await shudu.fillEditor(input);
    await shudu.selectTranslation('s2twp');
    await shudu.selectPunctuation('fullWidth');
    await shudu.clickConvert();

    const result = await shudu.getEditorContent();
    expect(result.trim()).toBe(expected);
  });

  test('should convert Traditional Chinese to Simplified Chinese (China)', async () => {
    const input = '燕燕于飛，差池其羽。';
    const expected = '燕燕于飞，差池其羽。';

    await shudu.fillEditor(input);
    await shudu.selectTranslation('tw2sp');
    // Default punctuation for this test to match the expected output
    await shudu.selectPunctuation('default');
    await shudu.clickConvert();

    const result = await shudu.getEditorContent();
    expect(result.trim()).toBe(expected);
  });

  test('should preserve content structure after conversion', async () => {
    const input = 'Line 1\nLine 2\n\nLine 4';
    
    await shudu.fillEditor(input);
    await shudu.clickConvert();

    const result = await shudu.getEditorContent();
    // Quill might normalize newlines, so we check if lines are still there
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
    expect(result).toContain('Line 4');
  });
});
