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
      entry: {
        index: resolve(__dirname, 'lib/index.ts'),
        dynamodb: resolve(__dirname, 'lib/dynamodb/index.ts'),
        'secrets-manager': resolve(__dirname, 'lib/secrets-manager/index.ts'),
        s3: resolve(__dirname, 'lib/s3/index.ts'),
      },
      name: 'HonoAwsMiddlewares',
      fileName: (format, entryName) =>
        entryName === 'index' ? `index.${format}.js` : `${entryName}/index.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'hono',
        '@aws-sdk/client-dynamodb',
        '@aws-sdk/client-secrets-manager',
        '@aws-sdk/client-s3',
      ],
      output: {
        globals: {
          hono: 'Hono',
          '@aws-sdk/client-dynamodb': 'AwsSdkClientDynamodb',
          '@aws-sdk/client-secrets-manager': 'AwsSdkClientSecretsManager',
          '@aws-sdk/client-s3': 'AwsSdkClientS3',
        },
      },
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
