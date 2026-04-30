"use client"

import { PlaceholderPage } from "@/shared/components/PlaceholderPage"

export default function NewRecipePage() {
  return (
    <PlaceholderPage
      title="New recipe"
      description="Recipe creation will collect ingredients, steps, tags, and per-person notes."
      actions={["Validate form fields", "Save through recipe service", "Return to the recipe library"]}
    />
  )
}
