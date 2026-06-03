import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');

const nextConfig: NextConfig = {
  turbopack: {
    root: '/home/clawbot/locale-rent',
  },
};

export default withNextIntl(nextConfig);
