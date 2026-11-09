import { test, expect } from '@playwright/test';

test.describe('PWA & Offline Capability', () => {
  test('manifest.json should be valid and meet PWA installability requirements', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.ok()).toBeTruthy();

    const manifest = await response?.json();
    expect(manifest.name).toBe('Shudu 舒讀 - 繁簡轉換與文案排版');
    expect(manifest.short_name).toBe('Shudu 舒讀');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBeDefined();
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    // Verify 192x192 and 512x512 icons exist
    const has192 = manifest.icons.some((i: { sizes: string }) => i.sizes === '192x192');
    const has512 = manifest.icons.some((i: { sizes: string }) => i.sizes === '512x512');
    const hasMaskable = manifest.icons.some((i: { purpose?: string }) => i.purpose?.includes('maskable'));

    expect(has192).toBeTruthy();
    expect(has512).toBeTruthy();
    expect(hasMaskable).toBeTruthy();

    // Verify icons can be fetched
    for (const icon of manifest.icons) {
      const iconRes = await page.goto(icon.src);
      expect(iconRes?.ok(), `Failed to fetch icon: ${icon.src}`).toBeTruthy();
    }
  });

  test('service worker should register and activate', async ({ page }) => {
    await page.goto('/');

    // Wait for service worker to register
    const swRegistration = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return null;
      const registration = await navigator.serviceWorker.ready;
      return {
        scope: registration.scope,
        active: !!registration.active
      };
    });

    expect(swRegistration).not.toBeNull();
    expect(swRegistration?.active).toBeTruthy();
  });

  test('should function offline after caching', async ({ page, context }) => {
    // 1. Visit online first to let Service Worker install and cache assets
    await page.goto('/');
    
    // Wait for Service Worker to be active and ready
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });

    // Wait for WASM to be initialized online
    await page.waitForFunction(() => window.shudu && window.shudu.ready);

    // 2. Simulate offline mode
    await context.setOffline(true);

    try {
      // 3. Reload the page completely offline
      await page.reload({ waitUntil: 'load' });

      // 4. Verify title and heading still load from cache
      await expect(page).toHaveTitle(/Shudu 舒讀/);
      await expect(page.locator('h1')).toHaveText('Shudu 舒讀');

      // 5. Verify WASM & dictionary still initialize offline from cache
      await page.waitForFunction(() => window.shudu && window.shudu.ready, { timeout: 15000 });

      // 6. Test text conversion offline
      const quillEditor = page.locator('#origin .ql-editor');
      await quillEditor.fill('鼠标与内存');
      await page.locator('#convert button[type="submit"]').click();

      // Taiwan variant: '鼠标' -> '滑鼠', '内存' -> '記憶體'
      await expect(quillEditor).toContainText('滑鼠與記憶體', { timeout: 10000 });
    } finally {
      // Restore online mode
      await context.setOffline(false);
    }
  });

  test('install button should be hidden initially until beforeinstallprompt or standalone', async ({ page }) => {
    await page.goto('/');
    const installBtn = page.locator('#install-btn');

    // By default without beforeinstallprompt event, it stays hidden
    await expect(installBtn).toBeHidden();

    // Trigger beforeinstallprompt event manually to verify UI response
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).prompt = () => {};
      (event as any).userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(event);
    });

    // Should now be visible
    await expect(installBtn).toBeVisible();
    await expect(installBtn).toContainText('安裝應用程式');
  });
});
