"use client"

import { useMemo } from "react"

import type { RecipeFormValues } from "@/modules/recipes/schemas/recipe-form-schema"
import type { RecipeDetail } from "@/modules/recipes/types"

export const emptyRecipeFormValues: RecipeFormValues = {
  name: "",
  description: "",
  serves: 2,
  prepMinutes: undefined,
  cookMinutes: undefined,
  source: "",
  tagsText: "",
  ingredients: [{ name: "", quantity: undefined, unit: "", notes: "" }],
  steps: [{ instruction: "" }],
  memberNotes: [],
}

export function useRecipeForm(recipe?: RecipeDetail | null): RecipeFormValues {
  return useMemo(() => {
    if (!recipe) {
      return emptyRecipeFormValues
    }

    return {
      name: recipe.name,
      description: recipe.description ?? "",
      serves: recipe.serves,
      prepMinutes: recipe.prepMinutes,
      cookMinutes: recipe.cookMinutes,
      source: recipe.source ?? "",
      tagsText: recipe.tags.join(", "),
      ingredients: recipe.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit ?? "",
        notes: ingredient.notes ?? "",
      })),
      steps: recipe.steps.map((step) => ({
        instruction: step.instruction,
      })),
      memberNotes: recipe.memberNotes.map((note) => ({
        familyMemberId: note.familyMemberId,
        notes: note.notes,
      })),
    }
  }, [recipe])
}
