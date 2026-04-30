import type { FamilyMemberId, MealTime, StoreId } from "@/shared/lib/db-schema"

export const FAMILY_MEMBERS = [
  {
    id: "chengyuan",
    name: "Chengyuan",
    nickname: "",
    role: "adult",
    birthdate: "1988-06-01",
    color: "#2D5240",
  },
  {
    id: "fu",
    name: "Fu",
    nickname: "",
    role: "adult",
    birthdate: "1988-01-01",
    color: "#4A7C5F",
  },
  {
    id: "nora",
    name: "Nora",
    nickname: "瓜瓜",
    role: "child",
    birthdate: "2018-07-01",
    color: "#6B9E7A",
  },
  {
    id: "freddie",
    name: "Freddie",
    nickname: "毛毛",
    role: "child",
    birthdate: "2023-05-01",
    color: "#8ABE9A",
  },
] as const satisfies readonly {
  id: FamilyMemberId
  name: string
  nickname: string
  role: "adult" | "child"
  birthdate: string
  color: string
}[]

export const STORES = {
  COSTCO: "costco",
  WHOLEFOODS: "wholefoods",
  CHINESE_GROCERY: "chinese_grocery",
  ANY: "any",
  UNASSIGNED: "unassigned",
} as const satisfies Record<string, StoreId>

export const STORE_LABELS: Record<StoreId, string> = {
  costco: "Costco",
  wholefoods: "Whole Foods",
  chinese_grocery: "Chinese Grocery",
  any: "Any Store",
  unassigned: "Unassigned",
}

export const MEAL_TIMES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
] as const satisfies readonly MealTime[]

export const MEAL_TIME_LABELS: Record<MealTime, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
}
