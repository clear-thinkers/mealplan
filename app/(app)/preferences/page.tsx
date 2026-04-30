"use client"

import { PlaceholderPage } from "@/shared/components/PlaceholderPage"

export default function PreferencesPage() {
  return (
    <PlaceholderPage
      title="Preferences"
      description="Per-person taste profiles will be derived from logged meal responses."
      actions={["Summarize accepted foods", "Track rejected foods", "Support manual overrides"]}
    />
  )
}
