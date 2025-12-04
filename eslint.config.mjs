import nextConfig from 'eslint-config-next';
import importPlugin from 'eslint-plugin-import';
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
    plugins: {
      import: importPlugin
    },
    rules: {
      'import/order': ['error', {
        'groups': [
          'builtin',      // Node.js built-in modules
          'external',     // External packages
          'internal',     // Internal aliased modules
          ['parent', 'sibling'], // Relative imports
          'index'         // Index imports
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }],
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error'
    }
  },
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
