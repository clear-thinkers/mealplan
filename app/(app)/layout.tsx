"use client"

import { AppShell } from "@/shared/components/AppShell"
import { DexieInitializer } from "@/shared/components/DexieInitializer"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AppShell>
      <DexieInitializer />
      {children}
    </AppShell>
  )
}
