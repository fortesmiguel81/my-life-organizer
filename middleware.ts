import { NextRequest, NextResponse } from "next/server";

import { PROFILE_COOKIE } from "@/lib/local-auth";
import { isValidSiteToken, SITE_AUTH_COOKIE } from "@/lib/site-auth";

const isSiteAuthPublic = (pathname: string) =>
  pathname.startsWith("/site-login") || pathname.startsWith("/api/site-auth");

const isProfilePublic = (pathname: string) =>
  pathname.startsWith("/select-profile") || pathname.startsWith("/api/profiles");

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isSiteAuthPublic(pathname)) {
    return NextResponse.next();
  }

  const siteToken = request.cookies.get(SITE_AUTH_COOKIE)?.value;
  if (!(await isValidSiteToken(siteToken))) {
    const url = new URL("/site-login", request.url);
    url.searchParams.set("redirect_url", pathname + search);
    return NextResponse.redirect(url);
  }

  if (isProfilePublic(pathname) || request.cookies.has(PROFILE_COOKIE)) {
    return NextResponse.next();
  }

  const url = new URL("/select-profile", request.url);
  url.searchParams.set("redirect_url", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Match all routes except for those with a file extension or within /_next/
    "/((?!.*\\..*|_next|public).*)", // Exclude paths with a file extension (e.g., .svg, .png) and _next and public folders
    "/",
    "/(api|trcp)(.*)",
  ],
};
