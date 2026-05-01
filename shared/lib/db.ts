import Dexie, { type EntityTable } from "dexie"

import {
  DB_NAME,
  DB_STORES,
  DB_VERSION,
  type ActualServing,
  type MealLog,
  type MealPlan,
  type MealPlanSlot,
  type PantrySeasoning,
  type PlannedServing,
  type PreferenceRecord,
  type Recipe,
  type RecipeIngredient,
  type RecipeMemberNote,
  type RecipeStep,
  type ShoppingList,
  type ShoppingListItem,
  type ShoppingPreference,
} from "@/shared/lib/db-schema"

export type DietAppDb = Dexie & {
  recipes: EntityTable<Recipe, "id">
  recipeIngredients: EntityTable<RecipeIngredient, "id">
  recipeSteps: EntityTable<RecipeStep, "id">
  recipeMemberNotes: EntityTable<RecipeMemberNote, "id">
  mealPlans: EntityTable<MealPlan, "id">
  mealPlanSlots: EntityTable<MealPlanSlot, "id">
  plannedServings: EntityTable<PlannedServing, "id">
  pantrySeasonings: EntityTable<PantrySeasoning, "id">
  shoppingPreferences: EntityTable<ShoppingPreference, "id">
  shoppingLists: EntityTable<ShoppingList, "id">
  shoppingListItems: EntityTable<ShoppingListItem, "id">
  mealLogs: EntityTable<MealLog, "id">
  actualServings: EntityTable<ActualServing, "id">
  preferenceRecords: EntityTable<PreferenceRecord, "id">
}

export const db = new Dexie(DB_NAME) as DietAppDb

db.version(DB_VERSION).stores(DB_STORES)

export async function initializeDb(): Promise<void> {
  if (!db.isOpen()) {
    await db.open()
  }
}

export function createId(): string {
  return crypto.randomUUID()
}

export function createTimestamp(): string {
  return new Date().toISOString()
}
