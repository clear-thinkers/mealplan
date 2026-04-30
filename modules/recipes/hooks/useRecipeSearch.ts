"use client"

import { useEffect, useState } from "react"

export function useRecipeSearch(
  onSearch: (query: string) => Promise<void>,
  delayMs = 200
) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void onSearch(query)
    }, delayMs)

    return () => window.clearTimeout(timeout)
  }, [delayMs, onSearch, query])

  return { query, setQuery }
}
