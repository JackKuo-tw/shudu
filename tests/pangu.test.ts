import { test, expect } from '@playwright/test';
import { ShuduPage } from './pom/ShuduPage';

test.describe('Pangu Spacing', () => {
  let shudu: ShuduPage;

  test.beforeEach(async ({ page }) => {
    shudu = new ShuduPage(page);
    await shudu.goto();
    await shudu.wasm.waitForReady();
  });

  test('should add space between CJK and Latin characters', async () => {
    const input = 'A中';
    const expected = 'A 中';

    await shudu.fillEditor(input);
    await shudu.selectPunctuation('fullWidth');
    await shudu.clickConvert();

    const result = await shudu.getEditorContent();
    expect(result.trim()).toBe(expected);
  });

  test('should add space between CJK and Numbers', async () => {
    const input = '1中';
    const expected = '1 中';

    await shudu.fillEditor(input);
    await shudu.selectPunctuation('fullWidth');
    await shudu.clickConvert();

    const result = await shudu.getEditorContent();
    expect(result.trim()).toBe(expected);
  });

  test('should be idempotent (multiple conversions should not add extra spaces)', async () => {
    const input = 'A中';
    const expected = 'A 中';

    await shudu.fillEditor(input);
    await shudu.selectPunctuation('fullWidth');
    
    // First conversion
    await shudu.clickConvert();
    let result = await shudu.getEditorContent();
    expect(result.trim()).toBe(expected);

    // Second conversion
    await shudu.clickConvert();
    result = await shudu.getEditorContent();
    expect(result.trim()).toBe(expected);
  });
});
