"use client"

import type { MealPlanDetail, MealTime, SlotDetail } from "@/modules/meal-plan/types"
import { MEAL_TIME_LABELS, MEAL_TIMES } from "@/shared/lib/constants"

import { SlotCell } from "./SlotCell"

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function parseWeekStart(weekStart: string): Date {
  const [year, month, day] = weekStart.split("-").map(Number)

  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export function buildSlotKey(dayOfWeek: number, mealTime: MealTime): string {
  return `${dayOfWeek}-${mealTime}`
}

function getDayDate(weekStart: string, dayOfWeek: number): Date {
  const date = parseWeekStart(weekStart)

  date.setDate(date.getDate() + dayOfWeek)

  return date
}

type WeekGridProps = {
  plan: MealPlanDetail
  onSlotClick: (slot: SlotDetail) => void
}

export function WeekGrid({ plan, onSlotClick }: WeekGridProps) {
  const slotsByKey = new Map(
    plan.slots.map((slot) => [buildSlotKey(slot.dayOfWeek, slot.mealTime), slot])
  )

  return (
    <div className="overflow-x-auto rounded-[10px] border border-border bg-card">
      <div className="grid min-w-[960px] grid-cols-[96px_repeat(7,minmax(120px,1fr))]">
        <div className="sticky left-0 z-10 border-b border-r border-border bg-card px-3 py-3" />
        {dayLabels.map((label, dayOfWeek) => {
          const date = getDayDate(plan.weekStart, dayOfWeek)

          return (
            <div
              key={label}
              className="border-b border-border px-3 py-3 text-center"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                {label}
              </p>
              <p className="mt-1 text-[13px] font-semibold text-text-dark">
                {date.getDate()}
              </p>
            </div>
          )
        })}

        {MEAL_TIMES.map((mealTime) => (
          <div key={mealTime} className="contents">
            <div className="sticky left-0 z-10 flex items-center border-r border-t border-border bg-card px-3 py-3">
              <span className="text-[11px] font-semibold text-text-mid">
                {MEAL_TIME_LABELS[mealTime]}
              </span>
            </div>
            {dayLabels.map((_, dayOfWeek) => {
              const slot = slotsByKey.get(buildSlotKey(dayOfWeek, mealTime))

              return (
                <div key={`${dayOfWeek}-${mealTime}`} className="border-t border-border p-2">
                  {slot ? (
                    <SlotCell slot={slot} onClick={() => onSlotClick(slot)} />
                  ) : (
                    <div className="min-h-24 rounded-[10px] border border-dashed border-border-dashed bg-cream" />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
