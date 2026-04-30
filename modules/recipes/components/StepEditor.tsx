"use client"

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form"
import { useFieldArray } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"

import type { RecipeFormValues } from "@/modules/recipes/schemas/recipe-form-schema"

type StepEditorProps = {
  control: Control<RecipeFormValues>
  register: UseFormRegister<RecipeFormValues>
  errors: FieldErrors<RecipeFormValues>
}

export function StepEditor({ control, register, errors }: StepEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps",
  })

  return (
    <section className="rounded-[10px] border border-border bg-card px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold">Steps</h3>
        <button
          type="button"
          onClick={() => append({ instruction: "" })}
          className="inline-flex items-center gap-1 rounded-[10px] bg-green-mid px-3 py-2 text-[12px] font-semibold text-cream"
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          Add
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <span className="mt-7 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-mid text-[10px] font-semibold text-cream">
              {index + 1}
            </span>
            <label className="block min-w-0 flex-1">
              <span className="text-[10px] text-text-muted">Instruction</span>
              <textarea
                {...register(`steps.${index}.instruction`)}
                rows={3}
                className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] leading-5 outline-none focus:border-green-mid"
              />
              {errors.steps?.[index]?.instruction ? (
                <p className="mt-1 text-[11px] text-rejected-text">
                  {errors.steps[index]?.instruction?.message}
                </p>
              ) : null}
            </label>
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-6 rounded-[10px] bg-idle-bg p-2 text-text-mid"
              aria-label="Remove step"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
