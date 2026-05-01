"use client"

import { ChevronLeft, ChevronRight, Copy, Loader2 } from "lucide-react"

type WeekNavBarProps = {
  weekLabel: string
  isCurrentWeek: boolean
  canCopyLastWeek: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onCopyLastWeek: () => void
  isCopying: boolean
}

export function WeekNavBar({
  weekLabel,
  isCurrentWeek,
  canCopyLastWeek,
  onPrev,
  onNext,
  onToday,
  onCopyLastWeek,
  isCopying,
}: WeekNavBarProps) {
  return (
    <div className="rounded-[10px] border border-border bg-card px-3 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-2 md:min-w-[320px]">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous week"
            className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-idle-bg text-text-mid"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[15px] font-semibold text-text-dark">
              {weekLabel}
            </p>
            {!isCurrentWeek ? (
              <button
                type="button"
                onClick={onToday}
                className="mt-1 rounded-[20px] bg-idle-bg px-3 py-1 text-[10px] font-semibold text-text-mid"
              >
                Today
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next week"
            className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-idle-bg text-text-mid"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        <button
          type="button"
          disabled={!canCopyLastWeek || isCopying}
          onClick={onCopyLastWeek}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-green-mid px-4 py-[11px] text-[13px] font-semibold text-cream disabled:bg-idle-bg disabled:text-idle-text"
        >
          {isCopying ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
          ) : (
            <Copy className="h-4 w-4" strokeWidth={1.8} />
          )}
          {canCopyLastWeek ? "Copy last week" : "No prior plan"}
        </button>
      </div>
    </div>
  )
}

