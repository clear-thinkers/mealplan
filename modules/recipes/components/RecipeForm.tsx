"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { type Resolver, useForm } from "react-hook-form"

import { IngredientEditor } from "@/modules/recipes/components/IngredientEditor"
import { MemberNotesEditor } from "@/modules/recipes/components/MemberNotesEditor"
import { StepEditor } from "@/modules/recipes/components/StepEditor"
import { TagEditor } from "@/modules/recipes/components/TagEditor"
import {
  createRecipeInputSchema,
  recipeFormSchema,
  type RecipeFormData,
  type RecipeFormValues,
} from "@/modules/recipes/schemas/recipe-form-schema"

type RecipeFormProps = {
  title: string
  description: string
  defaultValues: RecipeFormValues
  submitLabel: string
  onSubmit: (data: RecipeFormData) => Promise<void>
}

export function RecipeForm({
  title,
  description,
  defaultValues,
  submitLabel,
  onSubmit,
}: RecipeFormProps) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema) as Resolver<RecipeFormValues>,
    defaultValues,
  })

  async function submit(values: RecipeFormValues) {
    const parsed = createRecipeInputSchema.safeParse(values)

    if (!parsed.success) {
      setError("root", {
        message: parsed.error.issues[0]?.message ?? "Check the recipe fields.",
      })
      return
    }

    try {
      await onSubmit(parsed.data)
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error ? error.message : "Recipe could not be saved.",
      })
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <header className="rounded-[10px] bg-green-dark px-4 py-[14px] text-cream">
        <p className="text-[10px] font-normal tracking-[0.06em] text-green-muted">
          Recipe library
        </p>
        <h2 className="mt-1 text-[19px] font-semibold">{title}</h2>
        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-green-muted">
          {description}
        </p>
      </header>

      <section className="rounded-[10px] border border-border bg-card px-3 py-3">
        <div className="grid gap-3 md:grid-cols-[1fr_120px_120px_120px]">
          <label className="block">
            <span className="text-[10px] text-text-muted">Name</span>
            <input
              {...register("name")}
              className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
            />
            {errors.name ? (
              <p className="mt-1 text-[11px] text-rejected-text">
                {errors.name.message}
              </p>
            ) : null}
          </label>
          <label className="block">
            <span className="text-[10px] text-text-muted">Serves</span>
            <input
              {...register("serves")}
              inputMode="numeric"
              className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
            />
          </label>
          <label className="block">
            <span className="text-[10px] text-text-muted">Prep min</span>
            <input
              {...register("prepMinutes")}
              inputMode="numeric"
              className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
            />
          </label>
          <label className="block">
            <span className="text-[10px] text-text-muted">Cook min</span>
            <input
              {...register("cookMinutes")}
              inputMode="numeric"
              className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
            />
          </label>
        </div>

        <label className="mt-3 block">
          <span className="text-[10px] text-text-muted">Description</span>
          <textarea
            {...register("description")}
            rows={3}
            className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
          />
        </label>

        <label className="mt-3 block">
          <span className="text-[10px] text-text-muted">Source</span>
          <input
            {...register("source")}
            className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
          />
        </label>
      </section>

      <TagEditor register={register} />
      <IngredientEditor control={control} errors={errors} register={register} />
      <StepEditor control={control} errors={errors} register={register} />
      <MemberNotesEditor control={control} register={register} />

      {errors.root ? (
        <p className="rounded-[10px] bg-rejected-bg px-3 py-2 text-[12px] text-rejected-text">
          {errors.root.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 md:flex-row md:justify-end">
        <Link
          href="/recipes"
          className="rounded-[10px] bg-idle-bg px-4 py-[11px] text-center text-[13px] font-semibold text-text-mid"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[10px] bg-green-dark px-4 py-[11px] text-[13px] font-semibold text-cream disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  )
}
