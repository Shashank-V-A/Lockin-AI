# Lockin-AI

Ace Every Interview with AI.

A premium SaaS web application for software engineering interview preparation — resume analysis, company-specific mock interviews, coding assessments, analytics, and AI coaching.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js Route Handlers, Server Actions
- **Database:** PostgreSQL (Neon) with Prisma ORM
- **Auth:** Google OAuth via Auth.js
- **Storage:** UploadThing
- **AI:** Groq API (Llama models)
- **Cache:** Upstash Redis
- **Deploy:** Vercel

## Quick reference (local)

```bash
npm install
cp .env.example .env   # fill DATABASE_URL, AUTH_*, GROQ_*, etc.
npm run db:push
npm run db:seed        # 52 coding problems
npm run dev
```

Optional self-hosted code runner:

```bash
docker compose up piston -d
npm run piston:setup   # one-time: installs python, javascript, java, c++
# Set PISTON_API_URL=http://localhost:2000/api/v2 in .env
```

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `AUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `AUTH_URL` | App URL (`http://localhost:3000`) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `GROQ_API_KEY` | Groq API key |
| `GROQ_MODEL` | Groq model (default: `llama-3.3-70b-versatile`) |
| `UPLOADTHING_TOKEN` | UploadThing token |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL (**required in production**) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `CRON_SECRET` | Bearer token for `/api/cron/resume-worker` |
| `PISTON_API_URL` | Piston sandbox URL (default: emkc.org public API) |
| `JUDGE0_API_URL` | Self-hosted Judge0 URL (optional) |
| `CODE_RUNNER` | `auto`, `piston`, `judge0` — production should use sandbox only |
| `DISABLE_LOCAL_CODE_EXEC` | Set `true` to block local execFile fallback |
| `ALLOW_MEMORY_RATE_LIMIT` | Dev-only escape hatch when Redis is unset |

### 3. Set up database

**Local development** — fast iteration with schema sync:

```bash
npm run db:push
npm run db:seed
```

**Production / CI / Docker** — versioned migrations:

```bash
npm run db:migrate:deploy
npm run db:seed   # optional, first deploy only
```

Use `db:push` only in dev. Production and Docker use `prisma migrate deploy` so schema changes are tracked in `prisma/migrations/`.

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

### Production

```bash
docker compose up app db piston
```

### Development

```bash
docker compose --profile dev up app-dev db
```

## Project Structure

```
app/              # Next.js App Router pages
features/         # Feature-specific components
components/       # Shared UI components
hooks/            # Custom React hooks
lib/              # Utilities and clients
services/         # Business logic layer
actions/          # Server Actions
types/            # TypeScript types
prisma/           # Database schema and seed
e2e/              # Playwright smoke tests
proxy.ts          # Edge-safe auth cookie check
```

## Testing

```bash
npm run test       # Vitest unit tests
npm run test:e2e   # Playwright (starts dev server if not running)
```

## Features

- **Authentication** — Google OAuth only
- **Dashboard** — Readiness score, quick actions, recent activity
- **Resume Analyzer** — PDF upload, DB-backed async processing (cron + polling), ATS scoring, PDF report
- **Mock Interviews** — Company-specific questions, pause/resume timer, PDF report export
- **Coding Assessment** — Monaco editor, auto-submit timer, hints/solutions, sandbox execution, PDF export
- **Analytics** — Progress charts with cache invalidation on mutations
- **AI Coach** — Streaming chat (12-msg context cap), load-more history, structured markdown
- **Edge auth** — Cookie-based page + API protection via `proxy.ts` (no Prisma on edge)
- **Observability** — Structured JSON logs, request IDs, AI usage events

## Production checklist

1. Set `UPSTASH_REDIS_REST_*` (rate limits + dashboard cache)
2. Set `CODE_RUNNER=piston` and `DISABLE_LOCAL_CODE_EXEC=true`
3. Set `CRON_SECRET` and enable Vercel cron (`vercel.json`) for resume worker
4. Use `npm run db:migrate:deploy` — not `db:push`

## Deploy to Vercel

Repository: [github.com/Shashank-V-A/Lockin-AI](https://github.com/Shashank-V-A/Lockin-AI)

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → Import **Shashank-V-A/Lockin-AI**
2. Framework preset: **Next.js** (auto-detected)
3. Build settings are in `vercel.json` (`prisma migrate deploy` runs on each deploy)

### 3. Environment variables (Production)

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Neon **pooled** URL (`-pooler` host), `sslmode=verify-full` |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | `https://your-app.vercel.app` (no trailing slash) |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth client secret |
| `GROQ_API_KEY` | Yes | Groq API key |
| `GROQ_MODEL` | Yes | `llama-3.3-70b-versatile` |
| `UPLOADTHING_TOKEN` | Yes | UploadThing token |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis (rate limits + cache) |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis token |
| `CRON_SECRET` | Yes | Random secret; Vercel Cron sends `Authorization: Bearer <value>` |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `AUTH_URL` |
| `NEXT_PUBLIC_APP_NAME` | Yes | `Lockin-AI` |
| `CODE_RUNNER` | Yes | `piston` |
| `DISABLE_LOCAL_CODE_EXEC` | Yes | `true` |
| `PISTON_API_URL` | Yes* | Public URL of a **hosted** Piston instance (`https://host/api/v2`) — not `localhost` |

\* Java/C++/Python/JS coding requires a remote Piston server (Docker on your machine is dev-only).

### 4. Google OAuth (production)

In [Google Cloud Console](https://console.cloud.google.com/) → OAuth client:

- **Authorised JavaScript origins:** `https://your-app.vercel.app`
- **Redirect URI:** `https://your-app.vercel.app/api/auth/callback/google`

### 5. First deploy extras

After the first successful deploy, seed coding problems (one-time, from your machine):

```bash
# Point at production DATABASE_URL
npm run db:seed
```

### 6. Cron

`vercel.json` runs `/api/cron/resume-worker` every 2 minutes. Requires **Vercel Pro** for sub-daily cron on some plans; Hobby supports cron with limits. `CRON_SECRET` must be set.

### 7. CLI deploy (optional)

```bash
npm i -g vercel
vercel login
vercel link    # link to Shashank-V-A/Lockin-AI
vercel --prod
```

## License

Private — portfolio project.
