"use client"

import { PlaceholderPage } from "@/shared/components/PlaceholderPage"

export default function LogPage() {
  return (
    <PlaceholderPage
      title="Meal log"
      description="Fast mobile logging will record what was eaten and each person's response."
      actions={["Default to today", "Capture ate status", "Save in under 30 seconds"]}
    />
  )
}
