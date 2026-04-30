# Phase 2 Implementation Plan - Recipe Library
> Build after Phase 1 foundation. Follow `AGENT_RULES.md`, `ARCH.md`, `ROADMAP.md`, `docs/UI_STYLE.md`, and ADR-0001.

---

## Goal

Implement full local-first recipe CRUD backed by Dexie through `shared/lib/db.ts`, with Chinese-capable Fuse search and mobile-friendly recipe views.

Phase 2 is complete when the app can create, view, edit, search, and soft-delete at least 20 recipes, including Chinese-named recipes, with no direct Dexie usage outside `shared/lib/db.ts`.

---

## Preflight Instructions

Before writing Phase 2 code:

- Read `AGENT_RULES.md`, `ARCH.md`, `ROADMAP.md`, and `docs/UI_STYLE.md`.
- Scan `docs/adr/` and treat accepted ADR decisions as settled.
- Confirm `shared/lib/db.ts` remains the only file that imports Dexie.
- Confirm whether any proposed test dependency is already installed before adding it.

---

## Scope

### In Scope

- Recipe list page at `/recipes`
- Recipe detail page at `/recipes/[id]`
- Recipe create page at `/recipes/new`
- Recipe edit page at `/recipes/[id]/edit`
- Recipe form validation with Zod
- Ingredients, steps, tags, source, serves, prep/cook minutes, description
- Per-person modification notes using hardcoded `FAMILY_MEMBERS`
- Soft delete with undo
- Fuse.js search across Chinese, English, tags, ingredients, source, and notes
- Local persistence through service functions only

### Out of Scope

- Photo upload or storage
- AI recipe parsing
- Meal planning integration
- Import/export implementation
- Nutrition or macro tracking

---

## Architecture Rules

- Components and hooks must not import Dexie.
- Components and hooks must not import `shared/lib/db-schema.ts` directly unless only importing TypeScript types is unavoidable; prefer module-local recipe types inferred from Zod schemas.
- All persistence goes through `shared/lib/services/recipe-service.ts`.
- Do not add a repository layer. The only permitted persistence path is component/hook -> `shared/lib/services/recipe-service.ts` -> `shared/lib/db.ts`.
- Search uses `shared/lib/search.ts`; do not create feature-local Fuse wrappers unless they delegate to shared helpers.
- UI must use tokens from `docs/UI_STYLE.md`; no white app background, no gradients, no card shadows.

---

## Data Model

Use existing Dexie tables:

- `recipes`
- `recipeIngredients`
- `recipeSteps`
- `recipeMemberNotes`

No schema version change is expected for Phase 2. If a schema mismatch is discovered, stop and flag it before changing the schema.

---

## Implementation Order

### 1. Recipe Validation Schema

Create recipe Zod schemas under `modules/recipes/schemas/`.

Expected schemas:

- `recipe-form-schema.ts`
- create input schema
- update input schema
- ingredient row schema
- step row schema
- member note row schema

Validation requirements:

- `name` is required and trimmed.
- `serves` is an integer greater than 0.
- `prepMinutes` and `cookMinutes` are optional non-negative integers.
- Ingredient names are required when an ingredient row exists.
- Step instructions are required when a step row exists.
- Tags are trimmed, deduped, and may contain Chinese.
- Member note IDs must match `FAMILY_MEMBERS`.

### 2. Recipe Service Layer

Implement `shared/lib/services/recipe-service.ts`.

Required functions:

- `listRecipes()`
- `getRecipeDetail(id)`
- `createRecipe(input)`
- `updateRecipe(id, input)`
- `softDeleteRecipe(id)`
- `restoreRecipe(id)`
- `searchRecipes(query)`

Service responsibilities:

- Generate IDs with `createId()` from `shared/lib/db.ts`.
- Generate timestamps with `createTimestamp()` from `shared/lib/db.ts`.
- Write parent and child rows transactionally.
- Preserve stable ordering for ingredients and steps.
- Never hard-delete user recipe data during normal flows.
- Exclude `isDeleted` recipes from normal list/search results.
- Validate member note IDs in the service layer against `FAMILY_MEMBERS`, even when input has already passed Zod validation.
- Return typed errors or throw clear errors for missing records; choose one consistent pattern.

### 3. Recipe Hooks

Create hooks under `modules/recipes/hooks/`.

Expected hooks:

- `useRecipes`
- `useRecipeDetail`
- `useRecipeForm`
- `useRecipeSearch`

Responsibilities:

- Own loading and error states.
- Call service functions only.
- Refresh local state after create/update/delete/restore.
- Keep UI components free from persistence details.

### 4. Recipe Components

Read `docs/UI_STYLE.md` before writing any component, page, or CSS for this section.

Create components under `modules/recipes/components/`.

Expected components:

- `RecipeCard`
- `RecipeForm`
- `RecipeDetail`
- `IngredientEditor`
- `StepEditor`
- `TagEditor`
- `MemberNotesEditor`

Create shared undo UI under `shared/components/`:

- `UndoBanner` or equivalent generic shared component

UI requirements:

- Use card surface `#FAF7F2`, border `#E2D9CC`, radius `10px`.
- Use `green-dark` for primary save actions.
- Use at most one accent color per screen.
- Keep mobile layout usable at 360px width.
- Use icons from `lucide-react` where helpful; no emoji.
- Provide empty, loading, and error states.

### 5. Pages

Replace placeholders with working pages:

- `/recipes`: list + search + link to create page
- `/recipes/new`: create form
- `/recipes/[id]`: detail/cooking view
- `/recipes/[id]/edit`: edit form

Navigation behavior:

- Create success routes to recipe detail.
- Edit success routes to recipe detail.
- Missing or deleted recipe detail shows a friendly not-found state with link back to recipes.
- Soft delete from detail or edit returns to list with a shared undo affordance.
- Undo affordance appears as a non-modal banner for 6 seconds.
- Undo is dismissed after timeout, when the user clicks dismiss, or when another recipe is deleted.
- Route navigation may clear the undo banner; persistence still remains soft-deleted unless undo is clicked.

### 6. Search

Implement search over a flattened recipe search document.

Suggested indexed fields:

- recipe name
- description
- source
- tags
- ingredient names
- ingredient notes
- step instructions
- member notes

Search behavior:

- Empty query returns non-deleted recipes sorted by updated date descending.
- Chinese queries match Chinese names, tags, ingredients, and notes.
- English queries match English content.
- Deleted recipes are excluded.
- Search results sort by Fuse score first, then `updatedAt` descending, then `name` ascending as a stable tiebreaker.

### 7. Manual Seed Helper

Add an optional dev-only script only if needed to create 20 sample recipes for manual testing.

Rules:

- Do not ship visible or hidden seed controls in the production UI.
- Prefer a plain TypeScript script under `scripts/` that calls recipe service functions.
- Do not add a seeding library.
- If the script requires a runner such as `tsx` or `ts-node` and it is not already installed, flag that dependency before installing it.
- Sample content may include Chinese text.
- Do not add permanent dependencies for seeding.

---

## Test Plan

Use focused tests where risk is highest. Full coverage is not required, but service, schema, and search behavior should be protected.

### Unit Tests

Dependency gates:

- If a test runner is not already installed, propose Vitest before installing it and explain that it is for Phase 2 unit tests.
- Dexie service tests in Node need an IndexedDB shim such as `fake-indexeddb`; if it is not already installed, flag it explicitly before installing.
- Browser tests may use existing Playwright if already installed. If Playwright is missing, flag it before installing.
- Do not add test dependencies silently.

Preferred unit test stack, if approved:

- Vitest for TypeScript unit tests
- fake-indexeddb for Dexie tests in Node
- Playwright only for browser checks that cannot be covered by unit tests

#### Schema Tests

File: `modules/recipes/schemas/recipe-form-schema.test.ts`

Cases:

- Accepts a valid Chinese recipe name and Chinese ingredient names.
- Rejects an empty or whitespace-only recipe name.
- Rejects `serves` less than 1.
- Rejects negative prep/cook minutes.
- Trims tags and removes duplicate tags.
- Keeps Chinese tags unchanged.
- Rejects member notes for unknown family member IDs.

#### Service Tests

File: `shared/lib/services/recipe-service.test.ts`

Use an isolated Dexie test database or a reset helper that clears recipe tables before each test.

Cases:

- Creates a recipe with ingredients, ordered steps, tags, and member notes.
- Persists all child rows with the generated recipe ID.
- Lists only non-deleted recipes.
- Sorts list results by `updatedAt` descending.
- Gets a full recipe detail by ID.
- Updates parent fields and replaces ingredient/step/member-note children correctly.
- Preserves ingredient `sortOrder` and step `stepNumber`.
- Soft deletes a recipe without removing child rows.
- Restores a soft-deleted recipe.
- Throws or returns a typed not-found error for a missing recipe.
- Rejects a create/update payload containing a member note for an unknown `familyMemberId`, even if called directly without the form.

#### Search Tests

File: `modules/recipes/hooks/useRecipeSearch.test.ts` or `shared/lib/services/recipe-search.test.ts`

Cases:

- Empty query returns all non-deleted recipes.
- Query `豆腐` finds a recipe with tofu in name or ingredients.
- Query `快手` finds a recipe with that Chinese tag.
- Query `scallion` finds English ingredient text.
- Query matching member note text returns the recipe.
- Deleted recipes are not returned.
- Equal-score results use `updatedAt` descending, then `name` ascending as a stable tiebreaker.

### Browser / Integration Tests

Use Playwright only if browser checks are automated. Existing `scripts/verify-dexie.mjs` can be extended or copied for lightweight verification.

Cases:

- `/recipes` loads without console errors.
- Empty recipe list state renders.
- Create recipe flow works on desktop viewport.
- Create recipe flow works on mobile viewport width 390.
- Created Chinese recipe appears in list and detail view.
- Edit flow changes recipe name, ingredients, and steps.
- Search field filters for a Chinese query.
- Soft delete removes recipe from normal list.
- Undo restores recipe to list.
- Reload page after create; recipe data remains in IndexedDB.

### Manual Acceptance Tests

Run before marking Phase 2 complete:

- Create 20 recipes, including at least 8 with Chinese names and Chinese ingredients.
- Search by Chinese name, Chinese ingredient, Chinese tag, English ingredient, and source.
- Open a recipe detail on mobile and confirm the cooking view is readable.
- Edit a recipe with multiple ingredients and ordered steps.
- Add per-person notes for Nora and Freddie.
- Soft-delete a recipe, undo it, then confirm it appears again.
- Soft-delete a recipe, reload, and confirm it remains hidden.
- Confirm browser console has no Dexie errors.
- Confirm no component imports Dexie directly.

Suggested direct-import audit:

```powershell
Get-ChildItem -Recurse -Include *.ts,*.tsx -Path app,modules,shared |
  Select-String -Pattern 'from "dexie"|from ''dexie'''
```

Only `shared/lib/db.ts` should match.

---

## Completion Checklist

- [x] Zod recipe schemas implemented
- [x] Recipe service implemented
- [x] Recipe hooks implemented
- [x] Recipe list page implemented
- [x] Recipe create/edit form implemented
- [x] Recipe detail page implemented
- [x] Fuse search implemented and verified with Chinese text
- [x] Soft delete and undo implemented
- [x] Shared undo banner used for soft-delete undo
- [x] Unit tests added for schemas, services, and search
- [x] Browser tests completed on desktop and mobile widths
- [x] Manual dev acceptance completed
- [x] `npm run lint` passes
- [x] `npm run build` passes
- [x] No direct Dexie imports outside `shared/lib/db.ts`
