"use client"

import { PlaceholderPage } from "@/shared/components/PlaceholderPage"

export default function EditRecipePage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <PlaceholderPage
      title="Edit recipe"
      description={`Edit form placeholder for recipe ${params.id}.`}
      actions={["Load existing recipe", "Validate edits", "Persist via recipe service"]}
    />
  )
}
