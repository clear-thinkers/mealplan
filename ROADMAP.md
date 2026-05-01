# ROADMAP
> Project context for agents. Read this alongside AGENT_RULES.md and ARCH.md at the start of every session.

---

## Project Purpose

A private family diet planning and logging app. Built for one household. Not a SaaS product.

Core jobs the app does:
1. Plan weekly family meals ahead of time, broken down by person
2. Convert meal plans into shopping lists grouped by store (Costco / Whole Foods / Chinese Grocery)
3. Log what was actually cooked and how each family member responded to it
4. Document family recipes in Chinese, English, or mixed text
5. Generate monthly and yearly reports on eating patterns and food preferences

---

## Current Status

**In development - Phase 3 planning.** Phase 2 recipe library is complete: recipe CRUD, Chinese-capable search, soft delete with undo, local-first persistence, automated checks, and manual dev testing are done. See `docs/adr/0001-local-first-indexeddb-over-supabase.md`.

---

## Phase Overview

```text
Phase 1 -> Foundation          COMPLETE
Phase 2 -> Recipe Library      COMPLETE
Phase 3 -> Meal Planning       NEXT
Phase 4 -> Shopping Lists
Phase 5 -> Meal Logging
Phase 6 -> Preferences Engine
Phase 7 -> Reports
Phase 8 -> AI Layer
```

Phases are sequential. Do not begin a phase until the prior phase is stable and manually tested.

---

## Phase 1 - Foundation
**Goal:** Working Next.js app with Dexie initialized and base navigation. No auth. Nothing functionally useful yet.

**Deliverables:**
- [x] Repo initialized (Next.js 14, TypeScript, Tailwind, shadcn/ui)
- [x] Dexie.js installed, `shared/lib/db-schema.ts` created with full schema per ARCH.md
- [x] `shared/lib/db.ts` abstraction layer created; all future DB calls go through here
- [x] `shared/lib/constants.ts` created with FAMILY_MEMBERS, STORES, MEAL_TIMES
- [x] Fuse.js installed and configured in `shared/lib/search.ts`
- [x] Base layout: sidebar navigation (desktop) + bottom nav (mobile)
- [x] All placeholder pages created per nav structure in ARCH.md
- [x] `/settings` page scaffolded (export/import UI shell, non-functional for now)
- [x] Vercel deployment connected to GitHub main branch
- [x] `DEEPSEEK_API_KEY` added to Vercel environment variables

**Done when:** App loads at localhost:3000, navigation works across all pages, Dexie initializes without errors in browser console.

**Status:** Complete.

---

## Phase 2 - Recipe Library
**Goal:** Full recipe CRUD. This is the core asset the rest of the app depends on.

**Deliverables:**
- [x] Recipe list page with Fuse.js search (supports Chinese text)
- [x] Recipe detail page, mobile-optimized for use while cooking
- [x] Recipe create/edit form:
  - Name (Chinese/English)
  - Ingredients with quantities and units
  - Steps (ordered)
  - Tags, for example Shanghai, quick, high protein, soup, staple
  - Per-person modification notes, for example "no spice for kids"
  - Serves count
  - Source/origin field, for example "family recipe"
- [x] Soft delete with undo
- [x] All data persisted via `shared/lib/db.ts`; no direct Dexie calls in components

**Dexie tables used:** `recipes`, `recipeIngredients`, `recipeSteps`, `recipeMemberNotes`

**Note:** Photo upload is deferred. The `photo_url` field is intentionally absent from the schema at this phase. See ADR-0001.

**Done when:** Can create, view, edit, search, and soft-delete 20+ recipes including Chinese-named ones. Search returns relevant results for Chinese queries.

**Status:** Complete.

---

## Phase 3 - Meal Planning
**Goal:** Plan a full week of meals for the family, broken down by person and meal slot. Also deliver the Controls page and seasoning quick-select to support faster recipe authoring.

**Deliverables:**
- [ ] Weekly calendar grid: Monday-Sunday x Breakfast / Lunch / Dinner / Snack
- [ ] Assign recipes to slots with per-person serving assignments
- [ ] Support "shared base + modifications" pattern (one recipe, different notes per person)
- [ ] Support slots with no recipe (eating out, skip, etc.)
- [ ] Week navigation (prev/next week)
- [ ] Copy last week's plan as starting draft
- [ ] Seasoning quick-select panel on recipe ingredient form: tap to check pantry seasonings (盐 糖 油 etc.) as `RecipeIngredient` rows; tapping a checked item expands optional quantity/unit input
- [ ] Controls page (`/controls`): manage household pantry seasoning list — add, reorder, flag as low, remove; first-visit seed prompt with common Chinese cooking staples
- [ ] Controls page navigates to `/controls/store-preferences` for ingredient → store mapping (moves from `/settings`; see ADR-0002)

**Dexie tables used:** `mealPlans`, `mealPlanSlots`, `plannedServings`, `pantrySeasonings`

**Done when:** Can plan a full week, see each person's meals at a glance, navigate between weeks, manage the pantry seasoning list, and use the seasoning quick-select when editing any recipe.

---

## Phase 4 - Shopping Lists
**Goal:** Auto-generate a store-grouped shopping list from a weekly meal plan.

**Deliverables:**
- [ ] Shopping preference table (ingredient -> store mapping) at `/controls/store-preferences` (moved from `/settings` in Phase 3; service layer unchanged)
- [ ] Auto-include pantry seasonings flagged as low (`isLow: true`) in generated shopping lists
- [ ] Mechanical ingredient aggregation from a week's meal plan
- [ ] List grouped by: Costco / Whole Foods / Chinese Grocery / Unassigned
- [ ] Unassigned items shown separately with AI-suggested store (confirm before saving)
- [ ] Manual add/remove items
- [ ] Check-off items while shopping
- [ ] Export as self-contained HTML file; Fu opens on his phone via iMessage/OneDrive, no account needed

**Dexie tables used:** `shoppingPreferences`, `shoppingLists`, `shoppingListItems`

**Done when:** Generate a week's shopping list in under 10 seconds, exported HTML file opens correctly on mobile and shows all items grouped by store.

---

## Phase 5 - Meal Logging
**Goal:** Quickly record what was actually eaten and how each person responded.

**Deliverables:**
- [ ] Log entry: date + meal time + what was cooked (link to recipe or free text)
- [ ] Per-person quick checklist: ate it / partial / rejected + optional satisfaction (1-5 stars)
- [ ] Optional free-text notes per log entry
- [ ] Log history view (calendar and list views)
- [ ] Entire logging flow completable in under 30 seconds on mobile

**Dexie tables used:** `mealLogs`, `actualServings`

**Note:** Photo upload is deferred. See ADR-0001.

**Done when:** Can log a full family dinner in 30 seconds on mobile including per-person responses.

---

## Phase 6 - Preferences Engine
**Goal:** Build per-person taste profiles from logged data.

**Deliverables:**
- [ ] Auto-derived preference scores per person per recipe (from ActualServings)
- [ ] Manual override: user can edit a preference record directly
- [ ] Per-person preference view: accepted foods, rejected foods, neutral
- [ ] Freddie-specific view: food introduction timeline, acceptance rate by food category
- [ ] Nora-specific view: satisfaction trends over time

**Dexie tables used:** `preferenceRecords`

**Done when:** Each family member has a readable taste profile derived from at least 2 weeks of logs.

---

## Phase 7 - Reports
**Goal:** Monthly and yearly summaries of family eating patterns.

**Deliverables:**
- [ ] Monthly report: meal variety, per-person satisfaction averages, most/least eaten, Freddie's new foods
- [ ] Yearly report: trend lines, seasonal patterns, health goal alignment
- [ ] All charts built with Recharts
- [ ] Export to PDF (nice to have)
- [ ] AI narrative summary (optional, generated on demand); see Phase 8

**Done when:** Can generate a monthly report that surfaces one meaningful insight not obvious from raw logs.

---

## Phase 8 - AI Layer
**Goal:** Add AI features on top of the stable data layer. These are enhancements, not core functionality.

**Deliverables (in priority order):**
- [ ] Recipe parser: paste freeform text -> structured recipe draft for review
- [ ] Meal plan suggester: AI drafts next week's plan based on library + preferences + recency
- [ ] Shopping list store router: suggest store for unassigned ingredients
- [ ] Preference summarizer: plain-language taste profile per person
- [ ] Report narrative: 2-3 paragraph human-readable monthly summary
- [ ] Recipe Q&A: ask about a recipe (modifications, substitutions, nutrition context)

**Rules:** See AGENT_RULES.md section 5. AI writes to draft/suggestion state only. All features degrade gracefully if API is unavailable.

**Done when:** All 6 AI features implemented and manually tested, each with a working non-AI fallback.

---

## Out of Scope (for now)

- Nutrition/macro tracking; not reliable enough for home Chinese cooking
- Multi-household support; this is a private app
- Public recipe sharing
- Integration with external recipe sources
- Automated grocery ordering
- Barcode scanning

---

## Key Constraints to Carry Through All Phases

1. Mobile-first for logging (Phase 5); that flow is used in the kitchen
2. Chinese text works everywhere content is stored, searched, or displayed
3. Shopping list export as HTML must open correctly on Fu's phone without any account
4. AI is always optional; every feature works without it
5. All DB access goes through `shared/lib/db.ts`; never call Dexie directly from components
