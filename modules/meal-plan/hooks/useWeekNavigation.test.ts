import { describe, expect, it } from "vitest"

import {
  formatWeekLabel,
  useWeekNavigation,
} from "@/modules/meal-plan/hooks/useWeekNavigation"
import { getWeekStart } from "@/shared/lib/services/meal-plan-service"

describe("useWeekNavigation", () => {
  it("computes previous and next week starts", () => {
    const navigation = useWeekNavigation("2026-05-04")

    expect(navigation.prevWeekStart).toBe("2026-04-27")
    expect(navigation.nextWeekStart).toBe("2026-05-11")
  })

  it("detects the current week", () => {
    const currentWeek = getWeekStart(new Date())

    expect(useWeekNavigation(currentWeek).isCurrentWeek).toBe(true)
    expect(useWeekNavigation("2026-01-05").isCurrentWeek).toBe(
      currentWeek === "2026-01-05"
    )
  })

  it("formats week labels within one month", () => {
    expect(formatWeekLabel("2026-05-04")).toBe("May 4 - 10, 2026")
  })

  it("formats week labels across month boundaries", () => {
    expect(formatWeekLabel("2026-04-27")).toBe("Apr 27 - May 3, 2026")
  })
})

