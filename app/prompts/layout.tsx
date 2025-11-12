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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/prompts" className="text-lg font-semibold text-slate-900">
            Pocket Promptsmith
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            {userEmail && (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-700">{userEmail}</span>
            )}
            <Link
              href="/prompts/new"
              className="rounded-full border border-slate-200 px-4 py-2 font-medium transition hover:border-primary hover:text-primary"
            >
              + Nuevo prompt
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[220px,1fr]">
        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Navegación</p>
            <DashboardNav />
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Atajos rápidos</p>
            <ul className="mt-2 space-y-2">
              <li>★ Marca favoritos con un clic</li>
              <li>⌘K / Ctrl+K para buscar (próximamente)</li>
            </ul>
          </div>
        </aside>
        <section className="space-y-6">
          <LimitsBanner
            promptCount={profile?.prompt_quota_used ?? 0}
            improvementsUsed={profile?.improvements_used_today ?? 0}
          />
          {children}
        </section>
      </div>
    </div>
  );
}
