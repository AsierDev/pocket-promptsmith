# Pocket Promptsmith

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-API-FF6B35?style=flat-square&logo=openai)](https://openrouter.ai/)

> **A modern Progressive Web App for managing, organizing, and AI-improving reusable prompts with dynamic variables using OpenRouter API.**

Pocket Promptsmith is a feature-rich PWA built with **Next.js 16 (App Router + React 19)** that allows users to save, organize, and enhance reusable prompts with dynamic variables and AI assistance powered by OpenRouter.

## 🚀 Features

- **🔐 Magic Link Authentication** - Secure login with Supabase Auth
- **📝 Prompt Management** - Create, edit, and organize prompts with categories, tags, and a short “Objetivo” summary
- **🤖 AI-Powered Improvements** - Enhance prompts using OpenRouter API with a premium (5/día) + free fallback model chain and a dedicated “texto a mejorar” field (4k chars) que evita enviar todo el prompt cuando es muy largo
- **🔢 Dynamic Variables** - Extract and replace variables like `{{variable}}` in prompts
- **📱 Progressive Web App** - Installable app with offline capabilities
- **♿ Freemium Model** - 10 prompts limit, 5 AI improvements per day
- **⚡ Server-Side Rendering** - Optimized with Next.js 16 and Webpack/Turbopack
- **🎨 Modern UI** - Clean interface with Tailwind CSS and accessibility features

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security & Performance](#-security--performance)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🛠️ Tech Stack

| Category             | Technology      | Version |
| -------------------- | --------------- | ------- |
| **Frontend**         | Next.js         | 16.0.1  |
|                      | React           | 19.2    |
|                      | TypeScript      | 5.8     |
|                      | Tailwind CSS    | 3.4     |
| **Backend**          | Supabase        | Latest  |
|                      | PostgreSQL      | Latest  |
| **State Management** | Zustand         | 5.x     |
| **Forms**            | React Hook Form | Latest  |
|                      | Zod             | Latest  |
| **AI Integration**   | OpenRouter API  | Latest  |
| **Testing**          | Playwright      | Latest  |
|                      | Vitest          | Latest  |
| **PWA**              | Service Worker  | Native  |

## 📁 Project Structure

```
Pocket-Promptsmith/
├── app/                          # Next.js 16 App Router
│   ├── layout.tsx               # Global metadata + providers
│   ├── page.tsx                 # Public landing page
│   ├── login/                   # Magic link authentication
│   ├── auth/callback/           # Supabase session exchange
│   ├── prompts/                 # Protected dashboard
│   │   ├── layout.tsx           # Protected layout with daily reset
│   │   ├── page.tsx             # Prompts listing
│   │   ├── new/                 # Create new prompt
│   │   ├── [id]/                # Prompt details
│   │   │   ├── page.tsx         # Edit prompt
│   │   │   └── use/             # Use prompt modal
│   └── api/                     # API routes
│       └── ai-improve/          # OpenRouter AI integration
├── public/                      # Static assets
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── icons/                  # App icons
├── src/
│   ├── components/             # Reusable UI components
│   │   └── common/             # Generic UI components
│   ├── features/               # Feature-based architecture
│   │   ├── auth/               # Authentication logic
│   │   ├── prompts/            # Prompt CRUD operations
│   │   ├── ai-improvements/    # AI integration
│   │   ├── variables/          # Variable extraction/replacement
│   │   ├── limits/             # Freemium limits
│   │   └── pwa/                # PWA functionality
│   ├── lib/                    # Core utilities
│   │   ├── supabaseServer.ts   # Server-side Supabase client
│   │   ├── limits.ts           # Business logic limits
│   │   └── env.ts              # Environment validation
│   ├── store/                  # Zustand state management
│   ├── types/                  # TypeScript definitions
│   └── styles/                 # Global styles
├── supabase/                   # Database schema & migrations
│   └── schema.sql              # Complete database schema
├── tests/                      # Test suites
│   ├── unit/                   # Vitest unit tests
│   └── integration/            # Playwright E2E tests
├── proxy.ts                    # Next.js middleware replacement
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── vitest.config.ts            # Vitest configuration
└── playwright.config.ts        # Playwright configuration
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Supabase CLI** (optional but recommended)

### Supabase Account Setup

1. Create a [Supabase account](https://supabase.com/)
2. Create a new project
3. Note your project reference ID

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pocket-promptsmith.git
cd pocket-promptsmith
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (see [Environment Configuration](#-environment-configuration)).

### 4. Supabase Setup

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply database schema
supabase db push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenRouter AI Configuration (Required for AI features; env validator exige valor)
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Application Configuration
NODE_ENV=development
```

> **Security Notes**  
> - `src/lib/env.ts` valida en frío con Zod y es solo server-side; si faltan claves, la app falla en arranque.  
> - No importes `env` en componentes `use client`; los clientes web deben depender solo de `NEXT_PUBLIC_*`.  
> - Para CI/tests puedes usar valores dummy (`NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=anon`, `OPENROUTER_API_KEY=dummy`).  
> - El service role key se usa solo desde CLI para migraciones; nunca lo compartas ni lo despliegues al frontend.

## 🗄️ Database Setup

### Automatic Setup (Recommended)

```bash
supabase db push
```

This command will create all necessary tables, RLS policies, and PostgreSQL functions:

- `profiles` - User profiles and limits tracking
- `prompts` - Prompt storage with metadata; incluye `ai_improvement_source` (nullable) para guardar solo el fragmento usado en mejoras de IA
- `prompt_improvements` - AI improvement history
- **PostgreSQL Functions:**
  - `get_user_tags()` - Fetch user tags efficiently
  - `increment_prompt_use_count()` - Atomic counter updates
  - `reset_daily_improvements()` - Daily quota reset (marked as `volatile`)

### Manual Setup

If you prefer manual setup, execute the SQL commands from `supabase/schema.sql` in your Supabase SQL Editor.

> **Important**: Ensure all SQL functions are applied correctly. If you encounter errors like "UPDATE is not allowed in a non-volatile function", verify that functions modifying data are marked as `volatile` (not `stable`) in PostgreSQL.

## 🏃‍♂️ Development

### Available Scripts

| Command                    | Description                             |
| -------------------------- | --------------------------------------- |
| `npm run dev`              | Start development server with Turbopack |
| `npm run build`            | Create production build                 |
| `npm run start`            | Start production server                 |
| `npm run lint`             | Run ESLint with Next.js configuration   |
| `npm run test`             | Run Vitest unit tests                   |
| `npm run test:watch`       | Run Vitest in watch mode                |
| `npm run test:integration` | Run Playwright E2E tests                |
| `npm run type-check`       | Run TypeScript type checking            |
| `npm run build -- --webpack`| Production build usando Webpack (útil en entornos donde Turbopack está restringido) |

### Development Workflow

1. **Code Quality**: `npm run lint` ensures clean code with flat config
2. **Testing**: `npm run test` runs unit tests, ignores Playwright specs
3. **Type Safety**: TypeScript strict mode ensures type safety
4. **Hot Reloading**: Turbopack provides fast development experience

## 📚 API Documentation

### OpenRouter AI Integration

**Endpoint**: `POST /api/ai-improve`

**Authentication**: Requires valid Supabase session

**Request**:

```typescript
{
  content: string;
  goal?: string;
  category: "Escritura" | "Código" | "Marketing" | "Análisis" | "Creatividad" | "Educación" | "Otros";
  temperature?: number; // 0..1
  length?: "short" | "medium" | "long";
}
```

**Response**:

```typescript
{
  improved_prompt: string;
  changes: string[];
  diff: string;
  modelUsed?: string;
  premiumImprovementsUsedToday: number;
}
```

The backend automatically selects the appropriate model using the `getModelsForImprovement` helper. The first five daily improvement attempts use premium models (`google/gemini-2.5-flash-lite`, `google/gemini-2.0-flash-lite-001`); once those are exhausted the flow falls back to free models (`google/gemini-2.0-flash-exp:free`, `meta-llama/llama-4-maverick:free`).

**Error Responses**:

- `401 Unauthorized` - Invalid or missing session
- `429 Too Many Requests` - Daily premium improvement limit exceeded
- `400 Bad Request` - Invalid input data

### Supabase Database Schema

#### Tables

**`profiles`**

- `id` (uuid, primary key)
- `email` (text)
- `plan` ('free' | 'pro')
- `prompt_quota_used` (integer)
- `improvements_used_today` (integer)
- `improvements_reset_at` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**`prompts`**

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `title` (text)
- `summary` (text)
- `content` (text)
- `category` (enum)
- `tags` (text[])
- `is_favorite` (boolean)
- `use_count` (integer)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**`prompt_improvements`**

- `id` (uuid, primary key)
- `prompt_id` (uuid, foreign key)
- `user_id` (uuid, foreign key)
- `original_content` (text)
- `improved_content` (text)
- `diff_json` (jsonb)
- `created_at` (timestamptz)

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run specific test file
npm run test extractVariables

# Watch mode for development
npm run test:watch
```

**Test Coverage**:

- Variable extraction logic (`extractVariables`)
- Business logic limits (`tests/limits.test.ts`)
- Component behavior
- Utility functions

### Integration Tests (Playwright)

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests (requires running app)
npm run dev  # In one terminal
npm run test:integration  # In another terminal
```

**Test Suites**:

- `auth.spec.ts` - Authentication flow testing
- `prompts.spec.ts` - CRUD operations testing
- `ai.spec.ts` - AI integration testing (requires API keys)
- `variables.spec.ts` - Variable handling testing

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**:

   ```bash
   npx vercel --prod
   ```

2. **Environment Variables**:
   Add all environment variables in Vercel dashboard

3. **Database**:
   Ensure `supabase db push` is run on production

### Other Platforms

**Netlify**:

- Build command: `npm run build`
- Publish directory: `.next`
- Environment variables required

**Railway**:

- Connect GitHub repository
- Auto-deploys on push
- Environment variables in dashboard

### Production Checklist

- [ ] Environment variables configured
- [ ] Database schema applied with `supabase db push`
- [ ] SSL certificate configured
- [ ] Error monitoring (Sentry) setup
- [ ] Performance monitoring configured
- [ ] Database backups enabled

## 🔒 Security & Performance

### Security Measures

- **Row Level Security (RLS)**: All Supabase tables protected
- **Session Validation**: API routes validate Supabase sessions
- **CSP Headers**: Content Security Policy implementation
- **Input Validation**: Zod schema validation on all inputs
- **Rate Limiting**: API endpoints protected from abuse

### Performance Optimizations

- **Server Components**: Leveraging Next.js 16 Server Components
- **Caching**: `use cache` directive for optimal data fetching
- **Bundle Optimization**: Turbopack for fast builds
- **Image Optimization**: Next.js Image component
- **Service Worker**: PWA caching strategies

### Data Privacy

- **Local Storage**: Minimal data stored locally
- **Session Management**: Secure cookie-based sessions
- **API Key Protection**: OpenRouter keys never exposed to client
- **GDPR Compliance**: User data deletion capabilities

## 🔧 Troubleshooting

### Common Issues

#### 1. "UPDATE is not allowed in a non-volatile function"

**Problem**: PostgreSQL function volatility issue
**Solution**:

```sql
-- Ensure functions modifying data are marked as volatile
CREATE OR REPLACE FUNCTION reset_daily_improvements(target_user_id uuid)
RETURNS public.profiles
LANGUAGE sql
VOLATILE  -- Not STABLE
AS $$
  -- function body
$$;
```

#### 2. Build Fails with Turbopack

**Problem**: Development environment restrictions
**Solution**: Run build outside restricted sandbox environment

#### 3. Authentication Not Working

**Problem**: Incorrect Supabase URL configuration
**Solution**:

- Verify `NEXT_PUBLIC_SUPABASE_URL` format: `https://project-id.supabase.co`
- Check redirect URLs in Supabase dashboard
- Ensure `NEXT_PUBLIC_SITE_URL` matches your domain

#### 4. AI Improvements Not Working

**Problem**: OpenRouter API issues
**Solution**:

- Verify `OPENROUTER_API_KEY` is valid
- Check API quotas and limits
- Ensure network connectivity to OpenRouter

#### 5. PWA Not Installing

**Problem**: Service Worker registration issues
**Solution**:

- Check browser console for SW errors
- Verify `manifest.json` is accessible
- Ensure HTTPS in production

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development npm run dev
```

### Logs

- **Server logs**: Terminal output during development
- **Browser logs**: Developer console for client-side debugging
- **Supabase logs**: Dashboard > Logs section

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm run test && npm run lint`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Flat config with Next.js recommended rules
- **Prettier**: Code formatting (run `npm run format`)
- **Conventional Commits**: Use semantic commit messages

### Pull Request Guidelines

- **Title**: Clear and descriptive
- **Description**: Explain what, why, and how
- **Tests**: Include tests for new functionality
- **Documentation**: Update README if needed
- **Breaking Changes**: Clearly document and justify

### Issue Reporting

When reporting issues, include:

- **Environment**: OS, Node version, browser
- **Reproduction steps**: Clear steps to reproduce
- **Expected vs actual behavior**
- **Screenshots**: If relevant
- **Error logs**: Console output and stack traces

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ **Commercial use** - You can use this project commercially
- ✅ **Modification** - You can modify the project
- ✅ **Distribution** - You can distribute the project
- ✅ **Private use** - You can use the project privately
- ❌ **Liability** - Liability is not granted
- ❌ **Warranty** - Warranty is not granted

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Supabase Team** - For the fantastic Backend-as-a-Service
- **OpenRouter** - For providing accessible AI models
- **Tailwind CSS** - For the utility-first CSS framework
- **Open Source Community** - For all the amazing tools and libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/pocket-promptsmith/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/pocket-promptsmith/discussions)
- **Email**: support@example.com

---

<div align="center">

**Built with ❤️ using Next.js, Supabase, and OpenRouter**

[Star on GitHub](https://github.com/your-username/pocket-promptsmith) · [Follow on Twitter](https://twitter.com/your-username)

</div>
