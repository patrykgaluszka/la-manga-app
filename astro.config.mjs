import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import staticAdapter from '@astrojs/adapter-static';

export default defineConfig({
  integrations: [react(), mdx(), tailwind()],
  output: 'static',
  adapter: staticAdapter(),
  site: 'https://patrykgaluszka.github.io/la-manga-app',
  base: '/la-manga-app',
});