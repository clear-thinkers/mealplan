# 0002 — Pantry Seasonings Table and Controls Page

## Status
Accepted

## Date
2026-05-01

## Context
During Phase 3 (Meal Planning), a recurring friction point emerged in recipe ingredient entry: common household seasonings (盐, 糖, 油, 酱油, etc.) must be typed one at a time as individual `RecipeIngredient` rows. Because these seasonings are used across most recipes and are always in the pantry, adding them should be a fast multi-check action rather than a sequential form-fill.

Separately, the family needs a way to:
1. Maintain a canonical list of seasonings kept in the kitchen
2. Flag individual seasonings as running low so they appear on the next shopping list automatically
3. Access ingredient-to-store mapping from a dedicated household configuration hub rather than burying it in the data export/import settings page

## Decision

### 1. New `pantrySeasonings` Dexie Table

A new table stores the family's canonical list of kitchen seasonings:

```typescript
interface PantrySeasoning extends TimestampedRecord {
  id: string
  name: string       // Chinese or English: 盐, 糖, 油, 酱油, etc.
  isLow: boolean     // user-flagged as running low → auto-included in shopping list (Phase 4)
  sortOrder: number  // user-controlled display order
  notes?: string
}
```

This table is user-managed. The family decides what belongs in it. The app ships with an empty list; a seed prompt (defaulting to common Chinese cooking staples) is shown on first visit to the Controls page to reduce cold-start friction.

### 2. Seasoning Quick-Select on Recipe Ingredient Form

The recipe ingredient form gains a collapsible "Seasonings" panel above the manual ingredient entry rows. It renders all entries from `pantrySeasonings` as checkboxes. Tapping a checkbox appends a `RecipeIngredient` row with that name (same schema — no new fields on `RecipeIngredient`). Tapping an already-checked seasoning expands an inline quantity/unit input; this is optional and most entries will have none.

The quick-select is a pure UX affordance. Checked seasonings become ordinary `RecipeIngredient` rows with no special flag — the downstream recipe and shopping pipeline treats them identically to any other ingredient.

### 3. Controls Page (`/controls`)

A new top-level page serving as the household operations hub, surfaced in the sidebar/bottom nav alongside Recipes and Meal Plan.

Sections:
- **Pantry seasonings:** full CRUD for the `pantrySeasonings` list — add, reorder (up/down buttons or drag), flag/unflag as low, remove
- **Store preferences card:** navigation entry that opens `/controls/store-preferences`

### 4. Store Preferences Moved to `/controls/store-preferences`

The ingredient-to-store mapping UI (the `shoppingPreferences` table) moves from `/settings` to `/controls/store-preferences`. The `/settings` page retains only data export/import. The `shoppingPreferences` Dexie table, its service functions, and schema are unchanged — only the hosting route changes.

### 5. Low-Stock → Shopping List Integration (Phase 4)

When Phase 4 shopping list generation runs, it reads `pantrySeasonings` where `isLow: true` and appends those as items to the generated list automatically. This keeps Phase 3 scope to the UI and data layer; the integration logic is a Phase 4 deliverable.

## Consequences

**Enables:**
- Faster seasoning entry in recipe forms — one tap per common seasoning instead of a typed ingredient row
- Pantry-level awareness without a full inventory system — only tracks the "running low" boolean, not actual quantities
- Low-stock flagging feeds Phase 4 shopping list generation with no extra user action at list-generation time
- Clean separation: `/settings` = data management, `/controls` = household configuration

**Constrains:**
- The quick-select panel shows nothing until `pantrySeasonings` is populated — new installs require a Controls setup step before the feature is useful in recipe forms
- `sortOrder` management adds UI complexity (reorder controls); the minimum viable implementation uses up/down buttons
- Moving store preferences from `/settings` to `/controls/store-preferences` changes a documented route — any deep links or nav entries pointing at the old location must be updated
- The `pantrySeasonings` table requires a Dexie schema version increment (version 2)
