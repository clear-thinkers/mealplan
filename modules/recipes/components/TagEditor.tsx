"use client"

import type { UseFormRegister } from "react-hook-form"

import type { RecipeFormValues } from "@/modules/recipes/schemas/recipe-form-schema"

export function TagEditor({
  register,
}: {
  register: UseFormRegister<RecipeFormValues>
}) {
  return (
    <section className="rounded-[10px] border border-border bg-card px-3 py-3">
      <label className="block">
        <span className="text-[14px] font-semibold text-text-dark">Tags</span>
        <input
          {...register("tagsText")}
          placeholder="quick, soup, 上海菜"
          className="mt-2 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
        />
      </label>
      <p className="mt-2 text-[10px] text-text-muted">
        Separate tags with commas or new lines.
      </p>
    </section>
  )
}
