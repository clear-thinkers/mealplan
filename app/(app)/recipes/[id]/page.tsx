"use client"

import { PlaceholderPage } from "@/shared/components/PlaceholderPage"

export default function RecipeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <PlaceholderPage
      title="Recipe detail"
      description={`Mobile cooking view placeholder for recipe ${params.id}.`}
      actions={["Show ingredients", "Show ordered steps", "Show family member notes"]}
    />
  )
}
