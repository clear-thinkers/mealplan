"use client"

import { useCallback, useEffect, useState } from "react"

import type { FamilyMemberId, MealPlanDetail } from "@/modules/meal-plan/types"
import {
  clearSlot as clearMealPlanSlot,
  copyPreviousWeek as copyPreviousWeekPlan,
  getOrCreateMealPlanForWeek,
  MealPlanOverwriteError,
  updatePlannedServings,
  updateSlotFreeText as updateMealPlanSlotFreeText,
  updateSlotRecipe as updateMealPlanSlotRecipe,
} from "@/shared/lib/services/meal-plan-service"

type ServingInput = {
  familyMemberId: FamilyMemberId
  included: boolean
  portionNotes?: string
}

type UseMealPlanResult = {
  plan: MealPlanDetail | null
  isLoading: boolean
  isCopying: boolean
  error: string | null
  confirmOverwrite: boolean
  refresh: () => Promise<void>
  updateSlotRecipe: (slotId: string, recipeId: string) => Promise<void>
  updateSlotFreeText: (slotId: string, freeText: string) => Promise<void>
  updateServings: (slotId: string, servings: ServingInput[]) => Promise<void>
  clearSlot: (slotId: string) => Promise<void>
  copyPreviousWeek: (overwrite?: boolean) => Promise<void>
  dismissOverwriteConfirmation: () => void
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong."
}

export function useMealPlan(weekStart: string): UseMealPlanResult {
  const [plan, setPlan] = useState<MealPlanDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCopying, setIsCopying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmOverwrite, setConfirmOverwrite] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setPlan(await getOrCreateMealPlanForWeek(weekStart))
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }, [weekStart])

  const mutateAndRefresh = useCallback(
    async (mutation: () => Promise<void>) => {
      setError(null)

      try {
        await mutation()
        await refresh()
      } catch (caughtError) {
        setError(getErrorMessage(caughtError))
        throw caughtError
      }
    },
    [refresh]
  )

  const updateSlotRecipe = useCallback(
    async (slotId: string, recipeId: string) => {
      await mutateAndRefresh(() => updateMealPlanSlotRecipe(slotId, recipeId))
    },
    [mutateAndRefresh]
  )

  const updateSlotFreeText = useCallback(
    async (slotId: string, freeText: string) => {
      await mutateAndRefresh(() => updateMealPlanSlotFreeText(slotId, freeText))
    },
    [mutateAndRefresh]
  )

  const updateServings = useCallback(
    async (slotId: string, servings: ServingInput[]) => {
      await mutateAndRefresh(() => updatePlannedServings(slotId, servings))
    },
    [mutateAndRefresh]
  )

  const clearSlot = useCallback(
    async (slotId: string) => {
      await mutateAndRefresh(() => clearMealPlanSlot(slotId))
    },
    [mutateAndRefresh]
  )

  const copyPreviousWeek = useCallback(
    async (overwrite = false) => {
      setIsCopying(true)
      setError(null)

      try {
        setPlan(await copyPreviousWeekPlan(weekStart, { overwrite }))
        setConfirmOverwrite(false)
      } catch (caughtError) {
        if (caughtError instanceof MealPlanOverwriteError) {
          setConfirmOverwrite(true)
        } else {
          setError(getErrorMessage(caughtError))
        }
      } finally {
        setIsCopying(false)
      }
    },
    [weekStart]
  )

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    plan,
    isLoading,
    isCopying,
    error,
    confirmOverwrite,
    refresh,
    updateSlotRecipe,
    updateSlotFreeText,
    updateServings,
    clearSlot,
    copyPreviousWeek,
    dismissOverwriteConfirmation: () => setConfirmOverwrite(false),
  }
}
