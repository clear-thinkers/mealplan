# Scaffolding TODO
> Complete in order. Check off each item before moving to the next.

---

- [x] Read AGENT_RULES.md, ROADMAP.md, ARCH.md, and docs/UI_STYLE.md before starting
- [x] Initialize Next.js project with TypeScript and Tailwind
- [x] Install and configure shadcn/ui
- [x] Install Dexie.js and Fuse.js
- [x] Create the full directory structure per ARCH.md
- [x] Create `lib/db-schema.ts` with full Dexie schema per ARCH.md
- [x] Create `lib/db.ts` abstraction layer - this is the only file that may call Dexie
- [x] Create `lib/constants.ts` with FAMILY_MEMBERS, STORES, and MEAL_TIMES
- [x] Configure Fuse.js in `lib/search.ts`
- [x] Build the app shell layout with sidebar (desktop) and bottom nav (mobile)
- [x] Add placeholder pages for all routes per ARCH.md navigation structure
- [x] Scaffold `/settings` page (export/import UI shell - non-functional for now)
- [x] Verify Dexie initializes without errors in browser console
- [x] Set up git: https://github.com/clear-thinkers/mealplan.git
- [x] Add `DEEPSEEK_API_KEY` to Vercel environment variables
- [x] Deploy to Vercel and confirm app loads
