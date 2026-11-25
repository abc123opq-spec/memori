import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: "tests",

  // personal-fork: friends need the author's servers (blocked by CSP), the Premium and hear-about-us screens were removed
  testIgnore: ["friends.spec.ts", "subscriptions.spec.ts", "hearAboutUs.spec.ts"],

  // Run all tests in parallel.
  fullyParallel: true,

  // Long E2E flows (basicBeginner, addProgramExercises) legitimately exceed the default
  // 30s when several workers share the machine with the webpack dev server.
  timeout: 60000,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: "html",

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: `${process.env.PERSONAL_BASE_URL ?? "http://localhost:8080/"}?skipintro=1`,

    // Collect trace when retrying the failed test.
    trace: "on-first-retry",
    testIdAttribute: "data-testid",
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 13"],
        userAgent: `${devices["iPhone 13"].userAgent} Playwright/1.0`,
      },
    },
    {
      name: "Edge Mobile",
      use: { ...devices["iPhone 13"], browserName: "chromium", channel: "msedge" },
    },
    {
      name: "Chrome Mobile",
      use: { ...devices["iPhone 13"], browserName: "chromium", channel: "chrome" },
    },
  ],
});
