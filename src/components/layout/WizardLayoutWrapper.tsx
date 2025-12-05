'use client';

import { usePathname } from 'next/navigation';

import { LimitsBanner } from '@/features/limits/LimitsBanner';

interface WizardLayoutWrapperProps {
  children: React.ReactNode;
  promptCount: number;
}

export function WizardLayoutWrapper({
  children,
  promptCount
}: WizardLayoutWrapperProps) {
  const pathname = usePathname();
  const isInWizard = pathname === '/prompts/new' || pathname?.includes('/edit');

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {!isInWizard && <LimitsBanner promptCount={promptCount} />}
      <div className={!isInWizard ? 'mt-6' : ''}>{children}</div>
    </main>
  );
}
