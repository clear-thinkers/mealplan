# 0001 — Local-first IndexedDB over Supabase

## Status
Accepted

## Date
2026-04-30

## Context
The original architecture used Supabase (PostgreSQL) for data storage, authentication, file storage, and Chinese text search via `pg_trgm`. During Phase 1 scaffolding, the cost and complexity of this approach was reconsidered given the actual scale of the app: 2 users, private household, no real-time sync requirements.

Supabase's free tier covers only 2 projects. A 3rd project costs $25/month base + $10/project — ongoing cost for a personal app with no revenue. Additionally, the auth system, row-level security, server-side rendering, and Supabase Storage bucket added architectural complexity that the app does not need to justify.

## Decision
Switch to a local-first architecture:

- **Dexie.js (IndexedDB)** replaces Supabase PostgreSQL — all data lives in the browser, zero hosting cost, works offline
- **No authentication** — private single-household app, login complexity is not justified
- **Manual JSON export/import via OneDrive** replaces real-time sync — one file covers all app data, no sync infrastructure
- **Fuse.js** replaces `pg_trgm` for Chinese text search — runs entirely client-side
- **Vercel free tier** for hosting — fully static app, no compute cost for data operations
- **Photos deferred** — removes the only remaining reason to need cloud storage; can be added later if needed
- **Shopping list sharing** becomes an exported HTML file Fu opens on his phone — no server, no auth required
- **DeepSeek AI calls** remain server-side via Vercel serverless functions — this is the only server-side code, kept solely to protect the API key

## Consequences

**Enables:**
- Zero ongoing hosting cost for the foreseeable life of this app
- Offline use — works without internet after initial load
- Simpler codebase — no auth, no server, no migrations to manage
- Fast iteration — no backend to coordinate with

**Constrains:**
- Data lives in one browser's IndexedDB by default — cross-device use requires manual JSON export/import via OneDrive
- No automatic sync between Chengyuan's phone and laptop — manual discipline required
- Photos cannot be stored until a cloud storage solution is introduced (deferred, not cancelled)
- Browser storage limits apply (~500MB practical limit for IndexedDB on most browsers) — not a concern at this app's scale

**Future migration path (deliberately preserved):**
All DB access is routed through `lib/db.ts`. To migrate to Postgres later:
1. Replace `lib/db.ts` internals with API calls — UI is untouched
2. Add NextAuth for 2 users
3. Point to Neon or Supabase
4. Seed from the JSON export — schema is identical

Estimated effort: one weekend of work.
