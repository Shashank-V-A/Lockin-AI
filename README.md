# Lockin-AI

**Ace Every Interview with AI.**

I built Lockin-AI as a full-stack interview prep platform — one place to upload a resume, run company-specific mock interviews, practice coding problems, track progress, and get coaching from an AI assistant. Everything is tied together with a readiness score so you always know what to work on next.

**Live:** [lockin-ai-va.vercel.app](https://lockin-ai-va.vercel.app)  
**Repo:** [github.com/Shashank-V-A/Lockin-AI](https://github.com/Shashank-V-A/Lockin-AI)

---

## What it does

| Module | What you get |
|--------|----------------|
| **Resume Analyzer** | PDF upload → ATS score, strengths/weaknesses, skill gaps, downloadable report |
| **Mock Interviews** | Company + role + difficulty → timed Q&A, follow-ups, pause/resume, PDF report |
| **Coding** | 52+ problems, Monaco editor, Python/JS/Java/C++, run/submit, hints & solutions |
| **Analytics** | Readiness score, progress charts, weak/strong areas |
| **AI Coach** | Streaming chat with context from your resume and interview history |

---

## Tech stack

| Layer | Choices |
|-------|---------|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, shadcn/ui, Plus Jakarta Sans |
| **Database** | PostgreSQL on Neon, Prisma ORM |
| **Auth** | Auth.js v5 — Google OAuth only, JWT sessions |
| **AI** | Groq API (Llama 3.3 70B) — structured JSON + streaming chat |
| **Storage** | UploadThing (resume PDFs) |
| **Cache / limits** | Upstash Redis (dashboard cache, rate limiting) |
| **Code execution** | Judge0 CE in production; Piston via Docker locally |
| **PDF** | unpdf (text extraction), pdf-lib (report generation) |
| **Editor** | Monaco via `@monaco-editor/react` |
| **Deploy** | Vercel (serverless + daily cron for resume worker) |

---

## Architecture

```
Browser
   │
   ▼
proxy.ts ───────────── Edge auth (cookie check, no DB)
   │
   ▼
App Router
   ├── Server Components (dashboard, resume, coding pages)
   ├── Server Actions (mutations, batched page data)
   └── Route Handlers (auth, coach stream, resume extract, cron)
           │
           ├── services/     Business logic
           ├── lib/          Auth, Prisma, Redis, Groq, code sandbox
           └── prisma/       PostgreSQL (Neon)
```

**Patterns I used:**

- **Batched server fetches** — one auth check per page (`fetchCodingPageData`, `fetchResumePageData`, etc.) instead of many round-trips.
- **Async resume pipeline** — upload → extract text → queue `PENDING` → worker/cron runs Groq analysis → client polls `/api/resume/status`.
- **Streaming coach** — `/api/coach/stream` with Groq SSE; history capped for cost control.
- **Sandboxed code run** — server-side only; Judge0 CE in prod with Piston fallback locally (`CODE_RUNNER=auto`).
- **Edge-safe auth** — `proxy.ts` checks session cookie; Prisma stays on Node runtime.

---

## Project structure

```
app/              Routes, layouts, API handlers
features/         Page-level client components (resume, coding, coach, …)
components/       Shared UI and layout
actions/          Server Actions (thin wrappers over services)
services/         Domain logic (resume, interview, coding, analytics, AI)
lib/              Clients, utilities, code runner, validations
prisma/           Schema, migrations, seed (52 coding problems)
proxy.ts          Edge middleware for protected routes
e2e/              Playwright smoke tests
```

---

## Local setup

### 1. Install and configure

```bash
git clone https://github.com/Shashank-V-A/Lockin-AI.git
cd Lockin-AI
npm install
cp .env.example .env
```

Fill in `.env` — at minimum: `DATABASE_URL`, `AUTH_*`, `GROQ_*`, `UPLOADTHING_TOKEN`, `UPSTASH_REDIS_*`.

### 2. Database

```bash
npm run db:push      # dev schema sync
npm run db:seed      # 52 coding problems
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Google OAuth (local)

In [Google Cloud Console](https://console.cloud.google.com/):

- **JavaScript origin:** `http://localhost:3000`
- **Redirect URI:** `http://localhost:3000/api/auth/callback/google`

### 4. Code execution (optional, for Java/C++ locally)

```bash
docker compose up piston -d
npm run piston:setup
```

Set `PISTON_API_URL=http://localhost:2000/api/v2` in `.env`.

---

## Production (Vercel)

Build settings live in `vercel.json` — each deploy runs `prisma migrate deploy`.

### Environment variables

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Neon pooled URL, `sslmode=verify-full` |
| `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | e.g. `https://lockin-ai-va.vercel.app` |
| `AUTH_SECRET`, `AUTH_GOOGLE_*` | OAuth |
| `GROQ_API_KEY`, `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `UPLOADTHING_TOKEN` | File uploads |
| `UPSTASH_REDIS_REST_*` | Required — cache + rate limits |
| `CRON_SECRET` | Bearer token for resume worker |
| `JUDGE0_API_URL` | `https://ce.judge0.com` |
| `CODE_RUNNER` | `auto` |
| `DISABLE_LOCAL_CODE_EXEC` | `true` |

Google OAuth redirect for production:

```
https://your-app.vercel.app/api/auth/callback/google
```

After first deploy, seed coding problems once:

```bash
DATABASE_URL="your-neon-url" npm run db:seed
```

---

## Scripts

```bash
npm run dev          # local dev (webpack)
npm run build        # production build
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright smoke tests
npm run db:migrate   # create migration (dev)
npm run db:migrate:deploy  # apply migrations (prod/CI)
npm run piston:setup # install Piston runtimes (local Docker)
```

---

## Docker

```bash
# Production-style stack
docker compose up app db piston

# Dev with hot reload
docker compose --profile dev up app-dev db
```

---

## License

Private portfolio project — built by [Shashank V A](https://github.com/Shashank-V-A).
