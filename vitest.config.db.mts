import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

import { TEST_DATABASE_URL, TEST_ENCRYPTION_KEY } from "./tests/db-test-env.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Separate config for the DB-backed API test suite (`npm run test:db`):
// these tests hit a real local Postgres database and are excluded from
// the default `npm run test` unit-test run in vitest.config.mts.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.dbtest.ts"],
    exclude: ["node_modules", ".next"],
    globalSetup: ["./tests/db-global-setup.ts"],
    // Route handlers read DATABASE_URL/ENCRYPTION_KEY at module load, so
    // these must be set before any test file (or its imports) run.
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      ENCRYPTION_KEY: TEST_ENCRYPTION_KEY,
    },
    // The suite shares one Postgres connection pool; running test files
    // in parallel workers would race TRUNCATE against concurrent queries.
    fileParallelism: false,
  },
});
