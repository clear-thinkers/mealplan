"use client"

import { Plus } from "lucide-react"

import type { SlotDetail } from "@/modules/meal-plan/types"
import type { FamilyMemberId } from "@/modules/meal-plan/types"
import { FAMILY_MEMBERS } from "@/shared/lib/constants"
import { cn } from "@/shared/lib/utils"

const avatarClassByMemberId: Record<FamilyMemberId, string> = {
  chengyuan: "bg-[#2D5240]",
  fu: "bg-[#4A7C5F]",
  nora: "bg-[#6B9E7A]",
  freddie: "bg-[#8ABE9A]",
}

type SlotCellProps = {
  slot: SlotDetail
  onClick: () => void
}

export function SlotCell({ slot, onClick }: SlotCellProps) {
  const includedIds = new Set(
    slot.servings
      .filter((serving) => serving.included)
      .map((serving) => serving.familyMemberId)
  )
  const includedMembers = FAMILY_MEMBERS.filter((member) =>
    includedIds.has(member.id)
  )

  if (!slot.recipe && !slot.freeText) {
    return (
      <button
        type="button"
        data-testid="meal-plan-slot"
        onClick={onClick}
        className="flex min-h-24 w-full items-center justify-center rounded-[10px] border border-dashed border-border-dashed bg-cream px-2 py-3 text-text-muted transition-colors hover:border-green-light hover:text-green-mid"
      >
        <Plus className="h-5 w-5" strokeWidth={1.8} />
      </button>
    )
  }

  return (
    <button
      type="button"
      data-testid="meal-plan-slot"
      onClick={onClick}
      className="min-h-24 w-full rounded-[10px] border border-border bg-card px-3 py-3 text-left transition-colors hover:border-green-light"
    >
      {slot.recipe ? (
        <>
          <p className="truncate text-[13px] font-semibold text-text-dark">
            {slot.recipe.name}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {includedMembers.map((member) => (
              <span
                key={member.id}
                className={cn(
                  "flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1 text-[9px] font-semibold text-card",
                  avatarClassByMemberId[member.id]
                )}
              >
                {member.nickname || member.name.slice(0, 1)}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="line-clamp-3 text-[13px] italic leading-5 text-text-mid">
          {slot.freeText}
        </p>
      )}
    </button>
  )
}
