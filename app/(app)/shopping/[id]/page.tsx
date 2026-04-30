"use client"

import { PlaceholderPage } from "@/shared/components/PlaceholderPage"

export default function ShoppingListPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <PlaceholderPage
      title="Shopping list"
      description={`Shopping list detail placeholder for ${params.id}.`}
      actions={["Show grouped items", "Allow check-off", "Prepare HTML export"]}
    />
  )
}
