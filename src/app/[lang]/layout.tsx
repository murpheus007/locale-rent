'use client';

import '../globals.css';
import '@/shared/styles/tokens.css';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { locales } from '@/shared/i18n/routing';
import { getMessages } from 'next-intl/server';
import { usePathname } from 'next/navigation';

export const metadata: Metadata = {
  title: 'LocaleRent',
  description: 'Find your perfect stay, anywhere in the world',
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;

  if (!locales.includes(lang as (typeof locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const pathname = usePathname();
  const isDashboard = pathname?.includes('/dashboard');

  return (
    <NextIntlClientProvider messages={messages}>
      <html lang={lang}>
        <body className="bg-background text-foreground antialiased">
          <div className="flex min-h-screen flex-col">
            {!isDashboard && <Header />}
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </body>
      </html>
    </NextIntlClientProvider>
  );
}