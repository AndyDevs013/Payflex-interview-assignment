const { test, expect } = require('@playwright/test');

test('inline page has title', async ({ page }) => {
  await page.setContent(`<!doctype html><html><head><title>Playwright Smoke</title></head><body><h1>OK</h1></body></html>`);
  await expect(page).toHaveTitle(/Playwright Smoke/);
});


