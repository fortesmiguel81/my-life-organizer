import { NextRequest, NextResponse } from "next/server";

import { PROFILE_COOKIE } from "@/lib/local-auth";

const isPublicPath = (pathname: string) =>
  pathname.startsWith("/select-profile") || pathname.startsWith("/api/profiles");

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname) || request.cookies.has(PROFILE_COOKIE)) {
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
