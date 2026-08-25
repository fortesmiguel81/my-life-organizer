/**
 * Fixed, local-only connection details for the DB-backed test suite.
 * Not secrets: they point at a throwaway Postgres database on localhost
 * (see CLAUDE.md "DB-backed API tests") and are shared between
 * vitest.config.db.mts (test.env) and the global setup script so both
 * agree on which database to migrate/connect to.
 */
export const TEST_DATABASE_URL =
  "postgres://postgres:devpass@localhost:5432/milo_test";

export const TEST_ENCRYPTION_KEY =
  "6e43051d483c33277c409b3125855249683d355d790a0ced310595e976cfa7b6";
