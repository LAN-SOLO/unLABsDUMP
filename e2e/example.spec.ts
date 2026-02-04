import { test, expect } from '@playwright/test'

test('admin page loads', async ({ page }) => {
  await page.goto('http://localhost:3006')
  await expect(page).toHaveTitle(/Next/)
})

test('frontend page loads', async ({ page }) => {
  await page.goto('http://localhost:3007')
  await expect(page).toHaveTitle(/Next/)
})
