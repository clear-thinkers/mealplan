"use client"

import { useEffect } from "react"

import { initializeDb } from "@/shared/lib/db"

export function DexieInitializer() {
  useEffect(() => {
    initializeDb()
      .then(() => {
        console.info("Dexie initialized")
      })
      .catch((error) => {
        console.error("Dexie initialization failed", error)
      })
  }, [])

  return null
}
