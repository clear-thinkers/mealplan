import { beforeEach, describe, expect, it } from "vitest"

import {
  createRecipe,
  getRecipeDetail,
  listRecipes,
  restoreRecipe,
  searchRecipes,
  softDeleteRecipe,
  updateRecipe,
} from "@/shared/lib/services/recipe-service"
import { db, initializeDb } from "@/shared/lib/db"
import type { RecipeFormData } from "@/modules/recipes/schemas/recipe-form-schema"

const baseInput: RecipeFormData = {
  name: "葱油拌面",
  description: "快手面条",
  serves: 2,
  prepMinutes: 5,
  cookMinutes: 10,
  source: "家里常做",
  tags: ["快手", "主食"],
  ingredients: [
    { name: "面条", quantity: 200, unit: "g", notes: "细面" },
    { name: "葱", quantity: 2, unit: "根", notes: "切段" },
  ],
  steps: [
    { instruction: "煮面。" },
    { instruction: "拌入葱油。" },
  ],
  memberNotes: [{ familyMemberId: "nora", notes: "少放葱" }],
}

async function clearRecipeTables() {
  await initializeDb()
  await db.transaction(
    "rw",
    db.recipes,
    db.recipeIngredients,
    db.recipeSteps,
    db.recipeMemberNotes,
    async () => {
      await db.recipeMemberNotes.clear()
      await db.recipeSteps.clear()
      await db.recipeIngredients.clear()
      await db.recipes.clear()
    }
  )
}

describe("recipe service", () => {
  beforeEach(async () => {
    await clearRecipeTables()
  })

  it("creates a recipe with child rows", async () => {
    const recipe = await createRecipe(baseInput)

    expect(recipe.id).toBeTruthy()
    expect(recipe.ingredients).toHaveLength(2)
    expect(recipe.steps.map((step) => step.stepNumber)).toEqual([1, 2])
    expect(recipe.memberNotes[0]?.recipeId).toBe(recipe.id)
  })

  it("lists only non-deleted recipes sorted by updatedAt descending", async () => {
    const first = await createRecipe({ ...baseInput, name: "First" })
    await createRecipe({ ...baseInput, name: "Second" })
    await softDeleteRecipe(first.id)

    const recipes = await listRecipes()

    expect(recipes.map((recipe) => recipe.name)).toEqual(["Second"])
  })

  it("gets full recipe detail by id", async () => {
    const created = await createRecipe(baseInput)
    const detail = await getRecipeDetail(created.id)

    expect(detail?.name).toBe("葱油拌面")
    expect(detail?.ingredients[0]?.name).toBe("面条")
    expect(detail?.steps[1]?.instruction).toBe("拌入葱油。")
  })

  it("updates parent fields and replaces ordered child rows", async () => {
    const created = await createRecipe(baseInput)
    const updated = await updateRecipe(created.id, {
      ...baseInput,
      name: "番茄鸡蛋面",
      ingredients: [{ name: "番茄", quantity: 2, unit: "个", notes: undefined }],
      steps: [{ instruction: "炒番茄鸡蛋。" }],
      memberNotes: [{ familyMemberId: "freddie", notes: "切小块" }],
    })

    expect(updated.name).toBe("番茄鸡蛋面")
    expect(updated.ingredients).toHaveLength(1)
    expect(updated.ingredients[0]?.sortOrder).toBe(0)
    expect(updated.steps[0]?.stepNumber).toBe(1)
    expect(updated.memberNotes[0]?.familyMemberId).toBe("freddie")
  })

  it("soft deletes and restores without removing child rows", async () => {
    const created = await createRecipe(baseInput)

    await softDeleteRecipe(created.id)
    expect(await getRecipeDetail(created.id)).toBeNull()
    expect(await db.recipeIngredients.where("recipeId").equals(created.id).count()).toBe(2)

    await restoreRecipe(created.id)
    expect((await getRecipeDetail(created.id))?.name).toBe("葱油拌面")
  })

  it("throws for missing recipes", async () => {
    await expect(softDeleteRecipe("missing")).rejects.toThrow("Recipe not found")
    await expect(updateRecipe("missing", baseInput)).rejects.toThrow(
      "Recipe not found"
    )
  })

  it("rejects unknown family members at the service layer", async () => {
    await expect(
      createRecipe({
        ...baseInput,
        memberNotes: [{ familyMemberId: "guest", notes: "bad" }],
      } as unknown as RecipeFormData)
    ).rejects.toThrow("Unknown family member")
  })

  it("searches Chinese and English recipe content while excluding deleted recipes", async () => {
    const tofu = await createRecipe({
      ...baseInput,
      name: "家常豆腐",
      tags: ["快手"],
      ingredients: [{ name: "豆腐", quantity: 1, unit: "块", notes: undefined }],
      memberNotes: [{ familyMemberId: "nora", notes: "不要辣" }],
    })
    await createRecipe({
      ...baseInput,
      name: "Scallion noodles",
      ingredients: [{ name: "scallion", quantity: 2, unit: "stalks", notes: undefined }],
    })
    const deleted = await createRecipe({ ...baseInput, name: "豆腐汤" })
    await softDeleteRecipe(deleted.id)

    expect((await searchRecipes("豆腐")).map((recipe) => recipe.id)).toContain(
      tofu.id
    )
    expect((await searchRecipes("快手")).map((recipe) => recipe.id)).toContain(
      tofu.id
    )
    expect((await searchRecipes("scallion"))[0]?.name).toBe("Scallion noodles")
    expect((await searchRecipes("不要辣"))[0]?.id).toBe(tofu.id)
    expect((await searchRecipes("豆腐")).map((recipe) => recipe.name)).not.toContain(
      "豆腐汤"
    )
  })

  it("uses updatedAt and name as equal-score tiebreakers", async () => {
    await createRecipe({ ...baseInput, name: "Alpha", tags: ["same"] })
    await createRecipe({ ...baseInput, name: "Beta", tags: ["same"] })

    const results = await searchRecipes("same")

    expect(results[0]?.name).toBe("Beta")
  })
})
