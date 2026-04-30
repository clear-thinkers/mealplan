"use client"

import Link from "next/link"
import { Edit, Trash2 } from "lucide-react"

import type { RecipeDetail as RecipeDetailType } from "@/modules/recipes/types"
import { FAMILY_MEMBERS } from "@/shared/lib/constants"

type RecipeDetailProps = {
  recipe: RecipeDetailType
  onDelete: () => void
}

export function RecipeDetail({ recipe, onDelete }: RecipeDetailProps) {
  const memberNames = new Map(
    FAMILY_MEMBERS.map((member) => [member.id, member.nickname || member.name])
  )
  const totalMinutes = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0)

  return (
    <article className="space-y-4">
      <header className="rounded-[10px] bg-green-dark px-4 py-[14px] text-cream">
        <p className="text-[10px] font-normal tracking-[0.06em] text-green-muted">
          Recipe detail
        </p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-[19px] font-semibold">{recipe.name}</h2>
            {recipe.description ? (
              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-green-muted">
                {recipe.description}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="inline-flex items-center gap-2 rounded-[10px] bg-green-mid px-3 py-2 text-[12px] font-semibold text-cream"
            >
              <Edit className="h-4 w-4" strokeWidth={1.8} />
              Edit
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-[10px] bg-idle-bg px-3 py-2 text-[12px] font-semibold text-text-mid"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
              Delete
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-2 md:grid-cols-4">
        <div className="rounded-[10px] border border-border bg-card px-3 py-3">
          <p className="text-[10px] font-normal text-text-muted">Serves</p>
          <p className="mt-1 text-[14px] font-semibold">{recipe.serves}</p>
        </div>
        <div className="rounded-[10px] border border-border bg-card px-3 py-3">
          <p className="text-[10px] font-normal text-text-muted">Prep</p>
          <p className="mt-1 text-[14px] font-semibold">
            {recipe.prepMinutes ?? 0} min
          </p>
        </div>
        <div className="rounded-[10px] border border-border bg-card px-3 py-3">
          <p className="text-[10px] font-normal text-text-muted">Cook</p>
          <p className="mt-1 text-[14px] font-semibold">
            {recipe.cookMinutes ?? 0} min
          </p>
        </div>
        <div className="rounded-[10px] border border-border bg-card px-3 py-3">
          <p className="text-[10px] font-normal text-text-muted">Total</p>
          <p className="mt-1 text-[14px] font-semibold">{totalMinutes} min</p>
        </div>
      </section>

      {recipe.tags.length > 0 ? (
        <section className="flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-olive px-2 py-1 text-[10px] font-normal text-[#F0F0E8]"
            >
              {tag}
            </span>
          ))}
        </section>
      ) : null}

      <section className="rounded-[10px] border border-border bg-card px-3 py-3">
        <h3 className="text-[14px] font-semibold">Ingredients</h3>
        <div className="mt-3 space-y-2">
          {recipe.ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="rounded-[8px] border border-border px-[10px] py-2"
            >
              <p className="text-[13px] text-text-dark">
                {ingredient.name}
                {ingredient.quantity ? ` · ${ingredient.quantity}` : ""}
                {ingredient.unit ? ` ${ingredient.unit}` : ""}
              </p>
              {ingredient.notes ? (
                <p className="mt-1 text-[10px] text-text-mid">
                  {ingredient.notes}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[10px] border border-border bg-card px-3 py-3">
        <h3 className="text-[14px] font-semibold">Steps</h3>
        <ol className="mt-3 space-y-2">
          {recipe.steps.map((step) => (
            <li key={step.id} className="flex gap-3 text-[13px] leading-5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-mid text-[10px] font-semibold text-cream">
                {step.stepNumber}
              </span>
              <span>{step.instruction}</span>
            </li>
          ))}
        </ol>
      </section>

      {recipe.memberNotes.length > 0 ? (
        <section className="rounded-[10px] border border-border bg-card px-3 py-3">
          <h3 className="text-[14px] font-semibold">Family notes</h3>
          <div className="mt-3 space-y-2">
            {recipe.memberNotes.map((note) => (
              <div key={note.id} className="rounded-[8px] bg-idle-bg px-3 py-2">
                <p className="text-[11px] font-semibold text-text-mid">
                  {memberNames.get(note.familyMemberId)}
                </p>
                <p className="mt-1 text-[13px] text-text-dark">{note.notes}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {recipe.source ? (
        <p className="text-[10px] text-text-muted">Source: {recipe.source}</p>
      ) : null}
    </article>
  )
}
