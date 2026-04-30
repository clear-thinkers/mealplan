"use client"

import { useRouter } from "next/navigation"

import { RecipeForm } from "@/modules/recipes/components/RecipeForm"
import { emptyRecipeFormValues } from "@/modules/recipes/hooks/useRecipeForm"
import type { RecipeFormData } from "@/modules/recipes/schemas/recipe-form-schema"
import { createRecipe } from "@/shared/lib/services/recipe-service"

export default function NewRecipePage() {
  const router = useRouter()

  async function saveRecipe(input: RecipeFormData) {
    const recipe = await createRecipe(input)
    router.push(`/recipes/${recipe.id}`)
  }

  return (
    <RecipeForm
      defaultValues={emptyRecipeFormValues}
      description="Capture the ingredients, steps, tags, and family adjustments for a reusable recipe."
      onSubmit={saveRecipe}
      submitLabel="Save recipe"
      title="New recipe"
    />
  )
}
