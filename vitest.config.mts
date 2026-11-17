import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.tsx'],
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.tsx',
        '**/*.config.{ts,js,mts}',
        '**/types/**',
        '**/*.d.ts',
        'src/app/**/layout.tsx',
        'src/app/**/template.tsx',
      ],
      // Floor thresholds set just below current coverage to guard against
      // regressions. Raise them as coverage grows.
      thresholds: {
        lines: 72,
        branches: 53,
        functions: 60,
        statements: 72,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './__tests__'),
    },
  },
});
