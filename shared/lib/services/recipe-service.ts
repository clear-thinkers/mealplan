import type { RecipeFormData } from "@/modules/recipes/schemas/recipe-form-schema"
import type { RecipeDetail, RecipeSummary } from "@/modules/recipes/types"
import { FAMILY_MEMBERS } from "@/shared/lib/constants"
import { createId, createTimestamp, db } from "@/shared/lib/db"
import type {
  FamilyMemberId,
  Recipe,
  RecipeIngredient,
  RecipeMemberNote,
  RecipeStep,
} from "@/shared/lib/db-schema"
import { createSearchIndex, normalizeSearchText } from "@/shared/lib/search"

type RecipeSearchDocument = RecipeSummary & {
  sourceText: string
  tagsText: string
  ingredientText: string
  stepText: string
  memberNoteText: string
}

const familyMemberIds = new Set(FAMILY_MEMBERS.map((member) => member.id))

function compareRecipesByUpdatedAt(a: Recipe, b: Recipe): number {
  const updatedCompare = b.updatedAt.localeCompare(a.updatedAt)

  if (updatedCompare !== 0) {
    return updatedCompare
  }

  return a.name.localeCompare(b.name)
}

function assertKnownFamilyMembers(memberNotes: RecipeFormData["memberNotes"]) {
  for (const note of memberNotes) {
    if (!familyMemberIds.has(note.familyMemberId)) {
      throw new Error(`Unknown family member: ${note.familyMemberId}`)
    }
  }
}

function toRecipeSummary(
  recipe: Recipe,
  ingredients: RecipeIngredient[],
  steps: RecipeStep[]
): RecipeSummary {
  return {
    ...recipe,
    ingredientCount: ingredients.length,
    stepCount: steps.length,
  }
}

async function getRecipeChildren(recipeId: string) {
  const [ingredients, steps, memberNotes] = await Promise.all([
    db.recipeIngredients.where("recipeId").equals(recipeId).toArray(),
    db.recipeSteps.where("recipeId").equals(recipeId).toArray(),
    db.recipeMemberNotes.where("recipeId").equals(recipeId).toArray(),
  ])

  return {
    ingredients: ingredients.sort((a, b) => a.sortOrder - b.sortOrder),
    steps: steps.sort((a, b) => a.stepNumber - b.stepNumber),
    memberNotes,
  }
}

async function toRecipeSearchDocument(
  recipe: Recipe
): Promise<RecipeSearchDocument> {
  const { ingredients, steps, memberNotes } = await getRecipeChildren(recipe.id)

  return {
    ...toRecipeSummary(recipe, ingredients, steps),
    sourceText: recipe.source ?? "",
    tagsText: recipe.tags.join(" "),
    ingredientText: ingredients
      .map((ingredient) =>
        [ingredient.name, ingredient.unit, ingredient.notes].filter(Boolean).join(" ")
      )
      .join(" "),
    stepText: steps.map((step) => step.instruction).join(" "),
    memberNoteText: memberNotes.map((note) => note.notes).join(" "),
  }
}

function buildRecipeRows(recipeId: string, input: RecipeFormData) {
  const ingredients: RecipeIngredient[] = input.ingredients.map(
    (ingredient, index) => ({
      id: createId(),
      recipeId,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      notes: ingredient.notes,
      sortOrder: index,
    })
  )

  const steps: RecipeStep[] = input.steps.map((step, index) => ({
    id: createId(),
    recipeId,
    stepNumber: index + 1,
    instruction: step.instruction,
  }))

  const memberNotes: RecipeMemberNote[] = input.memberNotes.map((note) => ({
    id: createId(),
    recipeId,
    familyMemberId: note.familyMemberId as FamilyMemberId,
    notes: note.notes,
  }))

  return { ingredients, steps, memberNotes }
}

async function replaceRecipeChildren(recipeId: string, input: RecipeFormData) {
  const existingChildren = await getRecipeChildren(recipeId)
  const rows = buildRecipeRows(recipeId, input)

  await db.recipeIngredients.bulkDelete(
    existingChildren.ingredients.map((ingredient) => ingredient.id)
  )
  await db.recipeSteps.bulkDelete(existingChildren.steps.map((step) => step.id))
  await db.recipeMemberNotes.bulkDelete(
    existingChildren.memberNotes.map((note) => note.id)
  )

  await db.recipeIngredients.bulkAdd(rows.ingredients)
  await db.recipeSteps.bulkAdd(rows.steps)

  if (rows.memberNotes.length > 0) {
    await db.recipeMemberNotes.bulkAdd(rows.memberNotes)
  }
}

export async function listRecipes(): Promise<RecipeSummary[]> {
  const recipes = (await db.recipes.toArray()).filter(
    (recipe) => !recipe.isDeleted
  )
  const summaries = await Promise.all(
    recipes.map(async (recipe) => {
      const { ingredients, steps } = await getRecipeChildren(recipe.id)
      return toRecipeSummary(recipe, ingredients, steps)
    })
  )

  return summaries.sort(compareRecipesByUpdatedAt)
}

export async function getRecipeDetail(id: string): Promise<RecipeDetail | null> {
  const recipe = await db.recipes.get(id)

  if (!recipe || recipe.isDeleted) {
    return null
  }

  const children = await getRecipeChildren(id)

  return {
    ...recipe,
    ...children,
  }
}

export async function createRecipe(input: RecipeFormData): Promise<RecipeDetail> {
  assertKnownFamilyMembers(input.memberNotes)

  const recipeId = createId()
  const timestamp = createTimestamp()
  const recipe: Recipe = {
    id: recipeId,
    name: input.name,
    description: input.description,
    serves: input.serves,
    prepMinutes: input.prepMinutes,
    cookMinutes: input.cookMinutes,
    source: input.source,
    tags: input.tags,
    isDeleted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  const rows = buildRecipeRows(recipeId, input)

  await db.transaction(
    "rw",
    db.recipes,
    db.recipeIngredients,
    db.recipeSteps,
    db.recipeMemberNotes,
    async () => {
      await db.recipes.add(recipe)
      await db.recipeIngredients.bulkAdd(rows.ingredients)
      await db.recipeSteps.bulkAdd(rows.steps)

      if (rows.memberNotes.length > 0) {
        await db.recipeMemberNotes.bulkAdd(rows.memberNotes)
      }
    }
  )

  return {
    ...recipe,
    ingredients: rows.ingredients,
    steps: rows.steps,
    memberNotes: rows.memberNotes,
  }
}

export async function updateRecipe(
  id: string,
  input: RecipeFormData
): Promise<RecipeDetail> {
  assertKnownFamilyMembers(input.memberNotes)

  const existing = await db.recipes.get(id)

  if (!existing || existing.isDeleted) {
    throw new Error("Recipe not found")
  }

  const updatedRecipe: Recipe = {
    ...existing,
    name: input.name,
    description: input.description,
    serves: input.serves,
    prepMinutes: input.prepMinutes,
    cookMinutes: input.cookMinutes,
    source: input.source,
    tags: input.tags,
    updatedAt: createTimestamp(),
  }

  await db.transaction(
    "rw",
    db.recipes,
    db.recipeIngredients,
    db.recipeSteps,
    db.recipeMemberNotes,
    async () => {
      await db.recipes.put(updatedRecipe)
      await replaceRecipeChildren(id, input)
    }
  )

  const detail = await getRecipeDetail(id)

  if (!detail) {
    throw new Error("Recipe not found after update")
  }

  return detail
}

export async function softDeleteRecipe(id: string): Promise<void> {
  const existing = await db.recipes.get(id)

  if (!existing) {
    throw new Error("Recipe not found")
  }

  await db.recipes.put({
    ...existing,
    isDeleted: true,
    updatedAt: createTimestamp(),
  })
}

export async function restoreRecipe(id: string): Promise<void> {
  const existing = await db.recipes.get(id)

  if (!existing) {
    throw new Error("Recipe not found")
  }

  await db.recipes.put({
    ...existing,
    isDeleted: false,
    updatedAt: createTimestamp(),
  })
}

export async function searchRecipes(query: string): Promise<RecipeSummary[]> {
  const normalizedQuery = normalizeSearchText(query)
  const documents = await Promise.all(
    (await db.recipes.toArray())
      .filter((recipe) => !recipe.isDeleted)
      .map(toRecipeSearchDocument)
  )

  if (!normalizedQuery) {
    return documents.sort(compareRecipesByUpdatedAt)
  }

  const fuse = createSearchIndex(documents, [
    "name",
    "description",
    "sourceText",
    "tagsText",
    "ingredientText",
    "stepText",
    "memberNoteText",
  ])

  return fuse
    .search(normalizedQuery)
    .sort((a, b) => {
      const scoreCompare = (a.score ?? 0) - (b.score ?? 0)

      if (scoreCompare !== 0) {
        return scoreCompare
      }

      return compareRecipesByUpdatedAt(a.item, b.item)
    })
    .map((result) => result.item)
}
