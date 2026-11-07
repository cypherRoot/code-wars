/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import { parse as parseYaml } from 'yaml';

/** Turns `*.yaml` imports into plain JSON modules. Content is validated with zod at load time. */
function yamlPlugin(): Plugin {
  return {
    name: 'dataforge-yaml',
    transform(code, id) {
      if (!id.endsWith('.yaml')) return null;
      return { code: `export default ${JSON.stringify(parseYaml(code))};`, map: null };
    },
  };
}

export default defineConfig({
  plugins: [
    yamlPlugin(),
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react({ include: /\.(mdx|tsx|ts)$/ }),
  ],
  optimizeDeps: { exclude: ['@duckdb/duckdb-wasm'] },
  worker: { format: 'es' },
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/unit/setup.ts'],
  },
});
