"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { getWeekStart } from "@/shared/lib/services/meal-plan-service"

export default function MealPlanPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/meal-plan/${getWeekStart(new Date())}`)
  }, [router])

  return (
    <div className="rounded-[10px] border border-border bg-card px-3 py-8 text-center text-[13px] text-text-mid">
      Loading this week...
    </div>
  )
}

