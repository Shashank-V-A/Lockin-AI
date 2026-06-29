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
# Set PISTON_API_URL=http://localhost:2000/api/v2/piston in .env
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

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Connect Neon PostgreSQL via Vercel Marketplace
5. Deploy

## License

Private — portfolio project.
