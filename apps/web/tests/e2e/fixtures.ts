import { test as base } from '@playwright/test'

export const test = base.extend({
  page: async ({ page }, use) => {
    // Mock external API calls
    await page.route('**/api/auth/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
    })

    await page.route('**/api/mealplan', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mealPlanId: 'test-plan-id',
          pdfUrl: 'https://example.com/test.pdf',
          message: 'Meal plan generated successfully',
        }),
      })
    })

    await use(page)
  },
})

export { expect } from '@playwright/test'
