/**
 * Only ever redirect to a same-origin relative path. `redirect_url` round-trips
 * through a query string set by middleware and read back by client pages, so
 * without this a crafted link (?redirect_url=https://evil.example or
 * //evil.example) could bounce a logged-in visitor off-site.
 */
export function safeRedirectPath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
