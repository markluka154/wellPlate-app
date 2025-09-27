import { test, expect } from '@playwright/test'

test.describe('NutriAI E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:4321')
  })

  test('should display landing page correctly', async ({ page }) => {
    // Check main elements are present
    await expect(page.locator('h1')).toContainText('Personalized Meal Plans')
    await expect(page.locator('text=Generate a Free Plan')).toBeVisible()
    await expect(page.locator('text=See Pricing')).toBeVisible()
    
    // Check trust indicators
    await expect(page.locator('text=Trusted by 12,000+ users')).toBeVisible()
    await expect(page.locator('text=GDPR-friendly')).toBeVisible()
  })

  test('should navigate to pricing page', async ({ page }) => {
    await page.click('text=See Pricing')
    await expect(page).toHaveURL(/.*pricing/)
    await expect(page.locator('text=Simple, transparent pricing')).toBeVisible()
    
    // Check pricing plans are displayed
    await expect(page.locator('text=Free')).toBeVisible()
    await expect(page.locator('text=Pro Monthly')).toBeVisible()
    await expect(page.locator('text=Pro Annual')).toBeVisible()
  })

  test('should navigate to FAQ page', async ({ page }) => {
    await page.click('text=FAQ')
    await expect(page).toHaveURL(/.*faq/)
    await expect(page.locator('text=Frequently Asked Questions')).toBeVisible()
    
    // Check FAQ items are present
    await expect(page.locator('text=How accurate are the macros?')).toBeVisible()
    await expect(page.locator('text=Is there a free plan?')).toBeVisible()
  })

  test('should navigate to sign in page', async ({ page }) => {
    await page.click('text=Sign In')
    await expect(page).toHaveURL(/.*signin/)
    await expect(page.locator('text=Create your account')).toBeVisible()
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('text=Sign in with Email')).toBeVisible()
    await expect(page.locator('text=Continue with Google')).toBeVisible()
  })

  test('should display footer links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Check footer links
    await expect(page.locator('text=Pricing')).toBeVisible()
    await expect(page.locator('text=FAQ')).toBeVisible()
    await expect(page.locator('text=Privacy Policy')).toBeVisible()
    await expect(page.locator('text=Terms of Service')).toBeVisible()
  })

  test('should handle email sign in form', async ({ page }) => {
    await page.goto('http://localhost:4321/signin')
    
    // Fill email form
    await page.fill('input[type="email"]', 'test@example.com')
    
    // Mock the sign in response
    await page.route('**/api/auth/signin/email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
    })
    
    await page.click('text=Sign in with Email')
    
    // Should show loading state
    await expect(page.locator('text=Sending...')).toBeVisible()
  })

  test('should display responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that elements are still visible and properly laid out
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Generate a Free Plan')).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('h1')).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should handle navigation between pages', async ({ page }) => {
    // Start at home
    await expect(page).toHaveURL('http://localhost:4321/')
    
    // Navigate to pricing
    await page.click('text=See Pricing')
    await expect(page).toHaveURL(/.*pricing/)
    
    // Navigate back to home via logo
    await page.click('text=NutriAI')
    await expect(page).toHaveURL('http://localhost:4321/')
    
    // Navigate to FAQ
    await page.click('text=FAQ')
    await expect(page).toHaveURL(/.*faq/)
    
    // Navigate to sign in
    await page.click('text=Sign In')
    await expect(page).toHaveURL(/.*signin/)
  })
})
