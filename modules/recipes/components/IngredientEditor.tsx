"use client"

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form"
import { useFieldArray } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"

import type { RecipeFormValues } from "@/modules/recipes/schemas/recipe-form-schema"

type IngredientEditorProps = {
  control: Control<RecipeFormValues>
  register: UseFormRegister<RecipeFormValues>
  errors: FieldErrors<RecipeFormValues>
}

export function IngredientEditor({
  control,
  register,
  errors,
}: IngredientEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  })

  return (
    <section className="rounded-[10px] border border-border bg-card px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold">Ingredients</h3>
        <button
          type="button"
          onClick={() =>
            append({ name: "", quantity: undefined, unit: "", notes: "" })
          }
          className="inline-flex items-center gap-1 rounded-[10px] bg-green-mid px-3 py-2 text-[12px] font-semibold text-cream"
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          Add
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-[8px] border border-border px-[10px] py-3"
          >
            <div className="grid gap-2 md:grid-cols-[1fr_100px_100px_auto]">
              <label className="block">
                <span className="text-[10px] text-text-muted">Name</span>
                <input
                  {...register(`ingredients.${index}.name`)}
                  className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
                />
              </label>
              <label className="block">
                <span className="text-[10px] text-text-muted">Quantity</span>
                <input
                  {...register(`ingredients.${index}.quantity`)}
                  inputMode="decimal"
                  className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
                />
              </label>
              <label className="block">
                <span className="text-[10px] text-text-muted">Unit</span>
                <input
                  {...register(`ingredients.${index}.unit`)}
                  className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
                />
              </label>
              <button
                type="button"
                onClick={() => remove(index)}
                className="self-end rounded-[10px] bg-idle-bg p-2 text-text-mid"
                aria-label="Remove ingredient"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>
            <label className="mt-2 block">
              <span className="text-[10px] text-text-muted">Notes</span>
              <input
                {...register(`ingredients.${index}.notes`)}
                className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
              />
            </label>
            {errors.ingredients?.[index]?.name ? (
              <p className="mt-2 text-[11px] text-rejected-text">
                {errors.ingredients[index]?.name?.message}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
