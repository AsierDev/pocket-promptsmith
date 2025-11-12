# Pocket Promptsmith

Pocket Promptsmith es una PWA construida con **Next.js 16 (App Router + React 19)** que permite guardar, organizar y mejorar prompts reutilizables con variables dinámicas y ayuda de IA usando OpenRouter.

## Tabla de contenido
1. [Stack y dependencias clave](#stack-y-dependencias-clave)
2. [Estructura de carpetas](#estructura-de-carpetas)
3. [Variables de entorno](#variables-de-entorno)
4. [Setup inicial](#setup-inicial)
5. [Scripts disponibles](#scripts-disponibles)
6. [Guía de uso funcional](#guía-de-uso-funcional)
7. [Decisiones técnicas](#decisiones-técnicas)
8. [Testing](#testing)
9. [PWA y modo offline](#pwa-y-modo-offline)

---

## Stack y dependencias clave
- **Next.js 16.0.1** con App Router, Server Actions y Turbopack
- **React 19.2** + acciones concurrentes
- **TypeScript 5.8** en modo `strict`
- **Tailwind CSS 3.4** para estilos utilitarios
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`) para auth y base de datos
- **React Hook Form + Zod** para formularios con validación
- **Zustand 5** únicamente para estado de UI (modales/banners)
- **sonner** para toasts accesibles
- **OpenRouter API** (modelos gratuitos: `llama-3.1-8b-instruct` / `gemma-2-9b-it`) con fallback
- **Playwright + Vitest** para pruebas

## Estructura de carpetas
```
app/
  layout.tsx               # Metadata global + providers
  page.tsx                 # Landing pública
  login/                   # Formulario magic link
  auth/callback/route.ts   # Intercambio de sesión Supabase
  prompts/                 # Dashboard protegido (listado, CRUD, use modal)
middleware.ts              # Guard de rutas / redirects
public/                    # Manifest, íconos, service worker
src/
  components/common/       # UI genérica (Button, Modal, Providers...)
  features/
    auth/                  # Server actions de login/logout
    prompts/               # Formularios, grid, servicios Supabase
    ai-improvements/       # Cliente OpenRouter + modal diff
    variables/             # extractVariables + modal “Use Prompt”
    limits/                # Banner freemium + helpers
    pwa/                   # Banner de instalación / SW hook
  lib/                     # Supabase helpers, env, limits
  store/                   # Zustand para estado UI
  styles/                  # Tailwind globals
  types/                   # Tipos generados (Supabase)
tests/                     # Playwright + Vitest suites
```

## Variables de entorno
Configura un archivo `.env.local` con:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://tudominio.com (o http://localhost:3000)
OPENROUTER_API_KEY=...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1 (opcional)
```
> **Nota:** OpenRouter solo es necesario para la funcionalidad "Improve with AI". Supabase es obligatorio para auth y CRUD.

## Setup inicial
```bash
npm install
npx playwright install   # instala los navegadores necesarios para tests E2E
```

### Configuración de Supabase (Auth)
1. En el dashboard de Supabase ve a **Project Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public API key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. En **Authentication → URL Configuration** define:
   - `Site URL`: `http://localhost:3000`
   - `Redirect URLs`: `http://localhost:3000/auth/callback`
3. Guarda los cambios y vuelve a solicitar el magic link: al hacer clic en el correo, Supabase redirigirá a `/auth/callback` y la sesión quedará activa en `/prompts`.
4. Crea las tablas y RLS ejecutando el contenido de `supabase/schema.sql` desde el SQL Editor de Supabase (o `supabase db push`). Esto crea `profiles`, `prompts` y `prompt_improvements` con las políticas necesarias.

## Scripts disponibles
| Comando | Descripción |
| --- | --- |
| `npm run dev` | Levanta Next.js 16 con Turbopack en modo desarrollo |
| `npm run build` + `npm run start` | Build optimizado y server en modo producción |
| `npm run lint` | Ejecuta ESLint con la configuración de Next.js |
| `npm run test` | Corre Vitest (unit tests como `extractVariables`) |
| `npm run test:watch` | Vitest en modo watch |
| `npm run test:integration` | Ejecuta Playwright (requiere backend y Supabase configurado) |

## Guía de uso funcional
1. **Autenticación Magic Link**
   - Accede a `/login`, introduce tu email y se enviará un enlace mágico vía Supabase.
   - El callback `/auth/callback` intercambia el código y redirige automáticamente a `/prompts`.
2. **Dashboard protegido (`/prompts`)**
   - Lista tus prompts en una cuadrícula cacheada (`'use cache'`) con filtros de búsqueda, categorías, tags, favoritos y ordenamientos.
   - Paginación de 20 ítems con enlaces accesibles (Prev/Next deshabilitados con `aria-disabled`).
   - Banner superior muestra progreso del plan free (prompts usados y mejoras diarias) y abre un modal informativo “Upgrade to Pro”.
3. **Crear y editar prompts**
   - Formulario (`react-hook-form` + `zod`) con título, contenido (soporta variables `{{variable}}`), categoría predefinida, tags (input chips) e imagen opcional.
   - Al alcanzar el límite gratis (10 prompts) se bloquea el submit con un aviso.
   - En edición aparece botón **“Improve with AI”** si todavía no alcanzas las 5 mejoras diarias.
4. **Mejoras con IA**
   - Abre un modal que envía la versión actual del prompt a OpenRouter, muestra split view original/mejorado, lista de cambios y un diff textual.
   - “Aplicar cambios” reemplaza el contenido, registra la mejora en Supabase y consume 1 uso diario.
5. **Modal “Use Prompt”**
   - El botón “Usar prompt” abre `/prompts/[id]/use` como overlay.
   - Detecta automáticamente las variables (`extractVariables`) y genera inputs por cada una.
   - Preview en tiempo real (con debounce 300 ms) muestra el texto final; el botón “Copy to Clipboard” se habilita solo cuando todas las variables tienen valor y, al copiar, incrementa `use_count` con feedback toast.
6. **Favoritos y filtros**
   - El ícono de estrella hace toggle optimista (`useOptimistic` + server action) y se sincroniza tras revalidation.
   - El filtro de tags ofrece sugerencias rápidas a partir de tus tags existentes.
7. **Freemium limits**
   - Si intentas crear un prompt fuera de límite o aplicar IA sin cuota restante, verás mensajes “Upgrade a Pro”.

## Decisiones técnicas
- **Arquitectura por features**: cada dominio vive en `src/features/<feature>` con componentes, hooks y servicios propios. Lo transversal (UI base, helpers, stores) vive en `src/components/common`, `src/lib`, `src/store`.
- **Separación de responsabilidades**: Server Components/Actions hacen data fetching y mutaciones; Client Components manejan interacción (formularios, modales, Zustand, toasts).
- **Estado y formularios**: solo estado de UI en Zustand (`useUiStore`); formularios usan `react-hook-form` + `zodResolver` para tipado estricto y reuso de esquemas.
- **Fetching**: Supabase se consume directamente en Server Actions (`getSupabaseServerClient`) y servicios (`fetchPrompts`). La lista de prompts usa `'use cache'` para aprovechar caché de Next.js 16.
- **Accesibilidad**: inputs con labels, modales con roles/aria, botones de paginación con `aria-disabled`, toasts para feedback.

## Testing
- **Unit**: `tests/unit/extractVariables.test.ts` cubre detección y reemplazo de variables.
- **Integración (Playwright)**:
  - `tests/integration/auth.spec.ts`: Form login y validaciones básicas.
  - `tests/integration/prompts.spec.ts`: Garantiza que `/prompts` redirige a `/login` sin sesión. Amplía con casos CRUD cuando haya mocks de Supabase.
  - `tests/integration/ai.spec.ts` y `variables.spec.ts` están preparados (skip) para entornos con datos seed y APIs disponibles.

Ejecuta:
```bash
npm run test            # Vitest
npm run test:integration
```
> Playwright requiere que la app esté corriendo y Supabase tenga datos de prueba o mocks.

## PWA y modo offline
- `public/manifest.json` configura íconos, colores y `display: standalone`.
- `public/sw.js` registra un Service Worker que precachea `/`, `/prompts` y `manifest.json`, con estrategia runtime cache para peticiones GET.
- `src/features/pwa/PwaProvider.tsx` registra el SW en el cliente y muestra un banner personalizado cuando el navegador dispara `beforeinstallprompt`. El banner usa Zustand para mostrarse/ocultarse.
- Al instalarla como PWA, la app funciona offline con los prompts cacheados (según los datos visitados previamente).

---
¿Dudas o sugerencias? Abre una issue o comenta en la sesión para seguir iterando 🚀
