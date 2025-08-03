/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['lib/**/*'],
      exclude: ['lib/**/*.test.ts', 'lib/**/*.spec.ts'],
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'MyLibrary',
      fileName: format => `index.${format}.js`,
      formats: ['es', 'cjs', 'umd'],
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['lib/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.{ts,tsx}'],
      exclude: ['node_modules/', 'dist/', 'test/', '**/*.d.ts', '**/*.config.ts', '**/*.config.js'],
    },
    pool: 'forks',
  },
});
