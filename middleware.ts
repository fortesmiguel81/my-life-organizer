import { NextResponse } from "next/server";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/api/uploadthing"]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except for those with a file extension or within /_next/
    "/((?!.*\\..*|_next|public).*)", // Exclude paths with a file extension (e.g., .svg, .png) and _next and public folders
    "/",
    "/(api|trcp)(.*)",
  ],
};
