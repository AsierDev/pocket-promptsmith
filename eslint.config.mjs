import nextConfig from 'eslint-config-next';
import globals from 'globals';

const config = [
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
