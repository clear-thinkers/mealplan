import { z } from "zod"

import { FAMILY_MEMBERS } from "@/shared/lib/constants"

const familyMemberIds = FAMILY_MEMBERS.map((member) => member.id) as [
  (typeof FAMILY_MEMBERS)[number]["id"],
  ...(typeof FAMILY_MEMBERS)[number]["id"][],
]

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional()

const optionalNumberSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined
    }

    if (typeof value === "string") {
      return Number(value)
    }

    return value
  },
  z.number().int().min(0).optional()
)

const optionalQuantitySchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined
    }

    if (typeof value === "string") {
      return Number(value)
    }

    return value
  },
  z.number().positive().optional()
)

function parseTags(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[,，\n]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  )
}

export const recipeIngredientFormSchema = z.object({
  name: z.string().trim().min(1, "Ingredient name is required"),
  quantity: optionalQuantitySchema,
  unit: optionalTextSchema,
  notes: optionalTextSchema,
})

export const recipeStepFormSchema = z.object({
  instruction: z.string().trim().min(1, "Step instruction is required"),
})

export const recipeMemberNoteFormSchema = z.object({
  familyMemberId: z.enum(familyMemberIds),
  notes: z.string().trim().min(1, "Note is required"),
})

export const recipeFormSchema = z.object({
  name: z.string().trim().min(1, "Recipe name is required"),
  description: optionalTextSchema,
  serves: z.coerce.number().int().min(1, "Serves must be at least 1"),
  prepMinutes: optionalNumberSchema,
  cookMinutes: optionalNumberSchema,
  source: optionalTextSchema,
  tagsText: z.string().trim(),
  ingredients: z.array(recipeIngredientFormSchema).min(1),
  steps: z.array(recipeStepFormSchema).min(1),
  memberNotes: z.array(recipeMemberNoteFormSchema),
})

export const createRecipeInputSchema = recipeFormSchema.transform((value) => ({
  name: value.name,
  description: value.description,
  serves: value.serves,
  prepMinutes: value.prepMinutes,
  cookMinutes: value.cookMinutes,
  source: value.source,
  tags: parseTags(value.tagsText),
  ingredients: value.ingredients,
  steps: value.steps,
  memberNotes: value.memberNotes,
}))

export const updateRecipeInputSchema = createRecipeInputSchema

export type RecipeFormValues = z.input<typeof recipeFormSchema>
export type RecipeFormData = z.output<typeof createRecipeInputSchema>
