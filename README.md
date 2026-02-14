# Real-Time Poll Rooms

## Features
- Create polls with a question and multiple options.
- Shareable poll links.
- Live results via short polling (auto-refresh every 2s).
- Two fairness mechanisms: one vote per device ID, and IP cooldown.
- Persistent storage using PostgreSQL via Prisma.

## Fairness / Anti-Abuse
1. One vote per device ID (stored in localStorage and enforced server-side).
2. IP cooldown (blocks repeat votes from the same IP within 1 hour).

## Edge Cases Handled
- Empty question or options are rejected.
- Fewer than two valid options are rejected.
- Votes for non-existent polls/options are rejected.
- Duplicate device votes are rejected.

## Known Limitations
- IP-based cooldown can affect users behind shared networks.
- Short polling is not instant like WebSockets.
- PostgreSQL is required for production deployments like Vercel.

## Getting Started
1. Copy `.env.example` to `.env` and adjust with your PostgreSQL URL.
2. Install dependencies.
3. Run Prisma migrations.
4. Start the dev server.

## Commands
- `npm install` — Install dependencies
- `npm run prisma:migrate` — Run migrations (local dev)
- `npm run dev` — Start dev server

## Deployment (Vercel)

### Prerequisites
1. **Create a PostgreSQL database** (recommended: Neon free tier)
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project and database
   - Copy the **pooled connection string**

### Deploy Steps
1. **Push code to GitHub** (already done)
2. **Import project in Vercel**
   - Go to [vercel.com](https://vercel.com) and import your GitHub repo
3. **Set environment variable**
   - Add `DATABASE_URL` with your Neon pooled connection string
4. **Deploy**
   - Vercel will auto-build and deploy
5. **Run migrations** (first deploy only)
   - In Vercel project → Settings → Environment Variables, ensure `DATABASE_URL` is set
   - Locally run: `npm run prisma:deploy` with production `DATABASE_URL` in `.env`
   - Or use Vercel CLI: `vercel env pull .env.production.local && npm run prisma:deploy`

### Post-Deploy
- Test poll creation and voting on your live URL
- Share the link to verify real-time updates work across devices
