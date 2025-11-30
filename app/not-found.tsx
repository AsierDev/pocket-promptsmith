import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">Página no encontrada</h1>
      <p className="text-slate-500">La página que buscas no existe.</p>
      <Link href="/" className="rounded-full bg-primary px-6 py-2 font-semibold text-white transition hover:bg-violet-600">
        Volver al inicio
      </Link>
    </main>
  );
}
