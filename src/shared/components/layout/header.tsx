import Link from "next/link";
import { getLocale } from "next-intl/server";
import { LanguageSwitcher } from "./language-switcher";
import { UserNav } from "./user-nav";
import { type Locale } from "@/shared/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function Header() {
  const locale = (await getLocale()) as Locale;
  const tNav = await getTranslations("nav");
  const homeHref = `/${locale}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={homeHref} className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            LR
          </span>
          <span className="text-lg font-bold text-dark tracking-tight">
            LocaleRent
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-mid"
        >
          <Link className="transition-colors hover:text-primary" href={`${homeHref}#featured`}>
            {tNav("discover")}
          </Link>
          <Link className="transition-colors hover:text-primary" href={`${homeHref}#how-it-works`}>
            {tNav("howItWorks")}
          </Link>
          <Link className="transition-colors hover:text-primary" href={`${homeHref}#hosts`}>
            {tNav("hosts")}
          </Link>
          <Link className="transition-colors hover:text-primary" href={`${homeHref}#faq`}>
            {tNav("faq")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
