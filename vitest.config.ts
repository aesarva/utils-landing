/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig подключает виртуальные модули Astro, поэтому тесты могут импортировать код из src/ напрямую.
export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
});
