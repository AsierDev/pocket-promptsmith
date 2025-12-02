'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { useUiStore } from '@/store/uiStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const PwaProvider = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const installBannerVisible = useUiStore(
    (state) => state.installBannerVisible
  );
  const setInstallBannerVisible = useUiStore(
    (state) => state.setInstallBannerVisible
  );
  const [bannerDismissed, setBannerDismissed] = useLocalStorage<boolean>(
    'pps-install-banner-dismissed',
    false
  );

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log(
            '[DEBUG PWA] Service Worker registered successfully:',
            registration
          );
        })
        .catch((error) => {
          console.error('[DEBUG PWA] SW registration failed', error);
        });
    }
  }, []);

  useEffect(() => {
    if (bannerDismissed) return;

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setInstallBannerVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handler as EventListener
      );
    };
  }, [bannerDismissed, setInstallBannerVisible]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    // @ts-expect-error Custom event type from browsers
    deferredPrompt.prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    if (outcome !== 'dismissed') {
      setInstallBannerVisible(false);
      setBannerDismissed(true);
    }
    setDeferredPrompt(null);
  };

  const handleLater = () => {
    setInstallBannerVisible(false);
    setBannerDismissed(true);
  };

  if (!installBannerVisible || bannerDismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] max-w-sm rounded-2xl bg-white p-4 shadow-card dark:bg-slate-800">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        Instala Pocket Promptsmith
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
        Disfruta del modo offline y acceso rápido desde tu escritorio.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Button onClick={handleInstall} className="flex-1">
          Instalar app
        </Button>
        <Button variant="ghost" onClick={handleLater}>
          Luego
        </Button>
      </div>
    </div>
  );
};
