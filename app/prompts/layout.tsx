import Link from 'next/link';
import { getProfile, getSession } from '@/lib/supabaseServer';
import { LimitsBanner } from '@/features/limits/LimitsBanner';
import { signOut } from '@/features/auth/actions';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/features/prompts/components/DashboardNav';

export default async function PromptsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await getProfile();
  const userEmail = profile?.email ?? session.user?.email ?? '';
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/prompts" className="text-xl font-semibold text-slate-900">
              Pocket Promptsmith
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-slate-500 md:flex">
              <Link href="/prompts" className="transition hover:text-primary">
                Biblioteca
              </Link>
              <span className="cursor-not-allowed text-slate-400" title="Próximamente">
                Colecciones (soon)
              </span>
              <span className="cursor-not-allowed text-slate-400" title="Próximamente">
                Historial IA
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/prompts/new"
              className="rounded-full bg-primary/90 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-primary"
            >
              + Nuevo prompt
            </Link>
            {userEmail && (
              <span className="hidden text-sm text-slate-600 sm:inline-flex">{userEmail}</span>
            )}
            <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                {userInitial}
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-xs font-semibold text-slate-500 transition hover:text-primary"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
        <LimitsBanner
          promptCount={profile?.prompt_quota_used ?? 0}
          improvementsUsed={profile?.improvements_used_today ?? 0}
        />
        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mi biblioteca</p>
              <DashboardNav />
            </div>
          </aside>
          <section className="space-y-6">{children}</section>
        </div>
      </main>
    </div>
  );
}
