# Phase 3 Implementation Plan - Meal Planning
> Build after Phase 2 recipe library. Follow `AGENT_RULES.md`, `ARCH.md`, `ROADMAP.md`, `docs/UI_STYLE.md`.

---

## Goal

Implement a weekly meal planning grid backed by Dexie through `shared/lib/db.ts`. The family can plan a full week of meals per person, navigate between weeks, and copy a prior week as a starting draft.

Phase 3 is complete when any week can be planned with recipe assignments, per-person serving flags, and free-text slots, and the user can navigate to any week by date.

---

## Preflight Instructions

Before writing Phase 3 code:

- Read `AGENT_RULES.md`, `ARCH.md`, `ROADMAP.md`, and `docs/UI_STYLE.md`.
- Scan `docs/adr/` and treat accepted ADR decisions as settled.
- Confirm `shared/lib/db.ts` remains the only file that imports Dexie.
- Confirm `shared/lib/services/recipe-service.ts` exists and is functional before depending on it.
- Confirm whether any proposed dependency is already installed before adding it.

---

## Scope

### In Scope

- Weekly grid at `/meal-plan` (current week) and `/meal-plan/[date]` (specific week)
- Grid layout: 4 meal-time rows × 7 day columns (Monday through Sunday)
- Assign a recipe or free text to any slot
- Per-person serving assignments with optional portion notes per slot
- Week navigation: previous week, next week, today
- Copy previous week's plan as a draft for the current week
- Empty slot state, filled recipe state, free-text state per cell

### Out of Scope

- Shopping list generation from the meal plan (Phase 4)
- Meal logging (Phase 5)
- AI meal plan suggestions (Phase 8)
- Photo or attachment support
- Per-slot notes beyond `freeText` and `portionNotes`

---

## Architecture Rules

- Components and hooks must not import Dexie.
- Components and hooks must not import `shared/lib/db-schema.ts` directly; import types from `modules/meal-plan/types.ts` or infer them from Zod schemas.
- All persistence goes through `shared/lib/services/meal-plan-service.ts`.
- The service may call `shared/lib/services/recipe-service.ts` for recipe name lookups. No other cross-service imports.
- Do not add a repository layer. The only permitted persistence path is component/hook → `shared/lib/services/meal-plan-service.ts` → `shared/lib/db.ts`.
- UI must use tokens from `docs/UI_STYLE.md`; no white app background, no gradients, no card shadows.
- Family member IDs must come from `FAMILY_MEMBERS` in `shared/lib/constants.ts`; never hardcode them as strings in components.

---

## Data Model

Use existing Dexie tables. No schema changes are expected for Phase 3.

- `mealPlans`
- `mealPlanSlots`
- `plannedServings`

Read access to `recipes` (name and serves only) is permitted via the recipe service.

### Slot initialization strategy

When a `MealPlan` is created for a given week, immediately create all 28 `MealPlanSlot` rows (7 days × 4 meal times). Empty slots have `recipeId` and `freeText` both undefined. This keeps grid rendering trivial — every cell always has a corresponding slot row.

### Serving initialization strategy

When a recipe is assigned to a slot, immediately create 4 `PlannedServing` rows (one per family member, all `included: true`). This is the "shared base" default. Users untoggle members or add portion notes as exceptions. When a slot is cleared, delete its `PlannedServing` rows.

### Slot key convention

Use `${dayOfWeek}-${mealTime}` as a lookup key within a plan (e.g. `"2-dinner"`) for O(1) grid cell mapping. This is a runtime convention, not stored in the database.

If a schema mismatch is discovered during implementation, stop and flag it before changing the schema.

---

## Implementation Order

### 1. Types

Create `modules/meal-plan/types.ts`.

Required types:

- `SlotDetail`: `MealPlanSlot` extended with `recipe: Pick<Recipe, 'id' | 'name' | 'serves'> | null` and `servings: PlannedServing[]`
- `MealPlanDetail`: `MealPlan` extended with `slots: SlotDetail[]`
- `MealPlanSummary`: `MealPlan` extended with `filledSlotCount: number` (for future dashboard widget use)

### 2. Meal Plan Service

Create `shared/lib/services/meal-plan-service.ts`.

Required functions:

- `getOrCreateMealPlanForWeek(weekStart: string)` — primary entry point; loads plan by `weekStart`, or creates a `MealPlan` plus all 28 blank `MealPlanSlot` rows; returns `MealPlanDetail`
- `getMealPlanDetail(mealPlanId: string)` — loads a plan with all slots, their recipe names, and their `PlannedServing` rows; returns `MealPlanDetail | null`
- `updateSlotRecipe(slotId: string, recipeId: string)` — assigns a recipe to a slot; upserts 4 `PlannedServing` rows (all included); transactional
- `updateSlotFreeText(slotId: string, freeText: string)` — assigns free text to a slot; clears `recipeId`; no servings created
- `updatePlannedServings(slotId: string, servings: Array<{ familyMemberId: FamilyMemberId; included: boolean; portionNotes?: string }>)` — bulk-replaces servings for a slot; deletes existing rows and bulk-adds new ones; transactional
- `clearSlot(slotId: string)` — removes `recipeId`, `freeText`, and all `PlannedServing` rows for the slot; transactional
- `copyPreviousWeek(currentWeekStart: string)` — computes the prior Monday; loads that plan if it exists; creates the current week plan; copies all non-empty slot assignments and their servings; returns `MealPlanDetail`; transactional
- `getWeekStart(date: Date)` — utility: returns the ISO date string of the Monday of the given date's week

Service responsibilities:

- Generate IDs with `createId()` from `shared/lib/db.ts`.
- Generate timestamps with `createTimestamp()` from `shared/lib/db.ts`.
- Never hard-delete `MealPlan`, `MealPlanSlot`, or `PlannedServing` data outside of `clearSlot` and `updatePlannedServings`.
- `copyPreviousWeek` must not overwrite a current week plan that already has filled slots without warning; throw a typed error that the caller can surface as a confirmation prompt.

### 3. Hooks

Create hooks under `modules/meal-plan/hooks/`.

**`useMealPlan(weekStart: string)`**

- Owns `plan`, `isLoading`, and `error` state.
- Calls `getOrCreateMealPlanForWeek` on mount and when `weekStart` changes.
- Exposes:
  - `updateSlotRecipe(slotId, recipeId)`
  - `updateSlotFreeText(slotId, freeText)`
  - `updateServings(slotId, servings)`
  - `clearSlot(slotId)`
  - `copyPreviousWeek()` — surfaces the confirmation error from the service as a boolean `confirmOverwrite` state before retrying
- Calls `refresh()` after each mutation.

**`useWeekNavigation(weekStart: string)`**

- Pure computation, no async.
- Returns `prevWeekStart`, `nextWeekStart`, `weekLabel`, and `isCurrentWeek`.
- `weekLabel` format: `"May 5 – 11, 2026"` derived from `weekStart`.
- `isCurrentWeek` is `true` when `weekStart` matches the Monday of today's date.

### 4. Components

Read `docs/UI_STYLE.md` before writing any component, page, or CSS for this section.

Create components under `modules/meal-plan/components/`.

**`WeekNavBar`**

Props: `weekLabel`, `isCurrentWeek`, `onPrev`, `onNext`, `onCopyLastWeek`, `isCopying`.

- Left and right arrow buttons for week navigation.
- Week label centered between arrows.
- "Today" chip shown only when `isCurrentWeek` is false; clicking it routes to the current week.
- "Copy last week" button; shows a spinner while `isCopying` is true.
- If the previous week has no plan, "Copy last week" is disabled with a muted label.

**`SlotCell`**

Props: `slot: SlotDetail`, `onClick: () => void`.

Three visual states:

- Empty: dashed or muted border, `+` icon, `bg-cream`.
- Recipe: recipe name (single-line truncated), row of `included` member avatar chips below.
- Free text: italic truncated text, no member chips.

Tap target must be at least 44px tall for mobile usability.

**`RecipePicker`**

Props: `selectedId: string | undefined`, `onSelectRecipe: (recipeId: string) => void`, `onSelectFreeText: (text: string) => void`, `onClear: () => void`.

- Debounced search input; reuse the debounce pattern from `useRecipeSearch`.
- Scrollable recipe list; each row shows recipe name and serves count.
- "Free text / eating out" option pinned above the list as a distinct row that opens a text input.
- "Clear slot" option shown only when the slot is currently filled.

**`MemberServingRow`**

Props: `member`, `serving: PlannedServing | undefined`, `onChange: (included: boolean, portionNotes: string | undefined) => void`.

- Member avatar chip and name.
- Included toggle (on/off).
- Portion notes textarea shown only when `included` is true.
- Disabled appearance when `included` is false.

**`SlotEditor`**

Rendered as a shadcn `Sheet` (bottom drawer on mobile, right side on desktop).

- Header: day name and meal time label (e.g., `"Wednesday · Dinner"`).
- `RecipePicker` section.
- Member servings section (shown only when a recipe is selected); one `MemberServingRow` per family member.
- Local state mirrors the current slot values; changes are committed only on save.
- Footer: Save and Clear buttons.
- Save button is disabled when nothing has changed.

**`WeekGrid`**

Props: `plan: MealPlanDetail`, `onSlotClick: (slot: SlotDetail) => void`.

- Sticky left column for meal-time row labels.
- Top row for day and date column headers (e.g., `Mon 5`, `Tue 6`).
- 4 × 7 grid of `SlotCell` components.
- On mobile: horizontal scroll wrapper (`overflow-x-auto`), minimum column width `120px`.
- Slot lookup via `buildSlotKey(dayOfWeek, mealTime)` against a map built from `plan.slots`.
- Does not manage `SlotEditor` state itself; delegates click events up to the page.

UI requirements across all components:

- Use card surface `#FAF7F2`, border `#E2D9CC`, radius `10px` for panels.
- Use `green-dark` for primary save actions.
- Member avatar colors from `FAMILY_MEMBERS[*].color`; do not derive or override them.
- Use at most one accent color per screen.
- Keep mobile layout usable at 360px width.
- Use icons from `lucide-react`; no emoji.
- Provide loading and error states where applicable.

### 5. Pages

Replace placeholders with working pages.

**`app/(app)/meal-plan/page.tsx`**

- Compute the Monday of today's date using `getWeekStart(new Date())`.
- Redirect immediately to `/meal-plan/[weekStart]` via `useRouter().replace()`.
- Render a minimal loading state while the redirect fires.

**`app/(app)/meal-plan/[date]/page.tsx`**

- Parse `params.date` as an ISO date string.
- Validate it is a Monday; if not, redirect to the nearest Monday.
- Render `WeekNavBar` and `WeekGrid` wired to `useMealPlan(params.date)` and `useWeekNavigation(params.date)`.
- Manage `selectedSlot` state; pass it to `SlotEditor` when non-null.
- Week navigation calls `router.push('/meal-plan/[prevWeekStart or nextWeekStart]')`.
- On `copyPreviousWeek` confirmation error, render an inline confirmation prompt before retrying with `confirmOverwrite`.

---

## Test Plan

Use focused tests where risk is highest. Full coverage is not required, but service logic and week-boundary math should be protected.

### Unit Tests

Dependency gates:

- Confirm Vitest is installed before writing tests. If not, propose it before installing.
- Confirm `fake-indexeddb` is installed before writing Dexie service tests in Node. If not, flag it before installing.
- Do not add test dependencies silently.

#### Service Tests

File: `shared/lib/services/meal-plan-service.test.ts`

Use an isolated Dexie test database or a reset helper that clears meal plan tables before each test.

Cases:

- `getOrCreateMealPlanForWeek` creates a `MealPlan` and exactly 28 `MealPlanSlot` rows for a new week.
- `getOrCreateMealPlanForWeek` returns the existing plan without creating duplicates when called twice for the same week.
- `updateSlotRecipe` creates 4 `PlannedServing` rows (all `included: true`) when a recipe is assigned.
- `clearSlot` removes `recipeId`, `freeText`, and all `PlannedServing` rows.
- `updatePlannedServings` replaces existing servings without leaving orphaned rows.
- `copyPreviousWeek` copies non-empty slot assignments and their servings to the new week.
- `copyPreviousWeek` does not overwrite a current week plan that already has filled slots; it throws the expected typed error.
- `getWeekStart` returns the Monday of the given date for midweek, weekend, and Monday inputs.
- `getWeekStart` handles the Sunday-to-Monday boundary correctly.

#### Hook Tests

File: `modules/meal-plan/hooks/useWeekNavigation.test.ts`

Cases:

- `prevWeekStart` is 7 days before the given `weekStart`.
- `nextWeekStart` is 7 days after the given `weekStart`.
- `isCurrentWeek` is true when `weekStart` matches the Monday of today.
- `isCurrentWeek` is false for any other week.
- `weekLabel` formats the date range correctly, including month boundaries (e.g., `"Apr 27 – May 3, 2026"`).

### Browser / Integration Tests

Use Playwright only if browser checks are automated. If Playwright is missing, flag it before installing.

Cases:

- `/meal-plan` redirects to the current week URL without error.
- All 28 grid cells render on desktop and mobile viewports.
- Clicking an empty cell opens `SlotEditor`.
- Assigning a recipe to a slot and saving shows the recipe name in the cell.
- Assigned member avatar chips reflect `included` state.
- Clearing a slot returns it to the empty state.
- Previous and next week navigation changes the week label and clears slot state.
- Copy last week button is disabled when no prior plan exists.

### Manual Acceptance Tests

Run before marking Phase 3 complete:

- Open `/meal-plan`; confirm it redirects to the current week and all 28 cells are visible.
- Assign a recipe to Monday dinner; confirm the recipe name and all 4 member chips appear.
- Untoggle one family member and add a portion note; save; reopen the slot and confirm the state persisted.
- Assign free text to a slot; confirm italic display with no member chips.
- Clear a slot; confirm it returns to the empty `+` state.
- Navigate to the previous week; confirm a blank grid; navigate back.
- Copy the previous week (after adding at least one recipe); confirm slot assignments carry over.
- Attempt to copy a prior week when the current week already has assignments; confirm the confirmation prompt appears.
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

- [ ] `modules/meal-plan/types.ts` created
- [ ] `shared/lib/services/meal-plan-service.ts` created
- [ ] `useMealPlan` hook created
- [ ] `useWeekNavigation` hook created
- [ ] `WeekNavBar` component created
- [ ] `WeekGrid` component created
- [ ] `SlotCell` component created
- [ ] `SlotEditor` component created
- [ ] `RecipePicker` component created
- [ ] `MemberServingRow` component created
- [ ] `/meal-plan` redirect page implemented
- [ ] `/meal-plan/[date]` week view page implemented
- [ ] Unit tests added for service functions and `useWeekNavigation`
- [ ] Browser tests completed on desktop and mobile widths
- [ ] Manual dev acceptance completed
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] No direct Dexie imports outside `shared/lib/db.ts`
