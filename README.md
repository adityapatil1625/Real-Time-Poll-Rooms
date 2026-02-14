# Real-Time Poll Rooms

**Live demo:** https://real-time-poll-rooms-delta.vercel.app/

A live polling app where you can create polls, share links, and watch results update in real-time. Built with Next.js and PostgreSQL.

## What it does

Create a poll with a question and options, get a shareable link, and anyone can vote. Results update automatically every 2 seconds without page refresh.

## Tech stack

- Next.js 14 + TypeScript
- PostgreSQL database (via Prisma)
- Hosted on Vercel

## Anti-abuse mechanisms

I implemented two layers to prevent spam voting:

**1. Device fingerprinting**  
Each browser gets a unique ID stored in localStorage. The database has a unique constraint on `(pollId, deviceId)`, so you can't vote twice from the same browser. Yeah, clearing localStorage bypasses this, but it stops casual duplicate voting.

**2. IP rate limiting**  
The server limits votes per IP to prevent spam. Each IP can cast up to 10 votes per poll, with a 30-second cooldown between votes. This allows multiple devices on the same WiFi to vote, but prevents someone from rapidly spamming votes.

Downsides: someone with many devices or VPNs could still vote multiple times. But combined with device fingerprinting, it makes casual abuse pretty difficult.

## Edge cases I handled

- Empty questions/options get rejected
- Need at least 2 options to create a poll
- Voting for non-existent polls returns 404
- Concurrent votes are handled by Prisma's unique constraints
- Invalid payloads return proper 400 errors

## What could be better

- Used short polling instead of WebSockets (simpler to deploy, but less efficient)
- IP blocking affects legitimate users on shared networks
- No way to close a poll or set expiration
- Device ID is client-side only, could be server sessions instead

## Running locally

```bash
# Setup
cp .env.example .env
# Add your PostgreSQL connection string to .env

npm install
npm run prisma:migrate
npm run dev
```

Open http://localhost:3000, create a poll, and test voting in different browser tabs.

## Deploying to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add `DATABASE_URL` environment variable (use Neon's pooled connection string)
4. Deploy
5. After first deploy, run `npm run prisma:deploy` locally to set up the database schema

Database: I'm using Neon's free PostgreSQL tier. Works great for this project size.
