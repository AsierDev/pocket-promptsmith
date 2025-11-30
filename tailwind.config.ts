import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          foreground: '#FFFFFF'
        },
        accent: '#F87171',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-primary-dark': 'var(--text-primary-dark)',
        'text-secondary-dark': 'var(--text-secondary-dark)'
      },
      borderRadius: {
        'card': '1.5rem',
        'card-sm': '1rem'
      },
      boxShadow: {
        'card': '0 2px 14px 0 rgba(15, 23, 42, 0.14)',
        'card-hover': '0 4px 20px 0 rgba(15, 23, 42, 0.18)',
        'card-subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.08)'
      },
      lineHeight: {
        'relaxed': 'var(--line-height-relaxed)',
        'comfortable': 'var(--line-height-comfortable)'
      }
    }
  },
  plugins: []
};

export default config;
