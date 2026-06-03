import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createMiddleware as createIntlMiddleware } from "next-intl/middleware";
import { routing } from "@/shared/i18n/routing";

// Create the next-intl middleware
const intlMiddleware = createIntlMiddleware(routing);

// Routes that don't require authentication (without locale prefix)
const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/callback",
  "/auth/verify",
  "/search",
  "/about",
  "/faq",
  "/contact",
  "/pricing",
  "/property",
];

// Routes that should redirect to dashboard if already authenticated
const GUEST_ONLY_ROUTES = [
  "/auth/signin",
  "/auth/signup",
];

// Routes that require authentication
const AUTH_ROUTES = [
  "/dashboard",
  "/onboarding",
  "/dashboard/listings",
  "/dashboard/bookings",
  "/dashboard/messages",
  "/dashboard/settings",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Step 1: Let next-intl handle locale detection and redirect
  // This ensures / -> /en (or /fr, /de) based on browser language
  const intlResponse = intlMiddleware(request);

  // If next-intl issued a redirect (e.g. / -> /en), return it immediately
  if (intlResponse.headers.get("location")) {
    return intlResponse;
  }

  // Step 2: Auth checks on the locale-prefixed pathname
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Strip locale prefix for route matching
  const localeMatch = pathname.match(/^\/(en|fr|de)(\/|$)/);
  const pathnameWithoutLocale = localeMatch
    ? pathname.replace(/^\/(en|fr|de)/, "") || "/"
    : pathname;
  const locale = localeMatch?.[1] ?? "en";

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(route + "/")
  );
  const isGuestOnly = GUEST_ONLY_ROUTES.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(route + "/")
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(route + "/")
  );

  // Redirect authenticated users away from guest-only routes
  if (session && isGuestOnly) {
    const needsOnboarding = !session.user.user_metadata?.full_name;
    if (needsOnboarding && pathnameWithoutLocale !== "/onboarding") {
      return NextResponse.redirect(
        new URL(`/${locale}/onboarding`, request.url)
      );
    }
    return NextResponse.redirect(
      new URL(`/${locale}/dashboard`, request.url)
    );
  }

  // Redirect unauthenticated users to sign-in for protected routes
  if (!session && (isAuthRoute || !isPublicRoute)) {
    const redirectUrl = new URL(`/${locale}/auth/signin`, request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
