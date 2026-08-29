import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE, resolveLocale } from "./src/i18n/config";

/**
 * On the first visit (no locale cookie yet) pick a language from the browser's
 * `Accept-Language` header and pin it in a cookie. There is no locale in the
 * URL — the app reads this cookie server-side to render the right dictionary.
 */
export function proxy(request: NextRequest) {
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
