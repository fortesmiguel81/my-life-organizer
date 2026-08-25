import { execFileSync } from "child_process";

import { TEST_DATABASE_URL } from "./db-test-env";

/**
 * Runs once before the DB-backed test suite. Applies all Drizzle
 * migrations to the local test database so the schema is current —
 * the same migrations that ship in drizzle/, just pointed at
 * milo_test instead of the dev database.
 */
export default function setup() {
  execFileSync("npx", ["drizzle-kit", "migrate"], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });
}
