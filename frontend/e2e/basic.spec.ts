import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Task Management/);
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    // Add your navigation tests here
    // Example:
    // await page.click('text=About');
    // await expect(page).toHaveURL(/.*about/);
  });

  test('should handle user interactions', async ({ page }) => {
    await page.goto('/');
    // Add your interaction tests here
    // Example:
    // await page.fill('input[name="search"]', 'test query');
    // await page.click('button[type="submit"]');
    // await expect(page.locator('.results')).toBeVisible();
  });
}); 