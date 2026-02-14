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
- `npm install`
- `npm run prisma:migrate`

## Deployment (Vercel)
1. Create a PostgreSQL database (Neon/Supabase).
2. Set `DATABASE_URL` in Vercel project settings.
3. Deploy the app.
- `npm run dev`
