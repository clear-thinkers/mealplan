"use client"

import type { Control, UseFormRegister } from "react-hook-form"
import { useFieldArray } from "react-hook-form"

import type { RecipeFormValues } from "@/modules/recipes/schemas/recipe-form-schema"
import { FAMILY_MEMBERS } from "@/shared/lib/constants"
import { cn } from "@/shared/lib/utils"

type MemberNotesEditorProps = {
  control: Control<RecipeFormValues>
  register: UseFormRegister<RecipeFormValues>
}

function getAvatarClass(memberId: string | undefined): string {
  if (memberId === "fu") return "bg-[#4A7C5F]"
  if (memberId === "nora") return "bg-[#6B9E7A]"
  if (memberId === "freddie") return "bg-[#8ABE9A]"
  return "bg-[#2D5240]"
}

export function MemberNotesEditor({
  control,
  register,
}: MemberNotesEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "memberNotes",
  })
  const selectedIds = new Set(fields.map((field) => field.familyMemberId))

  return (
    <section className="rounded-[10px] border border-border bg-card px-3 py-3">
      <h3 className="text-[14px] font-semibold">Family notes</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {FAMILY_MEMBERS.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => append({ familyMemberId: member.id, notes: "" })}
            disabled={selectedIds.has(member.id)}
            className="rounded-full bg-idle-bg px-3 py-1.5 text-[11px] font-normal text-text-mid disabled:opacity-50"
          >
            Add {member.nickname || member.name}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        {fields.map((field, index) => {
          const member = FAMILY_MEMBERS.find(
            (candidate) => candidate.id === field.familyMemberId
          )

          return (
            <div
              key={field.id}
              className="rounded-[8px] border border-border px-[10px] py-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-[26px] w-[26px] items-center justify-center rounded-full text-[9px] font-semibold text-card",
                    getAvatarClass(member?.id)
                  )}
                >
                  {(member?.nickname || member?.name || "?").slice(0, 1)}
                </span>
                <span className="text-[13px] font-semibold">
                  {member?.nickname || member?.name}
                </span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="ml-auto rounded-[10px] bg-idle-bg px-2 py-1 text-[10px] text-text-mid"
                >
                  Remove
                </button>
              </div>
              <input
                type="hidden"
                {...register(`memberNotes.${index}.familyMemberId`)}
              />
              <textarea
                {...register(`memberNotes.${index}.notes`)}
                rows={2}
                className="mt-2 w-full rounded-[8px] border border-border bg-cream px-3 py-2 text-[13px] outline-none focus:border-green-mid"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
