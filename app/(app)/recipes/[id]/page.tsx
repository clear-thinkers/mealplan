"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { RecipeDetail } from "@/modules/recipes/components/RecipeDetail"
import { useRecipeDetail } from "@/modules/recipes/hooks/useRecipeDetail"

export default function RecipeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { error, isLoading, recipe, softDelete } = useRecipeDetail(params.id)

  async function deleteRecipe() {
    if (!recipe) return
    await softDelete()
    router.push(
      `/recipes?deleted=${encodeURIComponent(recipe.id)}&name=${encodeURIComponent(
        recipe.name
      )}`
    )
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
        <p className="mt-1 text-[11px] text-text-mid">
          It may have been deleted or moved.
        </p>
        <Link
          href="/recipes"
          className="mt-4 inline-block rounded-[10px] bg-green-dark px-4 py-[11px] text-[13px] font-semibold text-cream"
        >
          Back to recipes
        </Link>
      </section>
    )
  }

  return <RecipeDetail recipe={recipe} onDelete={deleteRecipe} />
}
