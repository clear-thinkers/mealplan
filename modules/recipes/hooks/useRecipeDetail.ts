"use client"

import { useCallback, useEffect, useState } from "react"

import type { RecipeDetail } from "@/modules/recipes/types"
import {
  getRecipeDetail,
  restoreRecipe,
  softDeleteRecipe,
} from "@/shared/lib/services/recipe-service"

type UseRecipeDetailResult = {
  recipe: RecipeDetail | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  softDelete: () => Promise<void>
  restore: () => Promise<void>
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong"
}

export function useRecipeDetail(id: string): UseRecipeDetailResult {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setRecipe(await getRecipeDetail(id))
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  const softDelete = useCallback(async () => {
    await softDeleteRecipe(id)
    setRecipe(null)
  }, [id])

  const restore = useCallback(async () => {
    await restoreRecipe(id)
    await refresh()
  }, [id, refresh])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    recipe,
    isLoading,
    error,
    refresh,
    softDelete,
    restore,
  }
}
