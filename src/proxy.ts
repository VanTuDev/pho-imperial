import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE, resolveLocale } from "./i18n/config";

const ADMIN_TOKEN_COOKIE = "admin_token";

/**
 * - `/admin/*` (except the login page): optimistic auth gate — bounce to
 *   `/admin/login` when there is no session cookie. Real verification happens
 *   in every admin API call against the backend.
 * - Everything else: on the first visit (no locale cookie yet) pick a language
 *   from `Accept-Language` and pin it in a cookie the app reads server-side.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!request.cookies.get(ADMIN_TOKEN_COOKIE)?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(existing)) return NextResponse.next();

  const locale = resolveLocale(request.headers.get("accept-language"));
  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  // Run on pages only — skip API routes, Next internals and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|Menu|.*\\.[\\w]+$).*)"],
};
