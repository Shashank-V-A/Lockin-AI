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
docker compose up app db
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
```

## Features

- **Authentication** — Google OAuth only
- **Dashboard** — Readiness score, quick actions, recent activity
- **Resume Analyzer** — PDF upload, ATS scoring, AI feedback, PDF report download
- **Mock Interviews** — Company-specific questions with AI evaluation
- **Coding Assessment** — Monaco editor, timer, simulated execution, AI feedback
- **Analytics** — Progress charts and performance insights
- **AI Coach** — Conversational career and interview guidance

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Connect Neon PostgreSQL via Vercel Marketplace
5. Deploy

## License

Private — portfolio project.
