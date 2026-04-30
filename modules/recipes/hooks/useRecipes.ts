"use client"

import { useCallback, useEffect, useState } from "react"

import type { RecipeSummary } from "@/modules/recipes/types"
import {
  listRecipes,
  restoreRecipe,
  searchRecipes,
  softDeleteRecipe,
} from "@/shared/lib/services/recipe-service"

type UseRecipesResult = {
  recipes: RecipeSummary[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  search: (query: string) => Promise<void>
  softDelete: (id: string) => Promise<void>
  restore: (id: string) => Promise<void>
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong"
}

export function useRecipes(): UseRecipesResult {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setRecipes(await listRecipes())
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const search = useCallback(async (query: string) => {
    setIsLoading(true)
    setError(null)

    try {
      setRecipes(await searchRecipes(query))
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const softDelete = useCallback(async (id: string) => {
    await softDeleteRecipe(id)
    setRecipes((currentRecipes) =>
      currentRecipes.filter((recipe) => recipe.id !== id)
    )
  }, [])

  const restore = useCallback(async (id: string) => {
    await restoreRecipe(id)
    setRecipes(await listRecipes())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    recipes,
    isLoading,
    error,
    refresh,
    search,
    softDelete,
    restore,
  }
}
