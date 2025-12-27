import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 * 
 * Run against staging by default for safety.
 * Use `PLAYWRIGHT_BASE_URL` env var to override.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    // Default to staging URL - override with PLAYWRIGHT_BASE_URL env var
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://weave-app-git-staging-rahultjs-projects.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile viewport (uses Chromium with mobile size, not WebKit)
    {
      name: 'mobile',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 }, // iPhone 13 size
        isMobile: true,
      },
    },
  ],

  // Optional: Run local dev server for local testing
  // Uncomment if you want to test against local
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
})

