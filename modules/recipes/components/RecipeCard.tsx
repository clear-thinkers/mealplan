"use client"

import Link from "next/link"
import { Clock, Users } from "lucide-react"

import type { RecipeSummary } from "@/modules/recipes/types"

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  const totalMinutes = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0)

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="block rounded-[10px] border border-border bg-card px-3 py-3 transition-colors hover:border-green-light"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-semibold text-text-dark">
            {recipe.name}
          </h3>
          {recipe.description ? (
            <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-text-mid">
              {recipe.description}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full bg-idle-bg px-2 py-1 text-[10px] font-normal text-idle-text">
          {recipe.ingredientCount} items
        </span>
      </div>

      {recipe.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-olive px-2 py-1 text-[10px] font-normal text-[#F0F0E8]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-3 text-[10px] text-text-muted">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" strokeWidth={1.8} />
          {recipe.serves} servings
        </span>
        {totalMinutes > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.8} />
            {totalMinutes} min
          </span>
        ) : null}
      </div>
    </Link>
  )
}
