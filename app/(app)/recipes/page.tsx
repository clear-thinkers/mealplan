"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { Suspense, useCallback, useEffect, useState } from "react"

import { RecipeCard } from "@/modules/recipes/components/RecipeCard"
import { useRecipeSearch } from "@/modules/recipes/hooks/useRecipeSearch"
import { useRecipes } from "@/modules/recipes/hooks/useRecipes"
import { UndoBanner } from "@/shared/components/UndoBanner"

function RecipesContent() {
  const searchParams = useSearchParams()
  const { error, isLoading, recipes, restore, search } = useRecipes()
  const { query, setQuery } = useRecipeSearch(search)
  const [undoRecipeId, setUndoRecipeId] = useState<string | null>(null)
  const [undoRecipeName, setUndoRecipeName] = useState<string>("")

  useEffect(() => {
    const deletedId = searchParams.get("deleted")

    if (deletedId) {
      setUndoRecipeId(deletedId)
      setUndoRecipeName(searchParams.get("name") ?? "Recipe")
    }
  }, [searchParams])

  const undoDelete = useCallback(async () => {
    if (!undoRecipeId) return
    await restore(undoRecipeId)
    setUndoRecipeId(null)
  }, [restore, undoRecipeId])

  return (
    <section className="space-y-4">
      <header className="rounded-[10px] bg-green-dark px-4 py-[14px] text-cream">
        <p className="text-[10px] font-normal tracking-[0.06em] text-green-muted">
          Recipe library
        </p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[19px] font-semibold">Recipes</h2>
            <p className="mt-1 text-[11px] leading-5 text-green-muted">
              Search, cook from, and maintain the family recipe collection.
            </p>
          </div>
          <Link
            href="/recipes/new"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-green-mid px-4 py-[11px] text-[13px] font-semibold text-cream"
          >
            <Plus className="h-4 w-4" strokeWidth={1.8} />
            New recipe
          </Link>
        </div>
      </header>

      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          strokeWidth={1.8}
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search recipes, ingredients, tags, notes"
          className="w-full rounded-[10px] border border-border bg-card py-3 pl-10 pr-3 text-[13px] outline-none focus:border-green-mid"
        />
      </label>

      {error ? (
        <p className="rounded-[10px] bg-rejected-bg px-3 py-2 text-[12px] text-rejected-text">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="rounded-[10px] border border-border bg-card px-3 py-8 text-center text-[13px] text-text-mid">
          Loading recipes...
        </div>
      ) : recipes.length === 0 ? (
        <div className="rounded-[10px] border border-dashed bg-card px-3 py-8 text-center">
          <h3 className="text-[14px] font-semibold text-text-dark">
            No recipes yet
          </h3>
          <p className="mt-1 text-[11px] text-text-mid">
            Add a family recipe to start building the library.
          </p>
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {undoRecipeId ? (
        <UndoBanner
          message={`${undoRecipeName} was deleted.`}
          onDismiss={() => setUndoRecipeId(null)}
          onUndo={undoDelete}
        />
      ) : null}
    </section>
  )
}

export default function RecipesPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[10px] border border-border bg-card px-3 py-8 text-center text-[13px] text-text-mid">
          Loading recipes...
        </div>
      }
    >
      <RecipesContent />
    </Suspense>
  )
}
