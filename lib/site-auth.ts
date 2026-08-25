/**
 * A single shared "household password" gate in front of the whole app.
 * This is intentionally not per-user auth (see lib/local-auth.ts's profile
 * picker for that) — it's a low-friction barrier so the app isn't wide open
 * to anything that can reach it on the network.
 *
 * The site-auth cookie is an HMAC of a fixed constant keyed by APP_PASSWORD,
 * not a random session id — verifying it doesn't need server-side session
 * storage, and changing APP_PASSWORD instantly invalidates every existing
 * cookie. Uses Web Crypto so it works in both Edge middleware and Node.
 *
 * Required env var: APP_PASSWORD. If unset, every request is rejected
 * (fail closed) rather than leaving the app open by default.
 */

export const SITE_AUTH_COOKIE = "milo_site_auth";

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeSiteToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("milo-site-auth-v1"));
  return toHex(sig);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function isValidSiteToken(token: string | undefined): Promise<boolean> {
  const password = process.env.APP_PASSWORD;
  if (!password || !token) return false;

  const expected = await computeSiteToken(password);
  return timingSafeEqual(token, expected);
}
