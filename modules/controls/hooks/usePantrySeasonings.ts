"use client"

import { useCallback, useEffect, useState } from "react"

import type { PantrySeasoning } from "@/modules/controls/types"
import {
  addPantrySeasoning,
  listPantrySeasonings,
  movePantrySeasoning,
  removePantrySeasoning,
  seedDefaultPantrySeasonings,
  updatePantrySeasoning,
} from "@/shared/lib/services/pantry-seasoning-service"

export function usePantrySeasonings() {
  const [seasonings, setSeasonings] = useState<PantrySeasoning[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      setSeasonings(await listPantrySeasonings())
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Pantry seasonings could not be loaded."
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function runMutation(mutation: () => Promise<unknown>) {
    try {
      setError(null)
      await mutation()
      await refresh()
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Pantry seasonings could not be updated."
      )
    }
  }

  return {
    seasonings,
    isLoading,
    error,
    refresh,
    addSeasoning: (name: string, notes?: string) =>
      runMutation(() => addPantrySeasoning({ name, notes })),
    updateSeasoning: (
      id: string,
      input: Parameters<typeof updatePantrySeasoning>[1]
    ) => runMutation(() => updatePantrySeasoning(id, input)),
    removeSeasoning: (id: string) =>
      runMutation(() => removePantrySeasoning(id)),
    moveSeasoning: (id: string, direction: "up" | "down") =>
      runMutation(() => movePantrySeasoning(id, direction)),
    seedDefaults: () => runMutation(seedDefaultPantrySeasonings),
  }
}
