"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale, locales } from "@/shared/i18n/routing";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();

  // Strip current locale from pathname to get the path without locale
  const pathWithoutLocale = pathname.replace(/^\/(en|fr|de)/, "") || "/";

  return (
    <div className="flex items-center rounded-full border border-border/70 bg-background p-1 text-xs font-medium">
      {locales.map((locale) => (
        <Link
          key={locale}
          aria-current={locale === currentLocale ? "page" : undefined}
          className={[
            "rounded-full px-3 py-1.5 transition-colors",
            locale === currentLocale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
          href={`/${locale}${pathWithoutLocale}`}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
