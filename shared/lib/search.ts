import Fuse, { type FuseOptionKey, type IFuseOptions } from "fuse.js"

export const DEFAULT_SEARCH_OPTIONS = {
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 1,
  threshold: 0.35,
} satisfies IFuseOptions<unknown>

export function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function createSearchIndex<T>(
  items: readonly T[],
  keys: FuseOptionKey<T>[],
  options: IFuseOptions<T> = {}
): Fuse<T> {
  return new Fuse(items, {
    ...DEFAULT_SEARCH_OPTIONS,
    ...options,
    keys,
  })
}

export function searchItems<T>(
  items: readonly T[],
  query: string,
  keys: FuseOptionKey<T>[],
  options?: IFuseOptions<T>
): T[] {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) {
    return [...items]
  }

  return createSearchIndex(items, keys, options)
    .search(normalizedQuery)
    .map((result) => result.item)
}
