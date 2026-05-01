export type FamilyMemberId = "chengyuan" | "fu" | "nora" | "freddie"

export type MealTime = "breakfast" | "lunch" | "dinner" | "snack"

export type StoreId =
  | "costco"
  | "wholefoods"
  | "chinese_grocery"
  | "any"
  | "unassigned"

export type AteStatus = "ate" | "partial" | "rejected"

export interface TimestampedRecord {
  createdAt: string
  updatedAt: string
}

export interface Recipe extends TimestampedRecord {
  id: string
  name: string
  description?: string
  serves: number
  prepMinutes?: number
  cookMinutes?: number
  source?: string
  tags: string[]
  isDeleted: boolean
}

export interface RecipeIngredient {
  id: string
  recipeId: string
  name: string
  quantity?: number
  unit?: string
  notes?: string
  sortOrder: number
}

export interface RecipeStep {
  id: string
  recipeId: string
  stepNumber: number
  instruction: string
}

export interface RecipeMemberNote {
  id: string
  recipeId: string
  familyMemberId: FamilyMemberId
  notes: string
}

export interface MealPlan extends TimestampedRecord {
  id: string
  weekStart: string
  notes?: string
  isDeleted: boolean
}

export interface MealPlanSlot {
  id: string
  mealPlanId: string
  dayOfWeek: number
  mealTime: MealTime
  recipeId?: string
  freeText?: string
}

export interface PlannedServing {
  id: string
  mealPlanSlotId: string
  familyMemberId: FamilyMemberId
  included: boolean
  portionNotes?: string
}

export interface PantrySeasoning extends TimestampedRecord {
  id: string
  name: string
  isLow: boolean
  sortOrder: number
  notes?: string
}

export interface ShoppingPreference extends TimestampedRecord {
  id: string
  ingredientName: string
  preferredStore: Exclude<StoreId, "unassigned">
  notes?: string
  confirmed: boolean
}

export interface ShoppingList extends TimestampedRecord {
  id: string
  mealPlanId?: string
  notes?: string
  isDeleted: boolean
}

export interface ShoppingListItem {
  id: string
  shoppingListId: string
  ingredientName: string
  quantity?: number
  unit?: string
  store: StoreId
  storeConfirmed: boolean
  isChecked: boolean
  isManualAdd: boolean
}

export interface MealLog extends TimestampedRecord {
  id: string
  logDate: string
  mealTime: MealTime
  recipeId?: string
  freeText?: string
  notes?: string
  isDeleted: boolean
}

export interface ActualServing {
  id: string
  mealLogId: string
  familyMemberId: FamilyMemberId
  ateStatus: AteStatus
  satisfaction?: number
  notes?: string
}

export interface PreferenceRecord {
  id: string
  familyMemberId: FamilyMemberId
  recipeId: string
  avgSatisfaction?: number
  timesEaten: number
  timesRejected: number
  manualOverride: boolean
  overrideNotes?: string
  lastEaten?: string
  updatedAt: string
}

export interface DietAppTables {
  recipes: Recipe
  recipeIngredients: RecipeIngredient
  recipeSteps: RecipeStep
  recipeMemberNotes: RecipeMemberNote
  mealPlans: MealPlan
  mealPlanSlots: MealPlanSlot
  plannedServings: PlannedServing
  pantrySeasonings: PantrySeasoning
  shoppingPreferences: ShoppingPreference
  shoppingLists: ShoppingList
  shoppingListItems: ShoppingListItem
  mealLogs: MealLog
  actualServings: ActualServing
  preferenceRecords: PreferenceRecord
}

export const DB_NAME = "dietapp"

export const DB_VERSION = 2

export const DB_STORES = {
  recipes: "&id, name, isDeleted, updatedAt",
  recipeIngredients: "&id, recipeId",
  recipeSteps: "&id, recipeId",
  recipeMemberNotes: "&id, recipeId, familyMemberId",
  mealPlans: "&id, weekStart, isDeleted, updatedAt",
  mealPlanSlots: "&id, mealPlanId, dayOfWeek, mealTime",
  plannedServings: "&id, mealPlanSlotId, familyMemberId",
  pantrySeasonings: "&id, isLow, sortOrder, updatedAt",
  shoppingPreferences: "&id, ingredientName, preferredStore, confirmed",
  shoppingLists: "&id, mealPlanId, isDeleted, updatedAt",
  shoppingListItems: "&id, shoppingListId, store, isChecked",
  mealLogs: "&id, logDate, mealTime, isDeleted, updatedAt",
  actualServings: "&id, mealLogId, familyMemberId, ateStatus",
  preferenceRecords: "&id, [familyMemberId+recipeId], familyMemberId, recipeId",
} as const
