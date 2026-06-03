import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { routing } from "@/shared/i18n/routing";

// Routes that don't require authentication (without locale prefix)
const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/callback",
  "/auth/verify",
  "/auth/forgot-password",
  "/auth/reset-password",
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

function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr|de)(\/|$)/);
  return match?.[1] ?? "";
}

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|fr|de)/, "") || "/";
}

function detectLocale(request: NextRequest): string {
  // Check cookie first
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && routing.locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(",")[0].split("-")[0].trim();
    if (routing.locales.includes(preferred as any)) {
      return preferred;
    }
  }

  return routing.defaultLocale;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Step 1: Handle locale redirect for paths without locale prefix
  const hasLocale = /^\/(en|fr|de)(\/|$)/.test(pathname);
  const isStaticAsset = /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/.test(pathname);
  const isNextInternal = pathname.startsWith("/_next") || pathname.startsWith("/api");

  if (!hasLocale && !isStaticAsset && !isNextInternal) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  // Step 2: Auth checks
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
  const pathnameWithoutLocale = stripLocale(pathname);
  const locale = getLocaleFromPathname(pathname) || detectLocale(request);

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
