# Submission Notes

## Public URL
[Add your deployed Vercel URL here after deployment]

## GitHub Repository
https://github.com/adityapatil1625/Real-Time-Poll-Rooms

## Fairness / Anti-Abuse Mechanisms

### 1. One Vote Per Device ID
**How it works:**
- When a user first visits the poll page, a unique device ID (UUID) is generated using `crypto.randomUUID()` and stored in browser localStorage
- This device ID is sent with every vote request
- The server enforces a unique constraint: `@@unique([pollId, deviceId])` in the Vote model
- If a user tries to vote again from the same device, the server rejects it with a 409 Conflict error

**What it prevents:**
- Multiple votes from the same browser/device
- Simple refresh-and-revote attacks

**Known limitations:**
- Users can vote again if they clear localStorage or use a different browser/device
- Not effective against determined attackers using multiple browsers or incognito mode

### 2. IP-Based Cooldown (1 Hour)
**How it works:**
- The server extracts the client's IP address from request headers (`x-forwarded-for` or `x-real-ip`)
- Before accepting a vote, it checks if the same IP has voted on this poll within the last hour
- If a recent vote exists (within `COOLDOWN_MS = 60 * 60 * 1000`), the server returns a 429 Too Many Requests error
- Implementation uses Prisma query: `createdAt: { gte: new Date(Date.now() - COOLDOWN_MS) }`

**What it prevents:**
- Rapid vote spamming from the same network
- Users trying to vote multiple times by clearing localStorage repeatedly
- Coordinated attacks from a single location

**Known limitations:**
- Multiple users behind the same IP (corporate networks, shared WiFi) may be blocked after one person votes
- VPN/proxy users can bypass by changing IP
- Not effective against distributed botnets

## Edge Cases Handled

1. **Empty or invalid poll creation**
   - Validates that question is non-empty after trimming
   - Requires at least 2 valid options (after filtering out empty strings)
   - Returns 400 Bad Request with descriptive error

2. **Non-existent poll or option**
   - Validates poll ID exists before accepting votes
   - Validates option ID belongs to the specified poll
   - Returns 404 Not Found for invalid IDs

3. **Duplicate device votes**
   - Database unique constraint prevents duplicate votes
   - Returns 409 Conflict with clear error message

4. **Concurrent vote requests**
   - PostgreSQL handles race conditions via unique constraints and transactions
   - Prisma provides safe concurrent access

5. **Invalid vote payload**
   - Validates presence of `optionId` and `deviceId` fields
   - Returns 400 Bad Request for malformed requests

6. **Database connection issues**
   - Prisma client handles connection pooling and retries
   - Build script includes `prisma generate` to ensure client is ready

## Known Limitations

1. **Polling vs WebSockets:**
   - Uses short polling (2-second intervals) instead of WebSockets
   - Results may lag by up to 2 seconds
   - Higher server load compared to WebSocket push updates

2. **IP-based fairness limitations:**
   - Can affect legitimate users behind shared networks (schools, offices, public WiFi)
   - Can be bypassed using VPN or proxy services

3. **Client-side device ID:**
   - Stored in localStorage, can be cleared by user
   - Not cryptographically secured against manipulation
   - Could be improved with server-side session management

4. **No poll expiration:**
   - Polls persist indefinitely
   - No built-in mechanism to close voting after a deadline
   - Could add `closedAt` timestamp in future

5. **No vote verification:**
   - Once submitted, votes cannot be changed or verified by the voter
   - No receipt or confirmation mechanism

6. **Scalability:**
   - SQLite was initially used (changed to PostgreSQL for production)
   - Polling interval affects server load under high traffic
   - Could benefit from Redis caching for high-traffic polls

## Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Backend:** Next.js API Routes (serverless functions)
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Deployment:** Vercel
- **Real-time:** Short polling (client-side interval refresh every 2s)

## Future Improvements

1. Migrate to WebSockets or Server-Sent Events for true real-time updates
2. Add poll expiration/closing mechanism
3. Implement CAPTCHA for additional abuse prevention
4. Add analytics dashboard for poll creators
5. Support for multiple-choice polls (not just single-choice)
6. Add vote editing/deletion within grace period
7. Implement Redis caching for high-traffic polls
8. Add email notifications for poll creators
9. Export results as CSV/PDF
10. Custom poll themes and branding
