import { LogoutButton } from '@/components/auth/LogoutButton';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { WizardLayoutWrapper } from '@/components/layout/WizardLayoutWrapper';
import { BottomNav } from '@/components/navigation/BottomNav';
import { TopTabs } from '@/components/navigation/TopTabs';
import { PremiumUsageProvider } from '@/features/ai-improvements/PremiumUsageProvider';
import { FREEMIUM_LIMITS } from '@/lib/limits';
import { getProfile } from '@/lib/supabaseServer';

export default async function PromptsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Note: Authentication is handled by proxy.ts for all /prompts/* routes
  // Do NOT add session check here - it causes race condition with PWA localStorage hydration
  const profile = await getProfile();
  const userEmail = profile?.email ?? '';
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

  return (
    <PremiumUsageProvider
      usedToday={profile?.improvements_used_today ?? 0}
      limit={FREEMIUM_LIMITS.improvementsPerDay}
      lastResetAt={profile?.improvements_reset_at ?? null}
    >
      <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950 lg:pb-0">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-8">
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                Pocket Promptsmith
              </div>
              <TopTabs />
            </div>
            <div className="flex items-center gap-3">
              {userEmail && (
                <span className="hidden text-sm text-slate-600 dark:text-slate-400 sm:inline-flex">
                  {userEmail}
                </span>
              )}
              <ThemeToggle />
              <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 dark:border-slate-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {userInitial}
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        <WizardLayoutWrapper promptCount={profile?.prompt_quota_used ?? 0}>
          {children}
        </WizardLayoutWrapper>

        <BottomNav />
      </div>
    </PremiumUsageProvider>
  );
}
