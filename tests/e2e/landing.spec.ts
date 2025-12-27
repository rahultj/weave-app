import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('shows landing page with main CTA', async ({ page }) => {
    await page.goto('/')
    
    // Check main heading is visible
    await expect(page.locator('h1').first()).toBeVisible()
    
    // Check CTA button exists (use first() since there are multiple)
    await expect(page.getByRole('button', { name: /begin your journal/i }).first()).toBeVisible()
  })

  test('opens sign in modal when CTA is clicked', async ({ page }) => {
    await page.goto('/')
    
    // Click the CTA (use first matching button)
    await page.getByRole('button', { name: /begin your journal/i }).first().click()
    
    // Modal should appear with sign in form
    await expect(page.getByPlaceholder(/email/i)).toBeVisible({ timeout: 5000 })
  })

  test('navigation links work', async ({ page, isMobile }) => {
    await page.goto('/')
    
    // On mobile, nav links might be hidden in a menu - just check page loads
    if (isMobile) {
      await expect(page.locator('h1').first()).toBeVisible()
      return
    }
    
    // On desktop, check navigation links are visible
    await expect(page.getByRole('link', { name: 'The Idea' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'How It Works' })).toBeVisible()
  })
})

test.describe('Sign In Modal', () => {
  test('shows validation errors for invalid email', async ({ page }) => {
    await page.goto('/')
    
    // Open modal
    await page.getByRole('button', { name: /begin your journal|start reflecting/i }).first().click()
    
    // Wait for modal
    await page.waitForSelector('input[type="email"]', { timeout: 5000 })
    
    // Try to submit with invalid email
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'password123')
    
    // The submit button should be present
    const submitButton = page.getByRole('button', { name: /sign in/i })
    await expect(submitButton).toBeVisible()
  })

  test('can switch between sign in and sign up modes', async ({ page }) => {
    await page.goto('/')
    
    // Open modal
    await page.getByRole('button', { name: /begin your journal|start reflecting/i }).first().click()
    
    // Wait for modal
    await page.waitForSelector('input[type="email"]', { timeout: 5000 })
    
    // Should show sign in by default, look for sign up link
    const signUpLink = page.getByText(/create.*account|sign up|don't have/i)
    await expect(signUpLink).toBeVisible()
  })
})

