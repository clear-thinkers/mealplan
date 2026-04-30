"use client"

import { PlaceholderPage } from "@/shared/components/PlaceholderPage"

export default function DashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Weekly overview, today's meals, and fast entry points will live here."
      actions={["Show today's planned meals", "Surface a quick log action", "Summarize the current week"]}
    />
  )
}
