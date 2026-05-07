import { expect, test } from '@playwright/test';

test('boots the NgRx Store runtime and renders a newly added post', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'RTK Query - Basic example with ngrx/store' })).toBeVisible();

  await page.getByPlaceholder('New post name').fill('NgRx E2E post');
  await page.getByRole('button', { name: /Add Post/i }).click();

  await expect(page.getByRole('link', { name: 'NgRx E2E post' })).toBeVisible();
});
