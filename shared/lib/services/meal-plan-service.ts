import type { MealPlanDetail, SlotDetail } from "@/modules/meal-plan/types"
import { FAMILY_MEMBERS, MEAL_TIMES } from "@/shared/lib/constants"
import { createId, createTimestamp, db } from "@/shared/lib/db"
import type {
  FamilyMemberId,
  MealPlan,
  MealPlanSlot,
  PlannedServing,
  Recipe,
} from "@/shared/lib/db-schema"

type PlannedServingInput = {
  familyMemberId: FamilyMemberId
  included: boolean
  portionNotes?: string
}

type CopyPreviousWeekOptions = {
  overwrite?: boolean
}

export class MealPlanOverwriteError extends Error {
  constructor() {
    super("Current week already has planned meals.")
    this.name = "MealPlanOverwriteError"
  }
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function parseIsoDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number)

  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

function createBlankSlots(mealPlanId: string): MealPlanSlot[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) =>
    MEAL_TIMES.map((mealTime) => ({
      id: createId(),
      mealPlanId,
      dayOfWeek,
      mealTime,
    }))
  ).flat()
}

function createDefaultServings(slotId: string): PlannedServing[] {
  return FAMILY_MEMBERS.map((member) => ({
    id: createId(),
    mealPlanSlotId: slotId,
    familyMemberId: member.id,
    included: true,
  }))
}

function toPlannedServings(
  slotId: string,
  servings: PlannedServingInput[]
): PlannedServing[] {
  return servings.map((serving) => ({
    id: createId(),
    mealPlanSlotId: slotId,
    familyMemberId: serving.familyMemberId,
    included: serving.included,
    portionNotes: serving.portionNotes?.trim() || undefined,
  }))
}

function isFilledSlot(slot: MealPlanSlot): boolean {
  return Boolean(slot.recipeId || slot.freeText?.trim())
}

export function getWeekStart(date: Date): string {
  const day = date.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  monday.setDate(monday.getDate() + mondayOffset)

  return toIsoDate(monday)
}

export async function getMealPlanDetail(
  mealPlanId: string
): Promise<MealPlanDetail | null> {
  const plan = await db.mealPlans.get(mealPlanId)

  if (!plan || plan.isDeleted) {
    return null
  }

  const slots = await db.mealPlanSlots.where("mealPlanId").equals(mealPlanId).toArray()
  const recipeIds = Array.from(
    new Set(slots.map((slot) => slot.recipeId).filter(Boolean) as string[])
  )
  const [recipes, servings] = await Promise.all([
    recipeIds.length > 0 ? db.recipes.bulkGet(recipeIds) : Promise.resolve([]),
    db.plannedServings
      .where("mealPlanSlotId")
      .anyOf(slots.map((slot) => slot.id))
      .toArray(),
  ])
  const recipeById = new Map<string, Recipe>()

  for (const recipe of recipes) {
    if (recipe && !recipe.isDeleted) {
      recipeById.set(recipe.id, recipe)
    }
  }
  const servingsBySlotId = new Map<string, PlannedServing[]>()

  for (const serving of servings) {
    const existing = servingsBySlotId.get(serving.mealPlanSlotId) ?? []
    existing.push(serving)
    servingsBySlotId.set(serving.mealPlanSlotId, existing)
  }

  return {
    ...plan,
    slots: slots
      .map<SlotDetail>((slot) => {
        const recipe = slot.recipeId ? recipeById.get(slot.recipeId) : undefined

        return {
          ...slot,
          recipe: recipe
            ? { id: recipe.id, name: recipe.name, serves: recipe.serves }
            : null,
          servings: (servingsBySlotId.get(slot.id) ?? []).sort((a, b) =>
            a.familyMemberId.localeCompare(b.familyMemberId)
          ),
        }
      })
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.mealTime.localeCompare(b.mealTime)),
  }
}

export async function getOrCreateMealPlanForWeek(
  weekStart: string
): Promise<MealPlanDetail> {
  const existing = await db.mealPlans
    .where("weekStart")
    .equals(weekStart)
    .and((plan) => !plan.isDeleted)
    .first()

  if (existing) {
    const detail = await getMealPlanDetail(existing.id)

    if (!detail) {
      throw new Error("Meal plan could not be loaded.")
    }

    return detail
  }

  const timestamp = createTimestamp()
  const plan: MealPlan = {
    id: createId(),
    weekStart,
    isDeleted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  const slots = createBlankSlots(plan.id)

  await db.transaction("rw", db.mealPlans, db.mealPlanSlots, async () => {
    await db.mealPlans.add(plan)
    await db.mealPlanSlots.bulkAdd(slots)
  })

  return {
    ...plan,
    slots: slots.map((slot) => ({ ...slot, recipe: null, servings: [] })),
  }
}

export async function hasFilledMealPlanForWeek(weekStart: string): Promise<boolean> {
  const plan = await db.mealPlans
    .where("weekStart")
    .equals(weekStart)
    .and((item) => !item.isDeleted)
    .first()

  if (!plan) {
    return false
  }

  const slots = await db.mealPlanSlots.where("mealPlanId").equals(plan.id).toArray()

  return slots.some(isFilledSlot)
}

export async function updateSlotRecipe(
  slotId: string,
  recipeId: string
): Promise<void> {
  const timestamp = createTimestamp()

  await db.transaction(
    "rw",
    db.mealPlans,
    db.mealPlanSlots,
    db.plannedServings,
    async () => {
      const slot = await db.mealPlanSlots.get(slotId)

      if (!slot) {
        throw new Error("Meal plan slot not found.")
      }

      const existingServings = await db.plannedServings
        .where("mealPlanSlotId")
        .equals(slotId)
        .toArray()

      await db.mealPlanSlots.put({
        ...slot,
        recipeId,
        freeText: undefined,
      })
      await db.plannedServings.bulkDelete(existingServings.map((serving) => serving.id))
      await db.plannedServings.bulkAdd(createDefaultServings(slotId))
      await db.mealPlans.update(slot.mealPlanId, { updatedAt: timestamp })
    }
  )
}

export async function updateSlotFreeText(
  slotId: string,
  freeText: string
): Promise<void> {
  const timestamp = createTimestamp()

  await db.transaction("rw", db.mealPlans, db.mealPlanSlots, db.plannedServings, async () => {
    const slot = await db.mealPlanSlots.get(slotId)

    if (!slot) {
      throw new Error("Meal plan slot not found.")
    }

    const existingServings = await db.plannedServings
      .where("mealPlanSlotId")
      .equals(slotId)
      .toArray()

    await db.mealPlanSlots.put({
      ...slot,
      recipeId: undefined,
      freeText: freeText.trim(),
    })
    await db.plannedServings.bulkDelete(existingServings.map((serving) => serving.id))
    await db.mealPlans.update(slot.mealPlanId, { updatedAt: timestamp })
  })
}

export async function updatePlannedServings(
  slotId: string,
  servings: PlannedServingInput[]
): Promise<void> {
  const timestamp = createTimestamp()

  await db.transaction("rw", db.mealPlans, db.mealPlanSlots, db.plannedServings, async () => {
    const slot = await db.mealPlanSlots.get(slotId)

    if (!slot) {
      throw new Error("Meal plan slot not found.")
    }

    const existingServings = await db.plannedServings
      .where("mealPlanSlotId")
      .equals(slotId)
      .toArray()

    await db.plannedServings.bulkDelete(existingServings.map((serving) => serving.id))
    await db.plannedServings.bulkAdd(toPlannedServings(slotId, servings))
    await db.mealPlans.update(slot.mealPlanId, { updatedAt: timestamp })
  })
}

export async function clearSlot(slotId: string): Promise<void> {
  const timestamp = createTimestamp()

  await db.transaction("rw", db.mealPlans, db.mealPlanSlots, db.plannedServings, async () => {
    const slot = await db.mealPlanSlots.get(slotId)

    if (!slot) {
      throw new Error("Meal plan slot not found.")
    }

    const existingServings = await db.plannedServings
      .where("mealPlanSlotId")
      .equals(slotId)
      .toArray()

    await db.mealPlanSlots.put({
      ...slot,
      recipeId: undefined,
      freeText: undefined,
    })
    await db.plannedServings.bulkDelete(existingServings.map((serving) => serving.id))
    await db.mealPlans.update(slot.mealPlanId, { updatedAt: timestamp })
  })
}

export async function copyPreviousWeek(
  currentWeekStart: string,
  options: CopyPreviousWeekOptions = {}
): Promise<MealPlanDetail> {
  const currentPlan = await getOrCreateMealPlanForWeek(currentWeekStart)
  const hasFilledCurrentSlots = currentPlan.slots.some(isFilledSlot)

  if (hasFilledCurrentSlots && !options.overwrite) {
    throw new MealPlanOverwriteError()
  }

  const previousMonday = parseIsoDate(currentWeekStart)
  previousMonday.setDate(previousMonday.getDate() - 7)

  const previousPlan = await db.mealPlans
    .where("weekStart")
    .equals(toIsoDate(previousMonday))
    .and((plan) => !plan.isDeleted)
    .first()

  if (!previousPlan) {
    return currentPlan
  }

  const previousDetail = await getMealPlanDetail(previousPlan.id)

  if (!previousDetail) {
    return currentPlan
  }

  const sourceSlots = previousDetail.slots.filter(isFilledSlot)
  const currentSlotsByKey = new Map(
    currentPlan.slots.map((slot) => [`${slot.dayOfWeek}-${slot.mealTime}`, slot])
  )
  const currentFilledSlots = currentPlan.slots.filter(isFilledSlot)

  await db.transaction("rw", db.mealPlans, db.mealPlanSlots, db.plannedServings, async () => {
    if (currentFilledSlots.length > 0) {
      await db.mealPlanSlots.bulkPut(
        currentFilledSlots.map((slot) => ({
          ...slot,
          recipeId: undefined,
          freeText: undefined,
        }))
      )
      const currentServings = await db.plannedServings
        .where("mealPlanSlotId")
        .anyOf(currentPlan.slots.map((slot) => slot.id))
        .toArray()

      await db.plannedServings.bulkDelete(
        currentServings.map((serving) => serving.id)
      )
    }

    const updatedSlots: MealPlanSlot[] = []
    const copiedServings: PlannedServing[] = []

    for (const sourceSlot of sourceSlots) {
      const targetSlot = currentSlotsByKey.get(
        `${sourceSlot.dayOfWeek}-${sourceSlot.mealTime}`
      )

      if (!targetSlot) continue

      updatedSlots.push({
        ...targetSlot,
        recipeId: sourceSlot.recipeId,
        freeText: sourceSlot.freeText,
      })
      copiedServings.push(
        ...sourceSlot.servings.map((serving) => ({
          id: createId(),
          mealPlanSlotId: targetSlot.id,
          familyMemberId: serving.familyMemberId,
          included: serving.included,
          portionNotes: serving.portionNotes,
        }))
      )
    }

    if (updatedSlots.length > 0) {
      await db.mealPlanSlots.bulkPut(updatedSlots)
    }

    if (copiedServings.length > 0) {
      await db.plannedServings.bulkAdd(copiedServings)
    }

    await db.mealPlans.update(currentPlan.id, { updatedAt: createTimestamp() })
  })

  const detail = await getMealPlanDetail(currentPlan.id)

  if (!detail) {
    throw new Error("Meal plan could not be loaded after copy.")
  }

  return detail
}
