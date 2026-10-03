import { defineConfig } from 'astro/config';
import { verifyBuiltSite } from './scripts/verify-build.mjs';

export default defineConfig({
  site: 'https://www.communityhub.cloud',
  output: 'static',
  build: { format: 'file' },
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  integrations: [{ name: 'community-hub-copy-policy', hooks: { 'astro:build:done': ({ dir }) => verifyBuiltSite(dir) } }],
  vite: { build: { assetsInlineLimit: 0 } },
});
