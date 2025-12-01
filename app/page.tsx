import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/authUtils';

export const dynamic = 'force-dynamic';

const featureCards = [
  {
    title: 'Variables inteligentes',
    description: 'Detectamos {{variables}} automáticamente y generamos formularios dinámicos.'
  },
  {
    title: 'Mejoras con IA',
    description: 'Aplica sugerencias con diff visual usando modelos gratuitos de OpenRouter.'
  },
  {
    title: 'Modo offline',
    description: 'Funciona como app instalable con caché de prompts y service worker propio.'
  }
];

export default async function LandingPage() {
  const session = await getSession();
  const headerCtaHref = session ? '/prompts' : '/login';
  const headerCtaLabel = session ? 'Dashboard' : 'Entrar';
  const heroCtaHref = session ? '/prompts' : '/login';
  const heroCtaLabel = session ? 'Ir a mis prompts' : 'Guardar mis prompts';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <header className="sticky top-0 z-10 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold sm:text-xl">
            Pocket Promptsmith
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600 sm:gap-6">
            <a href="#features" className="hidden transition hover:text-primary sm:block">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="hidden transition hover:text-primary sm:block">
              Cómo funciona
            </a>
            <Link
              href={headerCtaHref}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 md:px-6 md:text-base"
            >
              {headerCtaLabel}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
        <section className="flex flex-col gap-8 text-center">
          <p className="mx-auto w-fit rounded-full bg-violet-100 px-4 py-1 text-sm font-semibold text-violet-700">
            PWA + IA + Variables dinámicas
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Tu biblioteca inteligente de prompts
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Guarda, organiza y reutiliza tus mejores prompts, detecta variables en segundos y aplícales
              mejoras con IA directamente desde el dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={heroCtaHref}
              className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-violet-600"
            >
              {heroCtaLabel}
            </Link>
            <Link
              href="#features"
              className="rounded-full border border-slate-300 px-8 py-3 text-base font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
            >
              Ver funcionalidades
            </Link>
          </div>
        </section>

        <section
          id="features"
          className="grid gap-6 rounded-3xl border border-slate-200 bg-white/80 p-8 text-left shadow-card md:grid-cols-3"
        >
          {featureCards.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{feature.description}</p>
            </div>
          ))}
        </section>

        <section
          id="como-funciona"
          className="grid gap-8 rounded-3xl border border-slate-200 bg-white/90 p-8 text-left shadow-card md:grid-cols-2"
        >
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Cómo funciona</p>
            <h2 className="text-3xl font-bold">Todo el flujo en una sola vista</h2>
            <p className="text-base text-slate-600">
              Autenticación sin contraseñas, filtros avanzados, formulario con validaciones en vivo y
              modal para usar tus prompts con variables. El dashboard incluye navegación lateral para que
              siempre tengas a mano las acciones principales.
            </p>
          </div>
          <ul className="space-y-4 text-sm text-slate-600">
            <li className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <strong className="text-slate-900">1. Envía un magic link.</strong> Recibe el enlace,
              haz clic y llegarás directo al dashboard protegido.
            </li>
            <li className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <strong className="text-slate-900">2. Crea y organiza.</strong> Formularios completos con
              categorías, tags y límites claros para el plan free.
            </li>
            <li className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <strong className="text-slate-900">3. Usa o mejora.</strong> Detecta variables, copia tus
              prompts y, si lo necesitas, pide mejoras con IA y aplica el diff.
            </li>
          </ul>
        </section>

        <div className="flex justify-center">
          <Image src="/icons/icon.svg" width={120} height={120} alt="Pocket Promptsmith" />
        </div>
      </main>
    </div>
  );
}
