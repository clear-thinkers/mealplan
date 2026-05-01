import { beforeEach, describe, expect, it } from "vitest"

import type { RecipeFormData } from "@/modules/recipes/schemas/recipe-form-schema"
import { db, initializeDb } from "@/shared/lib/db"
import {
  clearSlot,
  copyPreviousWeek,
  getOrCreateMealPlanForWeek,
  getWeekStart,
  MealPlanOverwriteError,
  updatePlannedServings,
  updateSlotFreeText,
  updateSlotRecipe,
} from "@/shared/lib/services/meal-plan-service"
import { createRecipe } from "@/shared/lib/services/recipe-service"

const recipeInput: RecipeFormData = {
  name: "Scallion noodles",
  description: "Fast noodles",
  serves: 4,
  prepMinutes: 5,
  cookMinutes: 10,
  source: "family",
  tags: ["quick"],
  ingredients: [{ name: "noodles", quantity: 200, unit: "g", notes: undefined }],
  steps: [{ instruction: "Cook noodles." }],
  memberNotes: [],
}

async function clearTables() {
  await initializeDb()
  await db.transaction(
    "rw",
    [
      db.plannedServings,
      db.mealPlanSlots,
      db.mealPlans,
      db.recipeMemberNotes,
      db.recipeSteps,
      db.recipeIngredients,
      db.recipes,
    ],
    async () => {
      await db.plannedServings.clear()
      await db.mealPlanSlots.clear()
      await db.mealPlans.clear()
      await db.recipeMemberNotes.clear()
      await db.recipeSteps.clear()
      await db.recipeIngredients.clear()
      await db.recipes.clear()
    }
  )
}

describe("meal plan service", () => {
  beforeEach(async () => {
    await clearTables()
  })

  it("creates a meal plan with 28 blank slots for a new week", async () => {
    const plan = await getOrCreateMealPlanForWeek("2026-05-04")

    expect(plan.weekStart).toBe("2026-05-04")
    expect(plan.slots).toHaveLength(28)
    expect(plan.slots.every((slot) => !slot.recipeId && !slot.freeText)).toBe(true)
  })

  it("returns an existing plan without creating duplicate slots", async () => {
    const first = await getOrCreateMealPlanForWeek("2026-05-04")
    const second = await getOrCreateMealPlanForWeek("2026-05-04")

    expect(second.id).toBe(first.id)
    expect(await db.mealPlanSlots.where("mealPlanId").equals(first.id).count()).toBe(28)
  })

  it("assigns a recipe and creates four included servings", async () => {
    const recipe = await createRecipe(recipeInput)
    const plan = await getOrCreateMealPlanForWeek("2026-05-04")
    const slot = plan.slots[0]

    await updateSlotRecipe(slot.id, recipe.id)

    const servings = await db.plannedServings
      .where("mealPlanSlotId")
      .equals(slot.id)
      .toArray()

    expect((await db.mealPlanSlots.get(slot.id))?.recipeId).toBe(recipe.id)
    expect(servings).toHaveLength(4)
    expect(servings.every((serving) => serving.included)).toBe(true)
  })

  it("clears a slot assignment and its servings", async () => {
    const recipe = await createRecipe(recipeInput)
    const plan = await getOrCreateMealPlanForWeek("2026-05-04")
    const slot = plan.slots[0]

    await updateSlotRecipe(slot.id, recipe.id)
    await clearSlot(slot.id)

    const updatedSlot = await db.mealPlanSlots.get(slot.id)
    const servingCount = await db.plannedServings
      .where("mealPlanSlotId")
      .equals(slot.id)
      .count()

    expect(updatedSlot?.recipeId).toBeUndefined()
    expect(updatedSlot?.freeText).toBeUndefined()
    expect(servingCount).toBe(0)
  })

  it("replaces planned servings without leaving old rows", async () => {
    const recipe = await createRecipe(recipeInput)
    const plan = await getOrCreateMealPlanForWeek("2026-05-04")
    const slot = plan.slots[0]

    await updateSlotRecipe(slot.id, recipe.id)
    await updatePlannedServings(slot.id, [
      { familyMemberId: "chengyuan", included: true, portionNotes: "extra" },
      { familyMemberId: "fu", included: false },
    ])

    const servings = await db.plannedServings
      .where("mealPlanSlotId")
      .equals(slot.id)
      .toArray()

    expect(servings).toHaveLength(2)
    expect(servings.map((serving) => serving.familyMemberId).sort()).toEqual([
      "chengyuan",
      "fu",
    ])
    expect(servings.find((serving) => serving.familyMemberId === "chengyuan")?.portionNotes).toBe(
      "extra"
    )
  })

  it("copies non-empty previous week slots and servings", async () => {
    const recipe = await createRecipe(recipeInput)
    const previous = await getOrCreateMealPlanForWeek("2026-04-27")
    const sourceSlot = previous.slots.find(
      (slot) => slot.dayOfWeek === 0 && slot.mealTime === "dinner"
    )

    expect(sourceSlot).toBeTruthy()
    await updateSlotRecipe(sourceSlot!.id, recipe.id)
    await updatePlannedServings(sourceSlot!.id, [
      { familyMemberId: "chengyuan", included: true, portionNotes: "large" },
      { familyMemberId: "fu", included: true },
      { familyMemberId: "nora", included: false },
      { familyMemberId: "freddie", included: true, portionNotes: "small" },
    ])

    const copied = await copyPreviousWeek("2026-05-04")
    const targetSlot = copied.slots.find(
      (slot) => slot.dayOfWeek === 0 && slot.mealTime === "dinner"
    )

    expect(targetSlot?.recipeId).toBe(recipe.id)
    expect(targetSlot?.servings).toHaveLength(4)
    expect(
      targetSlot?.servings.find((serving) => serving.familyMemberId === "freddie")
        ?.portionNotes
    ).toBe("small")
  })

  it("does not overwrite filled current week slots without confirmation", async () => {
    const recipe = await createRecipe(recipeInput)
    const current = await getOrCreateMealPlanForWeek("2026-05-04")

    await updateSlotFreeText(current.slots[0].id, "Eating out")

    await expect(copyPreviousWeek("2026-05-04")).rejects.toBeInstanceOf(
      MealPlanOverwriteError
    )

    await updateSlotRecipe(current.slots[1].id, recipe.id)
    await expect(copyPreviousWeek("2026-05-04", { overwrite: true })).resolves.toBeTruthy()
  })

  it("gets Monday week starts for weekday, weekend, Monday, and Sunday boundaries", () => {
    expect(getWeekStart(new Date(2026, 4, 6))).toBe("2026-05-04")
    expect(getWeekStart(new Date(2026, 4, 9))).toBe("2026-05-04")
    expect(getWeekStart(new Date(2026, 4, 4))).toBe("2026-05-04")
    expect(getWeekStart(new Date(2026, 4, 10))).toBe("2026-05-04")
  })
})
