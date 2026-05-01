"use client"

import { useEffect, useMemo, useState } from "react"
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form"
import { useFieldArray, useWatch } from "react-hook-form"
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react"

import type { RecipeFormValues } from "@/modules/recipes/schemas/recipe-form-schema"
import { listPantrySeasonings } from "@/shared/lib/services/pantry-seasoning-service"

type PantrySeasoningRow = Awaited<
  ReturnType<typeof listPantrySeasonings>
>[number]

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
  const ingredients = useWatch({ control, name: "ingredients" }) ?? []
  const [seasonings, setSeasonings] = useState<PantrySeasoningRow[]>([])
  const [isSeasoningsOpen, setIsSeasoningsOpen] = useState(true)
  const [seasoningError, setSeasoningError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSeasonings() {
      try {
        const rows = await listPantrySeasonings()

        if (!cancelled) {
          setSeasonings(rows)
          setSeasoningError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setSeasoningError(
            error instanceof Error
              ? error.message
              : "Seasonings could not be loaded."
          )
        }
      }
    }

    void loadSeasonings()

    return () => {
      cancelled = true
    }
  }, [])

  const seasoningIndexes = useMemo(() => {
    const indexes = new Map<string, number>()

    ingredients.forEach((ingredient, index) => {
      const name = ingredient?.name?.trim()

      if (name && !indexes.has(name)) {
        indexes.set(name, index)
      }
    })

    return indexes
  }, [ingredients])

  function toggleSeasoning(seasoning: PantrySeasoningRow, checked: boolean) {
    const existingIndex = seasoningIndexes.get(seasoning.name)

    if (checked && existingIndex === undefined) {
      append(
        { name: seasoning.name, quantity: undefined, unit: "", notes: "" },
        { shouldFocus: false }
      )
      return
    }

    if (!checked && existingIndex !== undefined) {
      remove(existingIndex)
    }
  }

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

      {seasonings.length > 0 || seasoningError ? (
        <div className="mt-3 rounded-[8px] border border-border bg-cream px-[10px] py-3">
          <button
            type="button"
            onClick={() => setIsSeasoningsOpen((value) => !value)}
            className="flex w-full items-center justify-between gap-2 text-left text-[12px] font-semibold text-text-dark"
          >
            <span>Seasonings</span>
            {isSeasoningsOpen ? (
              <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
            ) : (
              <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
            )}
          </button>

          {isSeasoningsOpen ? (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {seasoningError ? (
                <p className="rounded-[8px] bg-rejected-bg px-3 py-2 text-[11px] text-rejected-text md:col-span-2">
                  {seasoningError}
                </p>
              ) : null}

              {seasonings.map((seasoning) => {
                const ingredientIndex = seasoningIndexes.get(seasoning.name)
                const checked = ingredientIndex !== undefined

                return (
                  <div
                    key={seasoning.id}
                    className="rounded-[8px] border border-border bg-card px-3 py-2"
                  >
                    <label className="flex items-center gap-2 text-[12px] text-text-dark">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          toggleSeasoning(seasoning, event.target.checked)
                        }
                        className="h-4 w-4 rounded-[4px] accent-green-mid"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {seasoning.name}
                      </span>
                    </label>

                    {checked ? (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="text-[10px] text-text-muted">
                            Quantity
                          </span>
                          <input
                            {...register(
                              `ingredients.${ingredientIndex}.quantity`
                            )}
                            inputMode="decimal"
                            className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[12px] outline-none focus:border-green-mid"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] text-text-muted">
                            Unit
                          </span>
                          <input
                            {...register(`ingredients.${ingredientIndex}.unit`)}
                            className="mt-1 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[12px] outline-none focus:border-green-mid"
                          />
                        </label>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : null}

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
