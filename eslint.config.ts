import globals from 'globals';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      curly: ['error', 'all'],
    },
  },
  tseslint.configs.recommended,
  js.configs.recommended,
  {
    files: ['**/*.{ts,mts,cts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['src/**/*.test.ts'],
    languageOptions: { globals: { ...globals.browser, ...globals.jest } },
  },
  {
    files: [
      'vite.config.ts',
      'jest.config.cjs',
      '*.cjs',
      '*.config.{js,ts,cjs,mjs}',
    ],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
]);
