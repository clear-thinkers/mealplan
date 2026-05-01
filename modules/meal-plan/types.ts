import type {
  FamilyMemberId,
  MealTime,
  MealPlan,
  MealPlanSlot,
  PlannedServing,
  Recipe,
} from "@/shared/lib/db-schema"

export type {
  FamilyMemberId,
  MealTime,
  MealPlan,
  MealPlanSlot,
  PlannedServing,
}

export type SlotDetail = MealPlanSlot & {
  recipe: Pick<Recipe, "id" | "name" | "serves"> | null
  servings: PlannedServing[]
}

export type MealPlanDetail = MealPlan & {
  slots: SlotDetail[]
}

export type MealPlanSummary = MealPlan & {
  filledSlotCount: number
}
