"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import { SlotEditor } from "@/modules/meal-plan/components/SlotEditor"
import { WeekGrid } from "@/modules/meal-plan/components/WeekGrid"
import { WeekNavBar } from "@/modules/meal-plan/components/WeekNavBar"
import { useMealPlan } from "@/modules/meal-plan/hooks/useMealPlan"
import { useWeekNavigation } from "@/modules/meal-plan/hooks/useWeekNavigation"
import type { FamilyMemberId } from "@/modules/meal-plan/types"
import {
  getWeekStart,
  hasFilledMealPlanForWeek,
} from "@/shared/lib/services/meal-plan-service"

type PageProps = {
  params: { date: string }
}

type ServingDraft = {
  familyMemberId: FamilyMemberId
  included: boolean
  portionNotes?: string
}

function parseDateParam(date: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null
  }

  const [year, month, day] = date.split("-").map(Number)
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1)

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== (month ?? 1) - 1 ||
    parsed.getDate() !== day
  ) {
    return null
  }

  return parsed
}

export default function MealPlanDatePage({ params }: PageProps) {
  const router = useRouter()
  const parsedDate = useMemo(() => parseDateParam(params.date), [params.date])
  const normalizedWeekStart = parsedDate
    ? getWeekStart(parsedDate)
    : getWeekStart(new Date())
  const isNormalized = normalizedWeekStart === params.date
  const {
    confirmOverwrite,
    copyPreviousWeek,
    clearSlot,
    dismissOverwriteConfirmation,
    error,
    isCopying,
    isLoading,
    plan,
    updateServings,
    updateSlotFreeText,
    updateSlotRecipe,
  } = useMealPlan(normalizedWeekStart)
  const { prevWeekStart, nextWeekStart, weekLabel, isCurrentWeek } =
    useWeekNavigation(normalizedWeekStart)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [isSavingSlot, setIsSavingSlot] = useState(false)
  const [canCopyLastWeek, setCanCopyLastWeek] = useState(false)

  const selectedSlot =
    plan?.slots.find((slot) => slot.id === selectedSlotId) ?? null

  useEffect(() => {
    if (!isNormalized) {
      router.replace(`/meal-plan/${normalizedWeekStart}`)
    }
  }, [isNormalized, normalizedWeekStart, router])

  useEffect(() => {
    let isActive = true

    async function loadPreviousWeekState() {
      const hasPlan = await hasFilledMealPlanForWeek(prevWeekStart)

      if (isActive) {
        setCanCopyLastWeek(hasPlan)
      }
    }

    void loadPreviousWeekState().catch(() => {
      if (isActive) {
        setCanCopyLastWeek(false)
      }
    })

    return () => {
      isActive = false
    }
  }, [prevWeekStart])

  const goToWeek = useCallback(
    (weekStart: string) => {
      setSelectedSlotId(null)
      dismissOverwriteConfirmation()
      router.push(`/meal-plan/${weekStart}`)
    },
    [dismissOverwriteConfirmation, router]
  )

  async function saveRecipeSlot(recipeId: string, servings: ServingDraft[]) {
    if (!selectedSlot) return

    setIsSavingSlot(true)
    try {
      await updateSlotRecipe(selectedSlot.id, recipeId)
      await updateServings(selectedSlot.id, servings)
      setSelectedSlotId(null)
    } finally {
      setIsSavingSlot(false)
    }
  }

  async function saveFreeTextSlot(freeText: string) {
    if (!selectedSlot) return

    setIsSavingSlot(true)
    try {
      await updateSlotFreeText(selectedSlot.id, freeText)
      setSelectedSlotId(null)
    } finally {
      setIsSavingSlot(false)
    }
  }

  async function clearSelectedSlot() {
    if (!selectedSlot) return

    setIsSavingSlot(true)
    try {
      await clearSlot(selectedSlot.id)
      setSelectedSlotId(null)
    } finally {
      setIsSavingSlot(false)
    }
  }

  if (!isNormalized) {
    return (
      <div className="rounded-[10px] border border-border bg-card px-3 py-8 text-center text-[13px] text-text-mid">
        Loading week...
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <header className="rounded-[10px] bg-green-dark px-4 py-[14px] text-cream">
        <p className="text-[10px] font-normal tracking-[0.06em] text-green-muted">
          Meal planning
        </p>
        <h2 className="mt-1 text-[19px] font-semibold">Weekly plan</h2>
        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-green-muted">
          Plan recipes or simple free-text meals for each family slot.
        </p>
      </header>

      <WeekNavBar
        weekLabel={weekLabel}
        isCurrentWeek={isCurrentWeek}
        canCopyLastWeek={canCopyLastWeek}
        isCopying={isCopying}
        onPrev={() => goToWeek(prevWeekStart)}
        onNext={() => goToWeek(nextWeekStart)}
        onToday={() => goToWeek(getWeekStart(new Date()))}
        onCopyLastWeek={() => void copyPreviousWeek(false)}
      />

      {confirmOverwrite ? (
        <div className="rounded-[10px] border border-border bg-card px-3 py-3">
          <p className="text-[13px] font-semibold text-text-dark">
            Replace this week&apos;s filled slots?
          </p>
          <p className="mt-1 text-[11px] leading-5 text-text-mid">
            Copying last week will overwrite the meals already planned here.
          </p>
          <div className="mt-3 flex flex-col gap-2 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={dismissOverwriteConfirmation}
              className="rounded-[10px] bg-idle-bg px-4 py-[11px] text-[13px] font-semibold text-text-mid"
            >
              Keep current week
            </button>
            <button
              type="button"
              onClick={() => void copyPreviousWeek(true)}
              className="rounded-[10px] bg-green-dark px-4 py-[11px] text-[13px] font-semibold text-cream"
            >
              Replace with last week
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-[10px] bg-rejected-bg px-3 py-2 text-[12px] text-rejected-text">
          {error}
        </p>
      ) : null}

      {isLoading || !plan ? (
        <div className="rounded-[10px] border border-border bg-card px-3 py-8 text-center text-[13px] text-text-mid">
          Loading meal plan...
        </div>
      ) : (
        <WeekGrid plan={plan} onSlotClick={(slot) => setSelectedSlotId(slot.id)} />
      )}

      <SlotEditor
        slot={selectedSlot}
        isOpen={Boolean(selectedSlot)}
        isSaving={isSavingSlot}
        onClose={() => setSelectedSlotId(null)}
        onSaveRecipe={saveRecipeSlot}
        onSaveFreeText={saveFreeTextSlot}
        onClear={clearSelectedSlot}
      />
    </section>
  )
}
