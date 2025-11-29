import nextConfig from 'eslint-config-next';
import globals from 'globals';

const config = [
  {
    ignores: [
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      '.next/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      'generate-icons.js'
    ]
  },
  ...nextConfig,
  {
    files: ['tests/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest
      }
    }
  }
];

export default config;
