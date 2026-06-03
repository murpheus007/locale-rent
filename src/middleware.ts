import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Routes that don't require authentication (without locale prefix — checked dynamically)
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

// Routes that require authentication but should be accessible to all authenticated users
// (not redirecting to dashboard)
const AUTH_ROUTES = [
  "/dashboard",
  "/onboarding",
  "/dashboard/listings",
  "/dashboard/bookings",
  "/dashboard/messages",
  "/dashboard/settings",
];

export async function middleware(request: NextRequest) {
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
  const pathname = request.nextUrl.pathname;

  // Strip locale prefix for route matching (e.g. /en/auth/signin -> /auth/signin)
  const localeMatch = pathname.match(/^\/(en|fr|de)(\/|$)/);
  const pathnameWithoutLocale = localeMatch ? pathname.replace(/^\/(en|fr|de)/, '') || '/' : pathname;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(route + "/")
  );
  const isGuestOnly = GUEST_ONLY_ROUTES.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(route + "/")
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(route + "/")
  );

  // Redirect authenticated users away from guest-only routes
  if (session && isGuestOnly) {
    // Check if profile needs onboarding
    const needsOnboarding = !session.user.user_metadata?.full_name;
    const locale = pathname.split('/')[1] || 'en';
    if (needsOnboarding && pathname !== `/${locale}/onboarding`) {
      return NextResponse.redirect(new URL(`/${locale}/onboarding`, request.url));
    }
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Redirect unauthenticated users to sign-in for protected routes
  if (!session && (isAuthRoute || !isPublicRoute)) {
    // Extract locale from pathname (e.g. /en/dashboard -> en)
    const locale = pathname.split('/')[1] || 'en';
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
