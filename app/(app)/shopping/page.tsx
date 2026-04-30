"use client"

import { PlaceholderPage } from "@/shared/components/PlaceholderPage"

export default function ShoppingPage() {
  return (
    <PlaceholderPage
      title="Shopping"
      description="Shopping lists will be generated from meal plans and grouped by preferred store."
      actions={["Group by store", "Track checked items", "Export a standalone HTML list"]}
    />
  )
}
