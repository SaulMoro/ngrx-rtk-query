import { expect, test } from '@playwright/test';

test('boots the signal-store runtime and updates selected state after adding a post', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /RTK Query - Basic example with Signal Store/i })).toBeVisible();
  await expect(page.getByText(/Selected via store: 2 posts/i)).toBeVisible();

  await page.getByPlaceholder('New post name').fill('E2E post');
  await page.getByRole('button', { name: /Add Post/i }).click();

  await expect(page.getByRole('link', { name: 'E2E post' })).toBeVisible();
  await expect(page.getByText(/Selected via store: 3 posts/i)).toBeVisible();
});
