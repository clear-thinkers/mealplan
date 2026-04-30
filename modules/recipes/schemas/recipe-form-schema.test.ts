import { describe, expect, it } from "vitest"

import { createRecipeInputSchema } from "@/modules/recipes/schemas/recipe-form-schema"

const validInput = {
  name: "葱油拌面",
  description: "快手面条",
  serves: 2,
  prepMinutes: 5,
  cookMinutes: 10,
  source: "家里常做",
  tagsText: "快手, 主食, 快手",
  ingredients: [{ name: "面条", quantity: 200, unit: "g", notes: "细面" }],
  steps: [{ instruction: "煮面后拌入葱油。" }],
  memberNotes: [{ familyMemberId: "nora", notes: "少放葱" }],
}

describe("createRecipeInputSchema", () => {
  it("accepts Chinese recipe and ingredient names", () => {
    const result = createRecipeInputSchema.safeParse(validInput)

    expect(result.success).toBe(true)
    expect(result.success && result.data.name).toBe("葱油拌面")
    expect(result.success && result.data.ingredients[0]?.name).toBe("面条")
  })

  it("rejects an empty recipe name", () => {
    const result = createRecipeInputSchema.safeParse({
      ...validInput,
      name: "   ",
    })

    expect(result.success).toBe(false)
  })

  it("rejects serves less than one", () => {
    const result = createRecipeInputSchema.safeParse({
      ...validInput,
      serves: 0,
    })

    expect(result.success).toBe(false)
  })

  it("rejects negative minutes", () => {
    const result = createRecipeInputSchema.safeParse({
      ...validInput,
      prepMinutes: -1,
    })

    expect(result.success).toBe(false)
  })

  it("trims and dedupes tags while preserving Chinese text", () => {
    const result = createRecipeInputSchema.parse({
      ...validInput,
      tagsText: " 快手,汤, 快手\n主食 ",
    })

    expect(result.tags).toEqual(["快手", "汤", "主食"])
  })

  it("rejects member notes for unknown family members", () => {
    const result = createRecipeInputSchema.safeParse({
      ...validInput,
      memberNotes: [{ familyMemberId: "guest", notes: "unknown" }],
    })

    expect(result.success).toBe(false)
  })
})
