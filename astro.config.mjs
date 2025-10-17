import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  integrations: [react(), mdx(), tailwind()],
  output: 'static',
  site: isProd ? 'https://patrykgaluszka.github.io' : 'http://localhost:4321',
  base: isProd ? '/la-manga-app' : '/',
});