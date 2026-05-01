"use client"

import { Search, Utensils, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { useRecipeSearch } from "@/modules/recipes/hooks/useRecipeSearch"
import type { RecipeSummary } from "@/modules/recipes/types"
import { listRecipes, searchRecipes } from "@/shared/lib/services/recipe-service"
import { cn } from "@/shared/lib/utils"

type RecipePickerProps = {
  selectedId: string | undefined
  currentFreeText?: string
  canClear?: boolean
  onSelectRecipe: (recipeId: string) => void
  onSelectFreeText: (text: string) => void
  onClear: () => void
}

export function RecipePicker({
  selectedId,
  currentFreeText,
  canClear = false,
  onSelectRecipe,
  onSelectFreeText,
  onClear,
}: RecipePickerProps) {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFreeTextOpen, setIsFreeTextOpen] = useState(Boolean(currentFreeText))
  const [freeText, setFreeText] = useState(currentFreeText ?? "")

  const runSearch = useCallback(async (query: string) => {
    setIsLoading(true)
    setError(null)

    try {
      setRecipes(query ? await searchRecipes(query) : await listRecipes())
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Recipes could not load."
      )
    } finally {
      setIsLoading(false)
    }
  }, [])
  const { query, setQuery } = useRecipeSearch(runSearch)

  useEffect(() => {
    setFreeText(currentFreeText ?? "")
    setIsFreeTextOpen(Boolean(currentFreeText))
  }, [currentFreeText])

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setIsFreeTextOpen(true)}
        className={cn(
          "flex min-h-11 w-full items-center gap-2 rounded-[10px] border px-3 py-2 text-left text-[13px]",
          isFreeTextOpen
            ? "border-green-mid bg-cream text-text-dark"
            : "border-border bg-card text-text-mid"
        )}
      >
        <Utensils className="h-4 w-4 text-green-mid" strokeWidth={1.8} />
        <span className="min-w-0 flex-1">Free text / eating out</span>
      </button>

      {isFreeTextOpen ? (
        <div className="rounded-[10px] border border-border bg-card px-3 py-3">
          <label className="block">
            <span className="text-[10px] text-text-muted">Slot text</span>
            <input
              value={freeText}
              onChange={(event) => {
                setFreeText(event.target.value)
                onSelectFreeText(event.target.value)
              }}
              placeholder="Eating out, leftovers, school lunch"
              className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
            />
          </label>
        </div>
      ) : null}

      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          strokeWidth={1.8}
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search recipes"
          className="w-full rounded-[10px] border border-border bg-card py-3 pl-10 pr-3 text-[13px] outline-none focus:border-green-mid"
        />
      </label>

      {canClear ? (
        <button
          type="button"
          onClick={onClear}
          className="flex min-h-11 w-full items-center gap-2 rounded-[10px] bg-idle-bg px-3 py-2 text-left text-[13px] font-semibold text-text-mid"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
          Clear slot
        </button>
      ) : null}

      {error ? (
        <p className="rounded-[10px] bg-rejected-bg px-3 py-2 text-[12px] text-rejected-text">
          {error}
        </p>
      ) : null}

      <div className="max-h-72 overflow-y-auto rounded-[10px] border border-border bg-card">
        {isLoading ? (
          <p className="px-3 py-4 text-center text-[13px] text-text-mid">
            Loading recipes...
          </p>
        ) : recipes.length === 0 ? (
          <p className="px-3 py-4 text-center text-[13px] text-text-mid">
            No matching recipes.
          </p>
        ) : (
          recipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => {
                setIsFreeTextOpen(false)
                onSelectRecipe(recipe.id)
              }}
              className={cn(
                "flex min-h-11 w-full items-center justify-between gap-3 border-b border-border px-3 py-2 text-left last:border-b-0",
                selectedId === recipe.id ? "bg-ate-bg" : "bg-card"
              )}
            >
              <span className="min-w-0 truncate text-[13px] font-semibold text-text-dark">
                {recipe.name}
              </span>
              <span className="shrink-0 text-[10px] text-text-muted">
                Serves {recipe.serves}
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  )
}

