import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// Cloudflare Pages: static output, deployed via `astro build` → dist/
export default defineConfig({
  site: 'https://europeanscrapmarket.com',
  output: 'static',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en' },
      },
    }),
    tailwind({ applyBaseStyles: false }),
  ],
});
