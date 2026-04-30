"use client"

import { Download, Upload } from "lucide-react"

export default function SettingsPage() {
  return (
    <section className="space-y-4">
      <header className="rounded-[10px] bg-green-dark px-4 py-[14px] text-cream">
        <p className="text-[10px] font-normal tracking-[0.06em] text-green-muted">
          Local data
        </p>
        <h2 className="mt-1 text-[19px] font-semibold">Settings</h2>
        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-green-muted">
          Export, import, and store preference tools will live here.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-[10px] border border-border bg-card px-3 py-3">
          <div className="flex items-start gap-3">
            <div className="rounded-[10px] bg-green-mid p-2 text-cream">
              <Download className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text-dark">
                Export data
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-text-mid">
                Save all IndexedDB tables as one JSON file for OneDrive backup.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="mt-4 w-full rounded-[10px] bg-green-dark px-3 py-[11px] text-[13px] font-semibold text-cream opacity-60"
          >
            Export coming soon
          </button>
        </section>

        <section className="rounded-[10px] border border-border bg-card px-3 py-3">
          <div className="flex items-start gap-3">
            <div className="rounded-[10px] bg-green-mid p-2 text-cream">
              <Upload className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-text-dark">
                Import data
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-text-mid">
                Restore or merge a validated JSON backup into local IndexedDB.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="mt-4 w-full rounded-[10px] bg-green-dark px-3 py-[11px] text-[13px] font-semibold text-cream opacity-60"
          >
            Import coming soon
          </button>
        </section>
      </div>

      <section className="rounded-[10px] border border-border bg-card px-3 py-3">
        <h3 className="text-[14px] font-semibold text-text-dark">
          Store preferences
        </h3>
        <p className="mt-1 text-[11px] leading-5 text-text-mid">
          Ingredient-to-store mappings will be managed here once shopping lists
          are implemented.
        </p>
      </section>
    </section>
  )
}
