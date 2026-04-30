# AGENT RULES
> Read this file at the start of every build session. These rules are non-negotiable.

---

## 1. Identity of This Project

This is a private family diet planning and logging app for a household of 4:
- **Chengyuan** (adult, owner, primary user)
- **Fu** (adult, secondary user - mainly shopping list consumer)
- **Nora / 瓜瓜** (child, born July 2018)
- **Freddie / 毛毛** (child, born May 2023)

The app is built for self-use. Simplicity and low maintenance overhead take priority over feature richness.

---

## 2. Stack - Never Deviate Without Explicit Instruction

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Routing, static export, serverless AI routes |
| Language | TypeScript | Type safety throughout |
| Database | Dexie.js (IndexedDB) | Local-first, offline, zero hosting cost |
| Search | Fuse.js | Client-side fuzzy search, including Chinese text |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| UI Components | shadcn/ui | Accessible, unstyled base, composable |
| Charts | Recharts | React ecosystem |
| Hosting | Vercel | Static app + serverless AI routes, free tier |
| AI | DeepSeek API (`deepseek-v4-flash`) | Server-side only via Vercel functions |

**No auth.** This is a private single-household app. No login, no session management, no user table.

**Do not introduce new dependencies without noting them explicitly and explaining why.**

---

## 3. Chinese Content - Always Supported

- All user-facing content fields (recipe names, ingredients, notes, steps, tags) accept Chinese characters natively
- IndexedDB stores JavaScript strings natively; preserve Unicode exactly and never normalize away Chinese characters
- Never assume input will be in English; validation, search, and display logic must handle Chinese
- Use Fuse.js for client-side fuzzy search; shared search helpers live in `shared/lib/search.ts`
- UI language is English; content language is Chinese, English, or mixed

---

## 4. Module Boundaries - Strictly Enforced

Every feature lives in its own module directory. Modules do not import from each other's internals; only from `shared/`. See `ARCH.md` for full structure.

**Rule:** If you find yourself importing `../recipes/utils` from inside `meal-plan/`, stop. Extract the shared logic to `shared/lib/` first.

---

## 5. AI API Usage - Hard Rules

AI is a feature layer, not infrastructure. The app must function fully without AI calls.

| Allowed | Not Allowed |
|---|---|
| Recipe parsing from freeform text | Auto-saving anything without user confirmation |
| Meal plan draft suggestions | Inferring health/medical data |
| Shopping list store routing for unassigned items | Writing directly to meal plan or log |
| Preference profile summaries | Replacing deterministic logic (aggregation, scheduling) |
| Monthly/yearly report narratives | Auto-tagging without user review |
| Recipe Q&A assistant | Any background AI calls not triggered by user action |

**AI writes to draft/suggestion state only. The user always confirms before persistence.**

---

## 6. Database Rules

- **`shared/lib/db.ts` is the only file that may import or call Dexie.** No exceptions. Components, hooks, and services never touch Dexie directly.
- All reads and writes go through service functions in `shared/lib/services/`, which call `shared/lib/db.ts`.
- Family members are hardcoded constants in `shared/lib/constants.ts`; never store them in IndexedDB or fetch them from a DB call.
- Soft deletes only: set `isDeleted: true`, never hard-delete user data records.
- All IDs are client-generated UUIDs using `crypto.randomUUID()`.
- All timestamps are ISO 8601 strings using `new Date().toISOString()`.
- Uniqueness constraints are not enforced by IndexedDB; enforce them in the relevant service function.
- Schema version changes go in `shared/lib/db-schema.ts` with a new version block; never edit an existing version block after data may exist.
- When adding a new field to an existing table, increment the schema version and provide an upgrade function.

---

## 7. API Routes

There is only one category of API route in this app: `app/api/ai/` serverless functions for AI features. These exist solely to keep the DeepSeek API key server-side.

- All AI routes return a `{ data, error }` envelope.
- Errors always include a `code` string and human-readable `message`.
- AI routes must use the model from `shared/lib/ai-config.ts`; the current model is `deepseek-v4-flash`.
- `DEEPSEEK_API_KEY` is accessed only inside these routes; never pass it to the client.
- All other data operations are client-side via `shared/lib/db.ts`; no data API routes exist or should be created.

---

## 8. Component Rules

- Components are either **page-level** (`app/`), **feature-level** (`modules/`), or **shared** (`shared/components/`).
- No inline styles; Tailwind only.
- Every interactive element that touches app data goes through a service function in `shared/lib/services/`.
- Components, hooks, and modules must not import Dexie or `shared/lib/db-schema.ts` directly.
- Forms use React Hook Form + Zod for validation.
- Loading and error states are always handled; never leave a component without both.

---

## 8a. UI Design Standards - Non-Negotiable

**Read `docs/UI_STYLE.md` before writing any component, page, or CSS.**

This app has a defined design system. The agent must comply with it fully. Key rules:

- **Color:** Use only the tokens defined in `docs/UI_STYLE.md`. Do not introduce new colors. Do not default to generic blue, gray, or white.
  - Page background: `#F4EFE6` (cream), never white
  - Headers/primary CTA: `#243D2F` (green-dark)
  - Five button colors only: `green-dark`, `green-mid`, `accent-purple`, `accent-gold`, `accent-olive`
- **Accent discipline:** Use at most one accent color per screen. Green is the default; accents are for specific highlight actions only.
- **Typography:** System sans-serif only. Two weights: 400 and 600. Never 700+. Sentence case everywhere.
- **Cards:** `background: #FAF7F2`, `border: 0.5px solid #E2D9CC`, `border-radius: 10px`.
- **No gradients, no drop shadows on cards, no decorative effects.**
- **Dark mode:** Not implemented. Light mode only.
- **Icons:** Simple SVG with `stroke: currentColor`. No emoji in UI.
- **Family avatars:** Each person has a fixed color: Chengyuan `#2D5240`, Fu `#4A7C5F`, 瓜瓜 `#6B9E7A`, 毛毛 `#8ABE9A`. Never reassign these.

When in doubt about any visual decision, check `docs/UI_STYLE.md` first. If it is not covered there, match the closest existing pattern rather than inventing something new.

---

## 9. File Naming Conventions

```text
PascalCase    -> React components (.tsx)
kebab-case    -> all other files (.ts, route files)
SCREAMING     -> config/rule/doc files (AGENT_RULES.md, ARCH.md)
camelCase     -> functions and variables
```

---

## 10. Testing Mindset

This is a solo-use app. Full test suites are not required. However:

- Every Dexie schema version change must be verified in a browser and must preserve existing data through an upgrade path.
- Every AI prompt must have a fallback for API failure.
- Every form must have Zod validation that mirrors the Dexie schema and service-level constraints exactly.
- Export/import changes must be tested with a real JSON round trip.
- Before shipping any phase, manually test on mobile. The logging flow especially must be fast on mobile.

---

## 11. What to Do When Uncertain

1. Re-read `ARCH.md` for structural decisions.
2. Re-read `ROADMAP.md` for scope of current phase.
3. Re-read `docs/UI_STYLE.md` for any visual or component decision.
4. Scan `docs/adr/` for any recorded decision relevant to the current task; if it is in an ADR, it is settled.
5. **Do not guess at schema changes.** Add a new Dexie schema version and flag it for review.
6. **Do not add AI to a feature not listed in `ARCH.md`.** Flag it as a suggestion instead.
7. When in doubt about a dependency, ask before installing.
8. If a significant new decision arises during a build session, flag it for the human to record as an ADR; do not make it silently.

---

## 12. Performance Expectations

This app serves 1-2 concurrent users maximum. Do not over-engineer for scale. Optimize for:

- Fast mobile load; meal logging must feel instant.
- Offline-first behavior after initial load.
- Minimal cold start on Vercel serverless functions for AI routes.
- Simple IndexedDB queries and service logic over clever client-side data plumbing.
