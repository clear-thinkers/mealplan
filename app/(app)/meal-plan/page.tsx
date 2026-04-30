"use client"

import { PlaceholderPage } from "@/shared/components/PlaceholderPage"

export default function MealPlanPage() {
  return (
    <PlaceholderPage
      title="Meal plan"
      description="The current week grid will organize meals by day, meal time, and family member."
      actions={["Show this week's grid", "Assign recipes or free-text meals", "Copy a prior week"]}
    />
  )
}
