# ARCH — Architecture Reference
> Structural decisions for the diet planning app. Read alongside AGENT_RULES.md and ROADMAP.md.

---

## Architecture Overview

**Local-first React app.** All data lives in the browser via IndexedDB (Dexie.js). No backend server, no database hosting cost, works offline. Cross-device sync is handled manually via JSON export/import stored in OneDrive.

The only server-side component is a single Vercel serverless function for AI calls — this exists solely to keep the DeepSeek API key out of the client bundle. Everything else runs in the browser.

**Future migration path is intentionally preserved.** All DB access goes through `lib/db.ts`. Swapping Dexie for API calls requires changing only that file — the rest of the app is untouched. See `docs/adr/0001-local-first-indexeddb-over-supabase.md`.

---

## Repository Structure

```
dietapp/
├── AGENT_RULES.md              # Agent must read every session
├── ROADMAP.md                  # Phase-by-phase build plan
├── ARCH.md                     # This file
│
├── docs/                       # All project documentation
│   ├── UI_STYLE.md             # Visual design system — read before any UI work
│   └── adr/                    # Architecture Decision Records
│       ├── README.md           # ADR index and format guide
│       └── 0001-local-first-indexeddb-over-supabase.md
│
├── app/                        # Next.js App Router
│   ├── (app)/                  # All pages — no auth group needed
│   │   ├── layout.tsx          # Shell: sidebar + bottom nav
│   │   ├── dashboard/
│   │   ├── recipes/
│   │   ├── meal-plan/
│   │   ├── shopping/
│   │   ├── log/
│   │   ├── preferences/
│   │   ├── reports/
│   │   └── settings/           # Data export/import, store preferences
│   └── api/
│       └── ai/                 # Serverless functions for AI only — keeps API key server-side
│           ├── parse-recipe/
│           ├── suggest-plan/
│           ├── route-shopping/
│           ├── summarize-preferences/
│           ├── report-narrative/
│           └── recipe-qa/
│
├── modules/                    # Feature modules — one per domain
│   ├── recipes/
│   │   ├── components/         # RecipeCard, RecipeForm, RecipeDetail
│   │   ├── hooks/              # useRecipes, useRecipeSearch
│   │   ├── schemas/            # Zod validation schemas
│   │   └── types.ts
│   ├── meal-plan/
│   ├── controls/               # Pantry seasonings CRUD, store preferences nav
│   ├── shopping/
│   ├── logging/
│   ├── preferences/
│   ├── reports/
│   └── ai/
│       ├── components/         # RecipeParser, MealPlanSuggester, etc.
│       ├── hooks/
│       └── prompts/            # Prompt templates as .ts files
│
├── shared/
│   ├── components/             # Layout, Nav, Button, Modal, etc.
│   └── lib/
│       ├── db.ts               # ⚠️ THE ONLY FILE THAT CALLS DEXIE — never import Dexie elsewhere
│       ├── db-schema.ts        # Dexie table definitions and version history
│       ├── export.ts           # JSON export/import logic
│       ├── search.ts           # Fuse.js setup and helpers for Chinese text search
│       ├── services/           # Business logic — called by hooks
│       │   ├── recipe-service.ts
│       │   ├── meal-plan-service.ts
│       │   ├── shopping-service.ts
│       │   ├── log-service.ts
│       │   └── ai-service.ts   # Calls app/api/ai/* routes
│       ├── utils/
│       │   ├── dates.ts
│       │   └── format.ts
│       └── constants.ts        # STORES, MEAL_TIMES, FAMILY_MEMBERS seed data
│
└── public/
```

---

## Data Architecture

All tables are Dexie stores. Schema uses TypeScript interface syntax — defined in `lib/db-schema.ts`. Relationships are maintained by convention (IDs stored as strings); no foreign key enforcement at the DB level.

### Family Members
Hardcoded in `lib/constants.ts` — not stored in IndexedDB. Four members, never change.

```typescript
export const FAMILY_MEMBERS = [
  { id: 'chengyuan', name: 'Chengyuan', nickname: '',     role: 'adult', birthdate: '1988-06-01' },
  { id: 'fu',        name: 'Fu',        nickname: '',     role: 'adult', birthdate: '1988-01-01' },
  { id: 'nora',      name: 'Nora',      nickname: '瓜瓜', role: 'child', birthdate: '2018-07-01' },
  { id: 'freddie',   name: 'Freddie',   nickname: '毛毛', role: 'child', birthdate: '2023-05-01' },
] as const;
```

### Recipes

```typescript
interface Recipe {
  id: string               // uuid — generated client-side
  name: string             // Chinese or English
  description?: string
  serves: number
  prepMinutes?: number
  cookMinutes?: number
  source?: string          // "妈妈配方", URL
  tags: string[]           // ["上海菜", "快手", "主食"]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface RecipeIngredient {
  id: string
  recipeId: string
  name: string             // "豆腐", "scallions"
  quantity?: number
  unit?: string
  notes?: string
  sortOrder: number
}

interface RecipeStep {
  id: string
  recipeId: string
  stepNumber: number
  instruction: string
}

interface RecipeMemberNote {
  id: string
  recipeId: string
  familyMemberId: string
  notes: string            // "no spice", "cut smaller for 毛毛"
}
```

### Meal Planning

```typescript
interface MealPlan {
  id: string
  weekStart: string        // ISO date, always Monday
  notes?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface MealPlanSlot {
  id: string
  mealPlanId: string
  dayOfWeek: number        // 0=Mon … 6=Sun
  mealTime: string         // 'breakfast'|'lunch'|'dinner'|'snack'
  recipeId?: string
  freeText?: string
}

interface PlannedServing {
  id: string
  mealPlanSlotId: string
  familyMemberId: string
  included: boolean
  portionNotes?: string
}
```

### Pantry Seasonings

```typescript
interface PantrySeasoning {
  id: string
  name: string             // "盐", "糖", "油", "酱油" — Chinese or English
  isLow: boolean           // user-flagged as running low; auto-added to shopping list (Phase 4)
  sortOrder: number        // user-controlled display order
  notes?: string
  createdAt: string
  updatedAt: string
}
```

`pantrySeasonings` is user-managed. The app offers a seed prompt (common Chinese cooking staples) on first visit to `/controls`. The quick-select panel on the recipe ingredient form reads from this table; checked items become ordinary `RecipeIngredient` rows — no special flag on `RecipeIngredient`.

### Shopping

```typescript
interface ShoppingPreference {
  id: string
  ingredientName: string   // normalized, Chinese OK
  preferredStore: string   // 'costco'|'wholefoods'|'chinese_grocery'|'any'
  notes?: string
  confirmed: boolean       // false = AI-suggested, awaiting confirmation
  createdAt: string
  updatedAt: string
}

interface ShoppingList {
  id: string
  mealPlanId?: string
  notes?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface ShoppingListItem {
  id: string
  shoppingListId: string
  ingredientName: string
  quantity?: number
  unit?: string
  store: string
  storeConfirmed: boolean
  isChecked: boolean
  isManualAdd: boolean
}
```

### Meal Logging

```typescript
interface MealLog {
  id: string
  logDate: string
  mealTime: string
  recipeId?: string
  freeText?: string
  notes?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  // photo_url omitted — photos deferred, see ADR-0001
}

interface ActualServing {
  id: string
  mealLogId: string
  familyMemberId: string
  ateStatus: string        // 'ate'|'partial'|'rejected'
  satisfaction?: number    // 1–5
  notes?: string
}
```

### Preferences

```typescript
interface PreferenceRecord {
  id: string
  familyMemberId: string
  recipeId: string
  avgSatisfaction?: number
  timesEaten: number
  timesRejected: number
  manualOverride: boolean
  overrideNotes?: string
  lastEaten?: string
  updatedAt: string
  // uniqueness enforced in application code: one record per (familyMemberId, recipeId)
}
```

---

## Dexie Store Definition

```typescript
// lib/db-schema.ts
import Dexie, { type EntityTable } from 'dexie';

export const db = new Dexie('dietapp') as Dexie & {
  recipes: EntityTable<Recipe, 'id'>;
  recipeIngredients: EntityTable<RecipeIngredient, 'id'>;
  recipeSteps: EntityTable<RecipeStep, 'id'>;
  recipeMemberNotes: EntityTable<RecipeMemberNote, 'id'>;
  mealPlans: EntityTable<MealPlan, 'id'>;
  mealPlanSlots: EntityTable<MealPlanSlot, 'id'>;
  plannedServings: EntityTable<PlannedServing, 'id'>;
  pantrySeasonings: EntityTable<PantrySeasoning, 'id'>;  // Phase 3 — see ADR-0002
  shoppingPreferences: EntityTable<ShoppingPreference, 'id'>;
  shoppingLists: EntityTable<ShoppingList, 'id'>;
  shoppingListItems: EntityTable<ShoppingListItem, 'id'>;
  mealLogs: EntityTable<MealLog, 'id'>;
  actualServings: EntityTable<ActualServing, 'id'>;
  preferenceRecords: EntityTable<PreferenceRecord, 'id'>;
};

db.version(1).stores({
  recipes:             '++id, name, isDeleted',
  recipeIngredients:   '++id, recipeId',
  recipeSteps:         '++id, recipeId',
  recipeMemberNotes:   '++id, recipeId, familyMemberId',
  mealPlans:           '++id, weekStart, isDeleted',
  mealPlanSlots:       '++id, mealPlanId',
  plannedServings:     '++id, mealPlanSlotId, familyMemberId',
  shoppingPreferences: '++id, ingredientName',
  shoppingLists:       '++id, mealPlanId, isDeleted',
  shoppingListItems:   '++id, shoppingListId, store',
  mealLogs:            '++id, logDate, mealTime, isDeleted',
  actualServings:      '++id, mealLogId, familyMemberId',
  preferenceRecords:   '++id, [familyMemberId+recipeId], familyMemberId',
});

// Version 2: adds pantrySeasonings table (Phase 3 — ADR-0002)
db.version(2).stores({
  pantrySeasonings: '++id, isLow, sortOrder',
});
```

---

## Key Architectural Patterns

### 1. lib/db.ts Is the Only Entry Point to the Database
**This is the most critical rule in the codebase.**

Components and hooks never import `dexie` or `lib/db-schema.ts` directly. All reads and writes go through service functions in `lib/services/`, which call `lib/db.ts` only. This single abstraction layer makes the future Postgres migration a one-file swap.

```
Component / Hook
  → lib/services/recipe-service.ts
  → lib/db.ts                        ← only file that touches Dexie
  → IndexedDB (browser)
```

### 2. All Pages Are Client Components
This is a fully client-side app. Every page uses `'use client'`. There are no React Server Components for data — they require a Node.js runtime, which this app deliberately avoids.

Exception: `app/api/ai/` routes are Vercel serverless functions — the only intentional server-side code.

### 3. Zod Schemas as Single Source of Truth
Each module's `schemas/` file defines the Zod schema used for:
- Form validation (React Hook Form)
- TypeScript type inference
- JSON import validation in `lib/export.ts`

Never define types manually if a Zod schema exists.

### 4. AI Calls Stay Server-Side
The DeepSeek API key must never appear in the client bundle. All AI features call `app/api/ai/` serverless routes, which hold the key in Vercel environment variables.

```
modules/ai/hooks/useRecipeParser.ts
  → POST /api/ai/parse-recipe       ← serverless, key is safe
  → returns draft Recipe shape
  → user confirms → recipe-service.ts → lib/db.ts
```

### 5. Shopping List Sharing
No server, no share token. Export as self-contained HTML file, share via iMessage or OneDrive. Fu opens it on his phone — no account, no app needed.

### 6. Cross-Device Sync
Manual JSON export/import via OneDrive, accessible at `/settings`.
- **Export:** all Dexie tables → single JSON file → save to OneDrive
- **Import:** validate JSON with Zod → merge into IndexedDB (last-write-wins on ID collision)

---

## AI Prompt Architecture

Prompt templates in `modules/ai/prompts/` — TypeScript files exporting typed builder functions:

```typescript
// modules/ai/prompts/recipe-parser.ts
export function buildRecipeParserPrompt(rawText: string): string {
  return `Parse the following recipe and return ONLY valid JSON...
  Input: ${rawText}`;
}
```

Rules:
- Every prompt specifies JSON-only output
- Every AI call wraps in try/catch with a typed fallback
- Prompt files versioned by suffix when significantly changed: `recipe-parser-v2.ts`

---

## Environment Variables

One secret only. No database credentials, no auth secrets.

```
# Vercel environment variables only — never in .env.local, never client-side
DEEPSEEK_API_KEY=
```

No `NEXT_PUBLIC_` variables needed. The app has no runtime configuration that needs to reach the browser.

---

## Navigation Structure

```
/ (redirect to /dashboard)

/dashboard           Weekly overview — today's meals + quick log button
/recipes             Recipe library list + search
/recipes/new         Create recipe
/recipes/[id]        Recipe detail (mobile cooking view)
/recipes/[id]/edit   Edit recipe

/meal-plan                      Current week grid
/meal-plan/[date]               Specific week

/controls                       Household controls hub (Phase 3+)
/controls/store-preferences     Ingredient → store mapping (moved from /settings — ADR-0002)

/shopping                       Current shopping list
/shopping/[id]                  Specific list (share = export HTML, no route needed)

/log                            Log entry — today default
/log/history                    Past logs calendar view

/preferences                    Per-person taste profiles

/reports/monthly                Monthly report
/reports/yearly                 Yearly report

/settings                       Export data, import data
```

---

## Stores Enum

```typescript
// shared/lib/constants.ts
export const STORES = {
  COSTCO: 'costco',
  WHOLEFOODS: 'wholefoods',
  CHINESE_GROCERY: 'chinese_grocery',
  ANY: 'any',
  UNASSIGNED: 'unassigned',
} as const;

export const STORE_LABELS: Record<string, string> = {
  costco: 'Costco',
  wholefoods: 'Whole Foods',
  chinese_grocery: 'Chinese Grocery',
  any: 'Any Store',
  unassigned: 'Unassigned',
};

export const MEAL_TIMES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
```

---

## Docs Folder Convention

All project documentation lives in `docs/`. Agent reads, never writes directly.

### docs/UI_STYLE.md
Visual design system. Read before writing any component, page, or CSS. See AGENT_RULES.md §8a.

### docs/adr/
**When to write an ADR:** Non-obvious decisions, debated choices, or anything that would confuse a future agent without context.

**Filename format:** `NNNN-short-title.md`

**Format:**
```
# NNNN — Title
## Status   (Accepted | Superseded by NNNN | Deprecated)
## Date     (YYYY-MM-DD)
## Context
## Decision
## Consequences
```

**Agent rule:** Scan `docs/adr/` at session start. ADR decisions are settled. Flag new significant decisions for the human to record.
