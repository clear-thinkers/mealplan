"use client"

import Link from "next/link"
import { ArrowLeft, Store } from "lucide-react"

export default function StorePreferencesPage() {
  return (
    <section className="space-y-4">
      <header className="rounded-[10px] bg-green-dark px-4 py-[14px] text-cream">
        <Link
          href="/controls"
          className="inline-flex items-center gap-1 text-[10px] font-normal tracking-[0.06em] text-green-muted"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.8} />
          Controls
        </Link>
        <h2 className="mt-1 text-[19px] font-semibold">
          Store preferences
        </h2>
        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-green-muted">
          Ingredient-to-store mappings live here, separate from data import and
          export settings.
        </p>
      </header>

      <section className="rounded-[10px] border border-border bg-card px-3 py-3">
        <div className="flex items-start gap-3">
          <div className="rounded-[10px] bg-green-mid p-2 text-cream">
            <Store className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-text-dark">
              Mapping tools coming in Phase 4
            </h3>
            <p className="mt-1 text-[11px] leading-5 text-text-mid">
              The route is ready for the shopping preference UI. Settings now
              stays focused on export and import.
            </p>
          </div>
        </div>
      </section>
    </section>
  )
}
