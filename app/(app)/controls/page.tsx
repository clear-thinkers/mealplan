"use client"

import Link from "next/link"
import { Store } from "lucide-react"

import { PantrySeasoningsManager } from "@/modules/controls/components/PantrySeasoningsManager"

export default function ControlsPage() {
  return (
    <section className="space-y-4">
      <header className="rounded-[10px] bg-green-dark px-4 py-[14px] text-cream">
        <p className="text-[10px] font-normal tracking-[0.06em] text-green-muted">
          Household controls
        </p>
        <h2 className="mt-1 text-[19px] font-semibold">Controls</h2>
        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-green-muted">
          Manage shared kitchen setup for recipe entry and future shopping.
        </p>
      </header>

      <PantrySeasoningsManager />

      <Link
        href="/controls/store-preferences"
        className="block rounded-[10px] border border-border bg-card px-3 py-3"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-[10px] bg-green-mid p-2 text-cream">
            <Store className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[10px] font-normal tracking-[0.06em] text-text-muted">
              Store preferences
            </p>
            <h3 className="mt-1 text-[14px] font-semibold text-text-dark">
              Ingredient store mapping
            </h3>
            <p className="mt-1 text-[11px] leading-5 text-text-mid">
              Set preferred stores for ingredients. The shopping service will
              use these mappings in Phase 4.
            </p>
          </div>
        </div>
      </Link>
    </section>
  )
}
