import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PRIMARY_ROLE_ORDER,
  canAccessPath,
  getPrimaryRole,
  getRoleHomePath,
  parseCurrentUserCookie
} from "@/lib/auth/roles";
import { AUTH_COOKIE_NAMES } from "@/lib/auth/session";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const currentUserCookie = request.cookies.get(AUTH_COOKIE_NAMES.currentUser)?.value;
  const currentUser = parseCurrentUserCookie(currentUserCookie);
  const isProtectedPath = pathname.startsWith("/app") || pathname.startsWith("/portal");
  const isLoginPath = pathname === "/login";

  if (!accessToken || !currentUser) {
    if (isProtectedPath) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(`${pathname}${search}`)}`, request.url)
      );
    }

    return NextResponse.next();
  }

  const primaryRole = getPrimaryRole(currentUser.roleCodes);

  if (!primaryRole || !PRIMARY_ROLE_ORDER.includes(primaryRole)) {
    return NextResponse.next();
  }

  if (isLoginPath) {
    return NextResponse.redirect(new URL(getRoleHomePath(primaryRole), request.url));
  }

  if (isProtectedPath && !canAccessPath(currentUser.roleCodes, pathname)) {
    return NextResponse.redirect(new URL(getRoleHomePath(primaryRole), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/app/:path*", "/portal/:path*"]
};
