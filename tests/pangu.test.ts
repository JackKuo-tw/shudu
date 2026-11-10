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

  test('should add space outside hyperlinks with Latin text (Issue #4)', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).quill.root.innerHTML = '<p>請參考<a href="https://example.com">Google</a>網站</p>';
    });

    await shudu.selectPunctuation('fullWidth');
    await shudu.clickConvert();

    const html = await page.evaluate(() => (window as any).quill.root.innerHTML);
    expect(html).toContain('請參考 <a href="https://example.com">Google</a> 網站');
  });

  test('should add space outside hyperlinks ending in numbers (Issue #4)', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).quill.root.innerHTML = '<p>閱讀<a href="https://example.com">RFC 2616</a>規範</p>';
    });

    await shudu.selectPunctuation('fullWidth');
    await shudu.clickConvert();

    const html = await page.evaluate(() => (window as any).quill.root.innerHTML);
    expect(html).toContain('閱讀 <a href="https://example.com">RFC 2616</a> 規範');
  });

  test('should add space around Chinese hyperlinks with surrounding Latin text (Issue #4)', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).quill.root.innerHTML = '<p>Visit<a href="https://example.com">谷歌</a>website</p>';
    });

    await shudu.selectPunctuation('fullWidth');
    await shudu.clickConvert();

    const html = await page.evaluate(() => (window as any).quill.root.innerHTML);
    expect(html).toContain('Visit <a href="https://example.com">谷歌</a> website');
  });

  test('should add space around other inline tags like <strong> or <b>', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).quill.root.innerHTML = '<p>使用<strong>React</strong>開發</p>';
    });

    await shudu.selectPunctuation('fullWidth');
    await shudu.clickConvert();

    const html = await page.evaluate(() => (window as any).quill.root.innerHTML);
    expect(html).toContain('使用 <strong>React</strong> 開發');
  });

  test('should not add space before fullwidth punctuation after hyperlink', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).quill.root.innerHTML = '<p>推薦使用<a href="https://example.com">Google</a>，查詢資料</p>';
    });

    await shudu.selectPunctuation('fullWidth');
    await shudu.clickConvert();

    const html = await page.evaluate(() => (window as any).quill.root.innerHTML);
    expect(html).toContain('推薦使用 <a href="https://example.com">Google</a>，查詢資料');
  });
});
