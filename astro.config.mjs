import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://qleaps.in',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  server: { host: '127.0.0.1', port: 4321 },
});
