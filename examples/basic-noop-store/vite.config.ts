/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/examples/basic-noop-store',
    plugins: [angular(), nxViteTsPaths()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      passWithNoTests: true,
      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../coverage/examples/basic-noop-store',
        provider: 'v8' as const,
      },
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
    server: {
      fs: {
        allow: ['../..'],
      },
    },
  };
});
