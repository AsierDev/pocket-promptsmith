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
        accent: '#F87171'
      },
      boxShadow: {
        card: '0 2px 14px 0 rgba(15, 23, 42, 0.14)'
      }
    }
  },
  plugins: []
};

export default config;
