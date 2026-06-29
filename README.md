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
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL (optional) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token (optional) |
| `PISTON_API_URL` | Self-hosted Piston URL (default: localhost:2000) |
| `JUDGE0_API_URL` | Self-hosted Judge0 URL (optional) |
| `CODE_RUNNER` | `auto`, `piston`, `judge0`, or `local` |

### 3. Set up database

```bash
npm run db:push
npm run db:seed
```

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
- **Resume Analyzer** — PDF upload, async AI analysis with polling, ATS scoring, PDF report
- **Mock Interviews** — Company-specific questions, pause/resume timer, PDF report export
- **Coding Assessment** — Monaco editor, auto-submit timer, hints/solutions, sandbox execution
- **Analytics** — Progress charts and performance insights (merged into dashboard)
- **AI Coach** — Streaming chat with edit/regenerate, structured markdown responses
- **Edge auth** — Cookie-based route protection via `proxy.ts` (no Prisma on edge)

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Connect Neon PostgreSQL via Vercel Marketplace
5. Deploy

## License

Private — portfolio project.
