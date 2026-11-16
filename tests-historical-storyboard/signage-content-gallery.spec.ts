import { test, expect } from '@playwright/test';

test('signage content advances without controls and adapts to narrow screens', async ({page}) => {
  await page.setViewportSize({width: 1280, height: 950});
  await page.goto('/digital-signage');
  const gallery = page.locator('[data-signage-content-gallery]');
  const cards = gallery.locator('figure:not([aria-hidden="true"])');
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).toContainText('Community Calendar');
  await gallery.hover();
  await expect(cards.first()).toContainText('Community Voices', {timeout: 11000});
  await expect(gallery.getByRole('button')).toHaveCount(0);
  await page.setViewportSize({width:390,height:844});
  await expect(cards).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});
