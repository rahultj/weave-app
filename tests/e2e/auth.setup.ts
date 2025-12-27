import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.auth/user.json')

/**
 * Authentication setup for E2E tests
 * 
 * This creates a reusable auth state that can be used across tests.
 * To use authenticated tests, you need to set up test credentials.
 * 
 * Set these environment variables:
 * - TEST_USER_EMAIL: Test account email
 * - TEST_USER_PASSWORD: Test account password
 * 
 * For CI, store these as secrets.
 */
setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD

  // Skip auth setup if no test credentials
  if (!email || !password) {
    console.log('⚠️  No test credentials provided. Skipping auth setup.')
    console.log('   Set TEST_USER_EMAIL and TEST_USER_PASSWORD to enable authenticated tests.')
    return
  }

  // Go to the app
  await page.goto('/')

  // Open sign in modal
  await page.getByRole('button', { name: /begin your journal|start reflecting/i }).first().click()

  // Wait for and fill sign in form
  await page.waitForSelector('input[type="email"]', { timeout: 5000 })
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)

  // Submit
  await page.getByRole('button', { name: /sign in/i }).click()

  // Wait for redirect to feed
  await page.waitForURL('**/feed', { timeout: 10000 })

  // Verify we're logged in
  await expect(page.locator('text=Your Collection')).toBeVisible({ timeout: 5000 })

  // Save auth state
  await page.context().storageState({ path: authFile })
})

