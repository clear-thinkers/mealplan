import { getWeekStart } from "@/shared/lib/services/meal-plan-service"

function parseWeekStart(weekStart: string): Date {
  const [year, month, day] = weekStart.split("-").map(Number)

  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatDay(date: Date, includeMonth: boolean): string {
  return new Intl.DateTimeFormat("en-US", {
    month: includeMonth ? "short" : undefined,
    day: "numeric",
  }).format(date)
}

export function formatWeekLabel(weekStart: string): string {
  const start = parseWeekStart(weekStart)
  const end = parseWeekStart(weekStart)

  end.setDate(end.getDate() + 6)

  const sameMonth = start.getMonth() === end.getMonth()
  const sameYear = start.getFullYear() === end.getFullYear()
  const startLabel = formatDay(start, true)
  const endLabel = sameMonth
    ? formatDay(end, false)
    : formatDay(end, true)
  const yearLabel = sameYear
    ? String(end.getFullYear())
    : `${start.getFullYear()} / ${end.getFullYear()}`

  return `${startLabel} - ${endLabel}, ${yearLabel}`
}

export function useWeekNavigation(weekStart: string) {
  const start = parseWeekStart(weekStart)
  const prev = parseWeekStart(weekStart)
  const next = parseWeekStart(weekStart)

  prev.setDate(start.getDate() - 7)
  next.setDate(start.getDate() + 7)

  return {
    prevWeekStart: toIsoDate(prev),
    nextWeekStart: toIsoDate(next),
    weekLabel: formatWeekLabel(weekStart),
    isCurrentWeek: weekStart === getWeekStart(new Date()),
  }
}

