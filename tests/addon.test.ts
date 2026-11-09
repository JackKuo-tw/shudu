import { test, expect } from '@playwright/test';

test.describe('Addon Browser Detection', () => {
  test('should detect Chrome and redirect to Chrome Web Store', async ({ page }) => {
    // Intercept navigation to external store so test does not wait on external network
    await page.route('https://chromewebstore.google.com/**', (route) => {
      route.fulfill({ status: 200, body: 'Chrome Web Store Mock' });
    });

    await page.goto('/addon.html');

    // On Chromium, it should redirect to Chrome Web Store
    await page.waitForURL(/chromewebstore\.google\.com/, { timeout: 5000 });
    expect(page.url()).toContain('chromewebstore.google.com/detail/shudu');
  });

  test('should detect Firefox user agent and redirect to Firefox Add-on page', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0'
    });
    const page = await context.newPage();

    await page.route('https://addons.mozilla.org/**', (route) => {
      route.fulfill({ status: 200, body: 'Firefox AMO Mock' });
    });

    await page.goto('http://localhost:8080/addon.html');
    await page.waitForURL(/addons\.mozilla\.org/, { timeout: 5000 });
    expect(page.url()).toContain('addons.mozilla.org/zh-TW/firefox/addon/shudu');
    await context.close();
  });

  test('should show manual download links on unsupported browser like Safari', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
    });
    const page = await context.newPage();

    await page.goto('http://localhost:8080/addon.html');
    
    // Check that not-support section is visible
    const notSupport = page.locator('#not-support');
    await expect(notSupport).toBeVisible();
    await expect(notSupport.locator('h1')).toHaveText('目前不支援您的瀏覽器');

    // Links to Chrome and Firefox are present
    const chromeLink = page.locator('a[href*="chromewebstore.google.com"]');
    await expect(chromeLink).toBeVisible();

    await context.close();
  });
});
