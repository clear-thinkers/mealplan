import { createId, createTimestamp, db } from "@/shared/lib/db"
import type { PantrySeasoning } from "@/shared/lib/db-schema"

export type CreatePantrySeasoningInput = {
  name: string
  notes?: string
}

export type UpdatePantrySeasoningInput = {
  name?: string
  notes?: string
  isLow?: boolean
}

export const DEFAULT_PANTRY_SEASONINGS = [
  "盐",
  "糖",
  "油",
  "酱油",
  "生抽",
  "老抽",
  "醋",
  "料酒",
  "蚝油",
  "香油",
  "白胡椒粉",
  "淀粉",
  "花椒",
  "八角",
] as const

function cleanText(value: string | undefined): string | undefined {
  const cleaned = value?.trim()

  return cleaned ? cleaned : undefined
}

function compareSeasonings(
  a: Pick<PantrySeasoning, "sortOrder" | "name">,
  b: Pick<PantrySeasoning, "sortOrder" | "name">
): number {
  const orderCompare = a.sortOrder - b.sortOrder

  if (orderCompare !== 0) {
    return orderCompare
  }

  return a.name.localeCompare(b.name)
}

async function normalizeSortOrder(): Promise<PantrySeasoning[]> {
  const rows = (await db.pantrySeasonings.toArray()).sort(compareSeasonings)
  const updates = rows.map((row, index) => ({
    key: row.id,
    changes: { sortOrder: index },
  }))

  if (updates.length > 0) {
    await db.pantrySeasonings.bulkUpdate(updates)
  }

  return rows.map((row, index) => ({ ...row, sortOrder: index }))
}

export async function listPantrySeasonings(): Promise<PantrySeasoning[]> {
  return (await db.pantrySeasonings.toArray()).sort(compareSeasonings)
}

export async function addPantrySeasoning(
  input: CreatePantrySeasoningInput
): Promise<PantrySeasoning> {
  const name = cleanText(input.name)

  if (!name) {
    throw new Error("Seasoning name is required")
  }

  const existing = await db.pantrySeasonings.toArray()
  const duplicate = existing.some(
    (seasoning) => seasoning.name.trim().toLowerCase() === name.toLowerCase()
  )

  if (duplicate) {
    throw new Error("Seasoning already exists")
  }

  const timestamp = createTimestamp()
  const seasoning: PantrySeasoning = {
    id: createId(),
    name,
    notes: cleanText(input.notes),
    isLow: false,
    sortOrder: existing.length,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await db.pantrySeasonings.add(seasoning)

  return seasoning
}

export async function updatePantrySeasoning(
  id: string,
  input: UpdatePantrySeasoningInput
): Promise<PantrySeasoning> {
  const existing = await db.pantrySeasonings.get(id)

  if (!existing) {
    throw new Error("Seasoning not found")
  }

  const nextName =
    input.name === undefined ? existing.name : cleanText(input.name)

  if (!nextName) {
    throw new Error("Seasoning name is required")
  }

  const allSeasonings = await db.pantrySeasonings.toArray()
  const duplicate = allSeasonings.some(
    (seasoning) =>
      seasoning.id !== id &&
      seasoning.name.trim().toLowerCase() === nextName.toLowerCase()
  )

  if (duplicate) {
    throw new Error("Seasoning already exists")
  }

  const updated: PantrySeasoning = {
    ...existing,
    name: nextName,
    notes:
      input.notes === undefined ? existing.notes : cleanText(input.notes),
    isLow: input.isLow ?? existing.isLow,
    updatedAt: createTimestamp(),
  }

  await db.pantrySeasonings.put(updated)

  return updated
}

export async function removePantrySeasoning(id: string): Promise<void> {
  const existing = await db.pantrySeasonings.get(id)

  if (!existing) {
    throw new Error("Seasoning not found")
  }

  await db.transaction("rw", db.pantrySeasonings, async () => {
    await db.pantrySeasonings.delete(id)
    await normalizeSortOrder()
  })
}

export async function movePantrySeasoning(
  id: string,
  direction: "up" | "down"
): Promise<PantrySeasoning[]> {
  return db.transaction("rw", db.pantrySeasonings, async () => {
    const rows = await normalizeSortOrder()
    const index = rows.findIndex((row) => row.id === id)

    if (index === -1) {
      throw new Error("Seasoning not found")
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= rows.length) {
      return rows
    }

    const current = rows[index]
    const target = rows[targetIndex]

    await db.pantrySeasonings.bulkUpdate([
      { key: current.id, changes: { sortOrder: target.sortOrder } },
      { key: target.id, changes: { sortOrder: current.sortOrder } },
    ])

    return listPantrySeasonings()
  })
}

export async function seedDefaultPantrySeasonings(): Promise<PantrySeasoning[]> {
  return db.transaction("rw", db.pantrySeasonings, async () => {
    const existing = await db.pantrySeasonings.toArray()

    if (existing.length > 0) {
      return existing.sort(compareSeasonings)
    }

    const timestamp = createTimestamp()
    const rows: PantrySeasoning[] = DEFAULT_PANTRY_SEASONINGS.map(
      (name, index) => ({
        id: createId(),
        name,
        isLow: false,
        sortOrder: index,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    )

    await db.pantrySeasonings.bulkAdd(rows)

    return rows
  })
}
