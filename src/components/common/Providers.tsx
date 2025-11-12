'use client';

import { ThemeProvider } from 'next-themes';
import { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster position="bottom-center" richColors expand closeButton />
    </ThemeProvider>
  );
};
