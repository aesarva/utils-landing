// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://utils.cyber-tech.online',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  vite: {
    // Ничего не инлайним в data:-URI: все ресурсы остаются отдельными файлами.
    build: { assetsInlineLimit: 0 },
  },
});
