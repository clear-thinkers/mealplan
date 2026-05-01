"use client"

import type { PlannedServing } from "@/modules/meal-plan/types"
import { cn } from "@/shared/lib/utils"

const avatarClassByMemberId: Record<PlannedServing["familyMemberId"], string> = {
  chengyuan: "bg-[#2D5240]",
  fu: "bg-[#4A7C5F]",
  nora: "bg-[#6B9E7A]",
  freddie: "bg-[#8ABE9A]",
}

type MemberServingRowProps = {
  member: {
    id: PlannedServing["familyMemberId"]
    name: string
    nickname: string
    color: string
  }
  serving: PlannedServing | undefined
  onChange: (included: boolean, portionNotes: string | undefined) => void
}

export function MemberServingRow({
  member,
  serving,
  onChange,
}: MemberServingRowProps) {
  const included = serving?.included ?? true
  const portionNotes = serving?.portionNotes ?? ""
  const initials = member.nickname || member.name.slice(0, 1)

  return (
    <div className="rounded-[10px] border border-border bg-card px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-card",
              avatarClassByMemberId[member.id]
            )}
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-text-dark">
              {member.name}
            </p>
            {member.nickname ? (
              <p className="text-[10px] text-text-muted">{member.nickname}</p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange(!included, included ? undefined : portionNotes)}
          className={
            included
              ? "rounded-[20px] bg-green-mid px-3 py-1.5 text-[10px] font-semibold text-cream"
              : "rounded-[20px] bg-idle-bg px-3 py-1.5 text-[10px] font-semibold text-idle-text"
          }
        >
          {included ? "Included" : "Off"}
        </button>
      </div>

      {included ? (
        <label className="mt-3 block">
          <span className="text-[10px] text-text-muted">Portion notes</span>
          <textarea
            value={portionNotes}
            onChange={(event) => onChange(true, event.target.value || undefined)}
            rows={2}
            placeholder="Optional"
            className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
          />
        </label>
      ) : null}
    </div>
  )
}
