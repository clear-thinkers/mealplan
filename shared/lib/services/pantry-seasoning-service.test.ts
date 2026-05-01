import { beforeEach, describe, expect, it } from "vitest"

import { db, initializeDb } from "@/shared/lib/db"
import {
  addPantrySeasoning,
  DEFAULT_PANTRY_SEASONINGS,
  listPantrySeasonings,
  movePantrySeasoning,
  removePantrySeasoning,
  seedDefaultPantrySeasonings,
  updatePantrySeasoning,
} from "@/shared/lib/services/pantry-seasoning-service"

async function clearPantrySeasonings() {
  await initializeDb()
  await db.pantrySeasonings.clear()
}

describe("pantry seasoning service", () => {
  beforeEach(async () => {
    await clearPantrySeasonings()
  })

  it("adds seasonings in display order", async () => {
    await addPantrySeasoning({ name: "盐" })
    await addPantrySeasoning({ name: "酱油", notes: "light soy is default" })

    const seasonings = await listPantrySeasonings()

    expect(seasonings.map((seasoning) => seasoning.name)).toEqual([
      "盐",
      "酱油",
    ])
    expect(seasonings.map((seasoning) => seasoning.sortOrder)).toEqual([0, 1])
    expect(seasonings[1]?.notes).toBe("light soy is default")
  })

  it("prevents blank and duplicate names", async () => {
    await addPantrySeasoning({ name: "盐" })

    await expect(addPantrySeasoning({ name: " " })).rejects.toThrow(
      "Seasoning name is required"
    )
    await expect(addPantrySeasoning({ name: "盐" })).rejects.toThrow(
      "Seasoning already exists"
    )
  })

  it("updates low-stock state and notes", async () => {
    const seasoning = await addPantrySeasoning({ name: "醋" })

    const updated = await updatePantrySeasoning(seasoning.id, {
      isLow: true,
      notes: "buy next time",
    })

    expect(updated.isLow).toBe(true)
    expect(updated.notes).toBe("buy next time")
  })

  it("moves seasonings up and down", async () => {
    const salt = await addPantrySeasoning({ name: "盐" })
    const sugar = await addPantrySeasoning({ name: "糖" })
    await addPantrySeasoning({ name: "油" })

    await movePantrySeasoning(sugar.id, "up")
    expect((await listPantrySeasonings()).map((row) => row.name)).toEqual([
      "糖",
      "盐",
      "油",
    ])

    await movePantrySeasoning(salt.id, "down")
    expect((await listPantrySeasonings()).map((row) => row.name)).toEqual([
      "糖",
      "油",
      "盐",
    ])
  })

  it("removes a seasoning and normalizes sort order", async () => {
    await addPantrySeasoning({ name: "盐" })
    const sugar = await addPantrySeasoning({ name: "糖" })
    await addPantrySeasoning({ name: "油" })

    await removePantrySeasoning(sugar.id)

    const seasonings = await listPantrySeasonings()

    expect(seasonings.map((row) => row.name)).toEqual(["盐", "油"])
    expect(seasonings.map((row) => row.sortOrder)).toEqual([0, 1])
  })

  it("seeds common Chinese cooking staples only when empty", async () => {
    const seeded = await seedDefaultPantrySeasonings()

    expect(seeded).toHaveLength(DEFAULT_PANTRY_SEASONINGS.length)
    expect(seeded[0]?.name).toBe(DEFAULT_PANTRY_SEASONINGS[0])

    await seedDefaultPantrySeasonings()
    expect(await db.pantrySeasonings.count()).toBe(
      DEFAULT_PANTRY_SEASONINGS.length
    )
  })
})
