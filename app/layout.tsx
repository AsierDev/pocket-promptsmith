import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/components/common/Providers';
import { PwaProvider } from '@/features/pwa/PwaProvider';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Pocket Promptsmith',
    template: '%s • Pocket Promptsmith'
  },
  description:
    'Organiza y mejora tus mejores prompts con variables dinámicas, IA y modo offline en Pocket Promptsmith.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg'
  }
};

export const viewport: Viewport = {
  themeColor: '#7C3AED'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-100">
        <Suspense fallback={null}>
          <AppProviders>
            <PwaProvider />
            {children}
          </AppProviders>
        </Suspense>
      </body>
    </html>
  );
}
