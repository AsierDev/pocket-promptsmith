import { getProfile } from '@/lib/supabaseServer';
import { fetchPrompts } from '@/features/prompts/services';
import { PromptCard } from '@/features/prompts/components/PromptCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const profile = await getProfile();
    const { prompts } = await fetchPrompts({ sort: 'recent' });
    const recentPrompts = prompts.slice(0, 4);

    const totalPrompts = prompts.length;
    const favoriteCount = prompts.filter(p => p.is_favorite).length;
    const usedToday = profile?.prompt_quota_used ?? 0;

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">
                    Hola, {profile?.email?.split('@')[0] || 'Usuario'} 👋
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                    Bienvenido a tu biblioteca de prompts
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-violet-600">Prompts creados</p>
                            <p className="mt-2 text-3xl font-bold text-violet-900">{usedToday}/10</p>
                        </div>
                        <div className="rounded-full bg-violet-500/10 p-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-6 w-6 text-violet-600"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-700">Favoritos</p>
                            <p className="mt-2 text-3xl font-bold text-amber-900">{favoriteCount}</p>
                        </div>
                        <div className="rounded-full bg-amber-500/10 p-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-6 w-6 text-amber-600"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Prompts */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Recientes</h2>
                    <Link
                        href="/prompts/library"
                        className="text-sm font-semibold text-primary transition hover:text-violet-700"
                    >
                        Ver todos →
                    </Link>
                </div>
                {recentPrompts.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {recentPrompts.map((prompt) => (
                            <PromptCard key={prompt.id} prompt={prompt} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                        <p className="text-sm text-slate-600">Aún no has creado ningún prompt.</p>
                        <Link
                            href="/prompts/new"
                            className="mt-3 inline-flex rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-violet-600"
                        >
                            Crear mi primer prompt
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
