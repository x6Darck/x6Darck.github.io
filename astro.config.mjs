import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// [PENDIENTE] dominio final. Se puede fijar con SITE_URL al hacer build.
const site = process.env.SITE_URL || 'https://x6darck.github.io';

export default defineConfig({
  site,
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    sitemap({ i18n: { defaultLocale: 'es', locales: { es: 'es-CO', en: 'en' } } }),
  ],
  vite: { plugins: [tailwindcss()] },
});
