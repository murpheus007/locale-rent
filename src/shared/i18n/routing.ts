import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'de'],
  defaultLocale: 'en',
});

export const locales = routing.locales;
export type Locale = (typeof routing.locales)[number];
