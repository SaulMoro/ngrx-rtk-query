import { expect, test } from '@playwright/test';

test('boots the Noop Store runtime and renders a newly added post', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'RTK Query - Basic example without store' })).toBeVisible();

  await page.getByPlaceholder('New post name').fill('Noop E2E post');
  await page.getByRole('button', { name: /Add Post/i }).click();

  await expect(page.getByRole('link', { name: 'Noop E2E post' })).toBeVisible();
});
