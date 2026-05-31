import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Warm each route once before the parallel suite — Next dev compiles on demand,
  // and a cold parallel stampede can exceed per-test timeouts.
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry locally too: absorbs the rare first-hit dev recompile without flaking.
  retries: 1,
  reporter: "list",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // First `next dev` compile can be slow on a clean tree.
    timeout: 180_000,
  },
});
