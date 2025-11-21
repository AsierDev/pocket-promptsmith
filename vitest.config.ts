import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['tests/integration/**'],
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'test-anon-key',
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? 'test-openrouter-key',
      OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        'src/types/**',
        'src/**/*.d.ts',
        '**/*.stories.*',
        'src/lib/supabaseServer.ts',
        'src/features/**/actions.ts',
        'src/features/ai-improvements/PremiumUsageProvider.tsx',
        'src/features/limits/LimitsBanner.tsx',
        'src/features/prompts/components/**',
        'src/features/pwa/**',
        'src/components/**',
        'src/hooks/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
