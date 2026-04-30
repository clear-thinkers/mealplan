"use client"

import { PlaceholderPage } from "@/shared/components/PlaceholderPage"

export default function RecipesPage() {
  return (
    <PlaceholderPage
      title="Recipes"
      description="Recipe search and library browsing will use local IndexedDB data with Fuse search."
      actions={["Search Chinese and English recipe text", "List saved recipes", "Open recipe detail views"]}
    />
  )
}
