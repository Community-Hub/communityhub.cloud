import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";

// CMS_TEST_PORT lets two worktrees run their own dev servers side by side.
const port = Number(process.env.CMS_TEST_PORT ?? 8080);

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "retain-on-failure" },
  projects: [
    // The public site. Never touches the editor.
    { name: "chromium", testIgnore: /admin\.spec\.ts/, use: { browserName: "chromium" } },
    // The editor, on its own host (admin.localhost). It changes site content, so it runs after the public
    // tests have finished (and puts everything back when it is done).
    { name: "admin", testMatch: /admin\.spec\.ts/, dependencies: ["chromium"], use: { browserName: "chromium" } },
  ],
  webServer: {
    command: `node scripts/with-app-env.mjs vite dev --host 127.0.0.1 --port ${port}`,
    // Tests always run on the local pglite database, never the hosted one.
    env: {
      DATABASE_URL: "",
      BLOB_READ_WRITE_TOKEN: "",
      ADMIN_EMAILS: "editor@example.test",
      ADMIN_HOST: `admin.localhost:${port}`,
      ADMIN_SIGNUP_CODE: "test-signup-code-0123456789",
      BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-0123",
      BETTER_AUTH_URL: `http://admin.localhost:${port}`,
      CMS_MEDIA_DIR: join(tmpdir(), `cms-test-media-${port}`),
    },
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
