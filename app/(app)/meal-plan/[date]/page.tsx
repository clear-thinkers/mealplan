"use client"

import { PlaceholderPage } from "@/shared/components/PlaceholderPage"

export default function MealPlanDatePage({
  params,
}: {
  params: { date: string }
}) {
  return (
    <PlaceholderPage
      title="Meal plan week"
      description={`Specific week placeholder for ${params.date}.`}
      actions={["Validate Monday week start", "Load planned slots", "Navigate between weeks"]}
    />
  )
}
