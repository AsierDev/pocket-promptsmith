import { getProfile, getSession } from '@/lib/supabaseServer';
import { LimitsBanner } from '@/features/limits/LimitsBanner';
import { signOut } from '@/features/auth/actions';
import { redirect } from 'next/navigation';
import { PremiumUsageProvider } from '@/features/ai-improvements/PremiumUsageProvider';
import { FREEMIUM_LIMITS } from '@/lib/limits';
import { BottomNav } from '@/components/navigation/BottomNav';
import { TopTabs } from '@/components/navigation/TopTabs';

export default async function PromptsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await getProfile();
  const userEmail = profile?.email ?? session.user?.email ?? '';
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

  return (
    <PremiumUsageProvider
      usedToday={profile?.improvements_used_today ?? 0}
      limit={FREEMIUM_LIMITS.improvementsPerDay}
      lastResetAt={profile?.improvements_reset_at ?? null}
    >
      <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-8">
              <div className="text-xl font-bold text-slate-900">
                Pocket Promptsmith
              </div>
              <TopTabs />
            </div>
            <div className="flex items-center gap-3">
              {userEmail && (
                <span className="hidden text-sm text-slate-600 sm:inline-flex">{userEmail}</span>
              )}
              <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {userInitial}
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-xs font-semibold text-slate-500 transition hover:text-primary"
                  >
                    Salir
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <LimitsBanner promptCount={profile?.prompt_quota_used ?? 0} />
          <div className="mt-6">
            {children}
          </div>
        </main>

        <BottomNav />
      </div>
    </PremiumUsageProvider>
  );
}
