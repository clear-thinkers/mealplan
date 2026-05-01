"use client"

import { X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { MemberServingRow } from "@/modules/meal-plan/components/MemberServingRow"
import { RecipePicker } from "@/modules/meal-plan/components/RecipePicker"
import type { PlannedServing, SlotDetail } from "@/modules/meal-plan/types"
import { FAMILY_MEMBERS, MEAL_TIME_LABELS } from "@/shared/lib/constants"
import { cn } from "@/shared/lib/utils"

const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

type ServingDraft = Pick<
  PlannedServing,
  "familyMemberId" | "included" | "portionNotes"
>

type SlotEditorProps = {
  slot: SlotDetail | null
  isOpen: boolean
  isSaving: boolean
  onClose: () => void
  onSaveRecipe: (recipeId: string, servings: ServingDraft[]) => Promise<void>
  onSaveFreeText: (freeText: string) => Promise<void>
  onClear: () => Promise<void>
}

function buildDefaultServings(slot: SlotDetail | null): ServingDraft[] {
  return FAMILY_MEMBERS.map((member) => {
    const existing = slot?.servings.find(
      (serving) => serving.familyMemberId === member.id
    )

    return {
      familyMemberId: member.id,
      included: existing?.included ?? true,
      portionNotes: existing?.portionNotes,
    }
  })
}

function serializeServings(servings: ServingDraft[]): string {
  return JSON.stringify(
    servings.map((serving) => ({
      familyMemberId: serving.familyMemberId,
      included: serving.included,
      portionNotes: serving.portionNotes?.trim() || undefined,
    }))
  )
}

export function SlotEditor({
  slot,
  isOpen,
  isSaving,
  onClose,
  onSaveRecipe,
  onSaveFreeText,
  onClear,
}: SlotEditorProps) {
  const [mode, setMode] = useState<"recipe" | "freeText" | "empty">("empty")
  const [recipeId, setRecipeId] = useState<string | undefined>()
  const [freeText, setFreeText] = useState("")
  const [servings, setServings] = useState<ServingDraft[]>([])

  useEffect(() => {
    if (!slot) return

    setMode(slot.recipeId ? "recipe" : slot.freeText ? "freeText" : "empty")
    setRecipeId(slot.recipeId)
    setFreeText(slot.freeText ?? "")
    setServings(buildDefaultServings(slot))
  }, [slot])

  const initialServingSignature = useMemo(
    () => serializeServings(buildDefaultServings(slot)),
    [slot]
  )
  const currentServingSignature = serializeServings(servings)
  const hasChanges =
    Boolean(slot) &&
    (mode !== (slot?.recipeId ? "recipe" : slot?.freeText ? "freeText" : "empty") ||
      recipeId !== slot?.recipeId ||
      freeText.trim() !== (slot?.freeText ?? "") ||
      currentServingSignature !== initialServingSignature)
  const canSave =
    hasChanges &&
    (mode === "recipe" ? Boolean(recipeId) : mode === "freeText" ? Boolean(freeText.trim()) : false)

  async function save() {
    if (!slot) return

    if (mode === "recipe" && recipeId) {
      await onSaveRecipe(recipeId, servings)
    }

    if (mode === "freeText" && freeText.trim()) {
      await onSaveFreeText(freeText.trim())
    }
  }

  if (!slot) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 transition-opacity",
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <button
        type="button"
        aria-label="Close slot editor"
        onClick={onClose}
        className="absolute inset-0 bg-text-dark/30"
      />
      <aside
        className={cn(
          "absolute bottom-0 right-0 flex max-h-[92vh] w-full flex-col rounded-t-[10px] border border-border bg-cream transition-transform md:bottom-auto md:top-0 md:h-full md:max-h-none md:w-[420px] md:rounded-l-[10px] md:rounded-tr-none",
          isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full md:translate-y-0"
        )}
      >
        <header className="flex items-start justify-between gap-3 rounded-t-[10px] bg-green-dark px-4 py-[14px] text-cream md:rounded-l-[10px] md:rounded-tr-none">
          <div className="min-w-0">
            <p className="text-[10px] font-normal tracking-[0.06em] text-green-muted">
              Meal slot
            </p>
            <h2 className="mt-1 truncate text-[18px] font-semibold">
              {dayNames[slot.dayOfWeek]} - {MEAL_TIME_LABELS[slot.mealTime]}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-green-mid text-cream"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <RecipePicker
            selectedId={recipeId}
            currentFreeText={mode === "freeText" ? freeText : undefined}
            canClear={Boolean(slot.recipeId || slot.freeText)}
            onSelectRecipe={(nextRecipeId) => {
              setMode("recipe")
              setRecipeId(nextRecipeId)
              setFreeText("")
              setServings(buildDefaultServings(slot))
            }}
            onSelectFreeText={(text) => {
              setMode("freeText")
              setRecipeId(undefined)
              setFreeText(text)
            }}
            onClear={() => {
              setMode("empty")
              setRecipeId(undefined)
              setFreeText("")
            }}
          />

          {mode === "recipe" && recipeId ? (
            <section className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                Servings
              </p>
              {FAMILY_MEMBERS.map((member) => {
                const serving = servings.find(
                  (item) => item.familyMemberId === member.id
                )

                return (
                  <MemberServingRow
                    key={member.id}
                    member={member}
                    serving={
                      serving
                        ? {
                            id: member.id,
                            mealPlanSlotId: slot.id,
                            familyMemberId: serving.familyMemberId,
                            included: serving.included,
                            portionNotes: serving.portionNotes,
                          }
                        : undefined
                    }
                    onChange={(included, portionNotes) => {
                      setServings((current) =>
                        current.map((item) =>
                          item.familyMemberId === member.id
                            ? { ...item, included, portionNotes }
                            : item
                        )
                      )
                    }}
                  />
                )
              })}
            </section>
          ) : null}
        </div>

        <footer className="grid gap-2 border-t border-border bg-card px-4 py-3 md:grid-cols-2">
          <button
            type="button"
            onClick={async () => {
              await onClear()
            }}
            disabled={isSaving || !slot || (!slot.recipeId && !slot.freeText)}
            className="rounded-[10px] bg-idle-bg px-4 py-[11px] text-[13px] font-semibold text-text-mid disabled:opacity-60"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isSaving || !canSave}
            className="rounded-[10px] bg-green-dark px-4 py-[11px] text-[13px] font-semibold text-cream disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </footer>
      </aside>
    </div>
  )
}
