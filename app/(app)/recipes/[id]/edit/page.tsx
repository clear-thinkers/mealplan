"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { RecipeForm } from "@/modules/recipes/components/RecipeForm"
import { useRecipeDetail } from "@/modules/recipes/hooks/useRecipeDetail"
import { useRecipeForm } from "@/modules/recipes/hooks/useRecipeForm"
import type { RecipeFormData } from "@/modules/recipes/schemas/recipe-form-schema"
import { updateRecipe } from "@/shared/lib/services/recipe-service"

export default function EditRecipePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { error, isLoading, recipe } = useRecipeDetail(params.id)
  const defaultValues = useRecipeForm(recipe)

  async function saveRecipe(input: RecipeFormData) {
    const updated = await updateRecipe(params.id, input)
    router.push(`/recipes/${updated.id}`)
  }

  if (isLoading) {
    return (
      <div className="rounded-[10px] border border-border bg-card px-3 py-8 text-center text-[13px] text-text-mid">
        Loading recipe...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[10px] bg-rejected-bg px-3 py-3 text-[13px] text-rejected-text">
        {error}
      </div>
    )
  }

  if (!recipe) {
    return (
      <section className="rounded-[10px] border border-border bg-card px-3 py-8 text-center">
        <h2 className="text-[14px] font-semibold">Recipe not found</h2>
        <Link
          href="/recipes"
          className="mt-4 inline-block rounded-[10px] bg-green-dark px-4 py-[11px] text-[13px] font-semibold text-cream"
        >
          Back to recipes
        </Link>
      </section>
    )
  }

  return (
    <RecipeForm
      defaultValues={defaultValues}
      description="Update the recipe while preserving its local history and family notes."
      onSubmit={saveRecipe}
      submitLabel="Save changes"
      title="Edit recipe"
    />
  )
}
