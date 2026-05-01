"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"

import { usePantrySeasonings } from "@/modules/controls/hooks/usePantrySeasonings"

export function PantrySeasoningsManager() {
  const {
    seasonings,
    isLoading,
    error,
    addSeasoning,
    updateSeasoning,
    removeSeasoning,
    moveSeasoning,
    seedDefaults,
  } = usePantrySeasonings()
  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")

  async function handleAdd() {
    await addSeasoning(name, notes)
    setName("")
    setNotes("")
  }

  return (
    <section className="rounded-[10px] border border-border bg-card px-3 py-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] font-normal tracking-[0.06em] text-text-muted">
            Pantry seasonings
          </p>
          <h3 className="mt-1 text-[14px] font-semibold text-text-dark">
            Kitchen staples
          </h3>
          <p className="mt-1 max-w-2xl text-[11px] leading-5 text-text-mid">
            Maintain the seasonings that appear in recipe quick-select and flag
            low-stock items for shopping later.
          </p>
        </div>
        {seasonings.length === 0 && !isLoading ? (
          <button
            type="button"
            onClick={() => void seedDefaults()}
            className="rounded-[10px] bg-green-mid px-3 py-[11px] text-[12px] font-semibold text-cream"
          >
            Add common staples
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="text-[10px] text-text-muted">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
          />
        </label>
        <label className="block">
          <span className="text-[10px] text-text-muted">Notes</span>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
          />
        </label>
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={!name.trim()}
          className="inline-flex items-center justify-center gap-2 self-end rounded-[10px] bg-green-dark px-4 py-[11px] text-[13px] font-semibold text-cream disabled:opacity-60"
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          Add
        </button>
      </div>

      {error ? (
        <p className="mt-3 rounded-[10px] bg-rejected-bg px-3 py-2 text-[12px] text-rejected-text">
          {error}
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <p className="rounded-[8px] border border-border bg-cream px-3 py-3 text-[12px] text-text-mid">
            Loading pantry seasonings...
          </p>
        ) : null}

        {!isLoading && seasonings.length === 0 ? (
          <p className="rounded-[8px] border border-dashed bg-cream px-3 py-3 text-[12px] text-text-mid">
            No pantry seasonings yet.
          </p>
        ) : null}

        {seasonings.map((seasoning, index) => (
          <div
            key={seasoning.id}
            className="grid gap-2 rounded-[8px] border border-border px-[10px] py-3 md:grid-cols-[1fr_auto]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={seasoning.name}
                  onChange={(event) =>
                    void updateSeasoning(seasoning.id, {
                      name: event.target.value,
                    })
                  }
                  className="min-w-0 flex-1 rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] font-semibold text-text-dark outline-none focus:border-green-mid"
                  aria-label={`Name for ${seasoning.name}`}
                />
                <label className="inline-flex items-center gap-2 rounded-[20px] bg-idle-bg px-3 py-2 text-[11px] font-normal text-text-mid">
                  <input
                    type="checkbox"
                    checked={seasoning.isLow}
                    onChange={(event) =>
                      void updateSeasoning(seasoning.id, {
                        isLow: event.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded-[4px] accent-green-mid"
                  />
                  Low
                </label>
              </div>
              <input
                value={seasoning.notes ?? ""}
                onChange={(event) =>
                  void updateSeasoning(seasoning.id, {
                    notes: event.target.value,
                  })
                }
                placeholder="Notes"
                className="mt-2 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[12px] text-text-mid outline-none focus:border-green-mid"
                aria-label={`Notes for ${seasoning.name}`}
              />
            </div>

            <div className="flex items-center gap-1 md:justify-end">
              <button
                type="button"
                onClick={() => void moveSeasoning(seasoning.id, "up")}
                disabled={index === 0}
                className="rounded-[10px] bg-idle-bg p-2 text-text-mid disabled:opacity-40"
                aria-label={`Move ${seasoning.name} up`}
              >
                <ArrowUp className="h-4 w-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => void moveSeasoning(seasoning.id, "down")}
                disabled={index === seasonings.length - 1}
                className="rounded-[10px] bg-idle-bg p-2 text-text-mid disabled:opacity-40"
                aria-label={`Move ${seasoning.name} down`}
              >
                <ArrowDown className="h-4 w-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => void removeSeasoning(seasoning.id)}
                className="rounded-[10px] bg-idle-bg p-2 text-text-mid"
                aria-label={`Remove ${seasoning.name}`}
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
