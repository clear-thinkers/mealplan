import type {
  Recipe,
  RecipeIngredient,
  RecipeMemberNote,
  RecipeStep,
} from "@/shared/lib/db-schema"

export type RecipeSummary = Recipe & {
  ingredientCount: number
  stepCount: number
}

export type RecipeDetail = Recipe & {
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  memberNotes: RecipeMemberNote[]
}
