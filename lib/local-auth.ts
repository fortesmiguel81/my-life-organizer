import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import { cookies } from "next/headers";

export const PROFILE_COOKIE = "milo_profile_id";

type LocalAuth = { userId: string };

/** Mirrors @hono/clerk-auth's getAuth(c) shape so route handlers barely change. */
export function getAuth(c: Context): LocalAuth | null {
  const userId = getCookie(c, PROFILE_COOKIE);
  return userId ? { userId } : null;
}

/** Same, for Next.js App Router route handlers (no Hono context). */
export function getServerAuth(): LocalAuth | null {
  const userId = cookies().get(PROFILE_COOKIE)?.value;
  return userId ? { userId } : null;
}
