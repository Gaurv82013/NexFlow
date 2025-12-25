# NexFlow

Modern full‑stack app with AI for real‑time collaboration, messaging, and productivity.

**Tagline:** Fast, secure, and scalable realtime collaboration for teams.

---

<img width="959" height="437" alt="Screenshot 2025-12-25 131910" src="https://github.com/user-attachments/assets/417be4e8-fa83-4aa6-923e-45a4fc79eb94" />

---


## AI-Powered Features

- AI-based message summarization for long conversations
- AI compose to rewrite or improve messages
- Helps users save time and communicate better

---

## Tech Stack

- **Language:** TypeScript
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **UI:** Radix / shadcn-ui primitives (custom components in `components/ui`)
- **ORM / Database:** Prisma (Postgres / compatible SQL)
- **Auth:** Kinde / OAuth (server-side auth routes) and session-based guards
- **Realtime / Messaging:** Cloudflare Workers (or Worker Routes) + realtime providers (presence + websockets or server-sent events)
- **File Uploads:** UploadThing (or similar signed-upload flow)
- **Cloud / Deployment:** Cloudflare Workers (Wrangler), Vercel for frontend, GitHub Actions for CI/CD
- **Tooling:** pnpm, ESLint, Prettier, TypeScript

---

## Key Features

- User authentication & role-based authorization
- Real-time messaging, presence and typing indicators
- Threaded conversations and workspaces/rooms
- Secure file uploads with signed requests
- Responsive, accessible UI components
- Strongly-typed API surface with Prisma + TypeScript
- Scalable architecture separating request surface (Next.js) and workers for realtime concerns

---

## Architecture Overview

NexFlow separates concerns across layers:

- The **Next.js frontend** (in `app/`) handles UI, SSR/SSG, and server actions for secure endpoints.
- **API routes** and lightweight server functions provide authenticated endpoints for CRUD operations and business logic.
- **Prisma** talks to the primary database (Postgres) for persistent data: users, messages, workspaces.
- **Cloudflare Workers** (and optional Durable Objects) handle realtime transport, presence, and scaling-sensitive message routing. Workers can offload ephemeral state and websockets from the main app.
- File uploads are performed via a signed upload flow (UploadThing or Cloudflare R2), keeping secrets server-side.

Typical request flow:

1. Client connects to Next.js for pages and APIs.
2. For realtime, client connects to a Cloudflare Worker endpoint which multiplexes presence and messages.
3. Workers persist important events to the backend API or directly to durable storage if configured.

Durable Objects (optional): used to maintain room-level state (presence lists, rate-limiting) without a central server.

---

## Folder & File Structure

- `app/` – Next.js App Router pages, layouts and route handlers. Primary entrypoint for the frontend.
- `components/` – Reusable UI components (split into `ui/` primitives and higher-level components).
- `lib/` – Shared utilities, client wrappers, API helpers, and provider bootstrapping (e.g. `lib/db.ts`, `lib/orpc.ts`).
- `prisma/` – Prisma schema and migration history (`schema.prisma`, `migrations/`).
- `realtime/` or `workers/` – Cloudflare Worker code for realtime messaging and presence.
- `public/` – Static assets served by Next.js.
- `scripts/` – Helpful scripts (migrations, seeds, automation).
- `wrangler.json` / `wrangler.toml` – Cloudflare Workers configuration (account, routes, bindings).
- `next.config.ts`, `tsconfig.json`, `package.json` – project configuration and build settings.

Files to look at first:

- `app/layout.tsx` – top-level layout and providers
- `lib/db.ts` – Prisma client setup
- `prisma/schema.prisma` – database schema
- `realtime/index.ts` – worker entry (if present)

---

## Environment Variables

Create a `.env` (local) with the following keys. Do not commit secrets.

- `DATABASE_URL` – Postgres connection string for Prisma (production DB).
- `SHADOW_DATABASE_URL` – (optional) Shadow DB for migrations.
- `NEXT_PUBLIC_BASE_URL` – Public URL for the frontend (used in links).
- `CLOUDFLARE_ACCOUNT_ID` – Cloudflare account id for Wrangler deployments.
- `CLOUDFLARE_API_TOKEN` – API token with Worker permissions (used in CI).
- `UPLOADTHING_SECRET` – Secret used to sign upload requests (or provider equivalent).
- `KINDE_CLIENT_ID` / `KINDE_CLIENT_SECRET` – OAuth client credentials (if using Kinde).
- `JWT_SECRET` – Fallback secret for signed sessions (if applicable).

**Note:** Prefix `NEXT_PUBLIC_` variables are exposed to the browser; keep others server-only.

---

## Installation & Setup

Prerequisites:

- Node.js (v18+ recommended)
- pnpm
- A Postgres database (local or managed)
- Cloudflare account (for Workers) if using realtime features

Steps:

```bash
# clone
git clone <repo-url>
cd nexflow

# install
pnpm install

# copy env example and edit
cp .env.example .env
# edit .env and set DATABASE_URL, CLOUDFLARE_API_TOKEN, etc.

# run prisma migrations
pnpm prisma migrate dev

# (optional) seed the database
pnpm prisma db seed
```

---

## Running the Project

Local development (frontend + api):

```bash
pnpm dev
```

Start Cloudflare Workers locally (if used):

```bash
pnpm dlx wrangler dev
```

Build for production:

```bash
pnpm build
pnpm start
```

Run Prisma studio:

```bash
pnpm prisma studio
```

---

## Deployment

- **Frontend (Next.js):** Deploy to Vercel or a platform that supports Next.js App Router. Configure environment variables in the hosting environment.
- **Realtime / Workers:** Deploy Cloudflare Workers via `wrangler` using `wrangler publish` or CI with the `wrangler` GitHub Action. Use `wrangler.toml`/`wrangler.json` to configure bindings.
- **Database:** Hosted Postgres (Supabase, Neon, RDS, etc.). Use connection strings stored in environment variables.

CI/CD: Use GitHub Actions to run linting, type checks, tests, and to publish Workers and frontend on merges to `main`.

---

## Future Improvements

- Add E2E tests (Cypress / Playwright) for critical flows
- Introduce WebRTC for low-latency media collaboration
- Add metrics and observability (Prometheus, Cloudflare Analytics)
- Automate horizontal scaling for Workers and DB read replicas
- Multi-tenant workspace features and billing integration

---

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repo and create a feature branch.
2. Run tests and linters locally: `pnpm test`, `pnpm lint`.
3. Open a PR with a clear title and description focusing on one change.
4. Keep commits small and descriptive; rebase rather than merge when appropriate.

---
