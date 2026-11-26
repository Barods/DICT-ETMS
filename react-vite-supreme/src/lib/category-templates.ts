import { TASK_CATEGORIES } from "./types"

const storageKey = "etms-category-templates"

export function getCategoryTemplates() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null")
    if (Array.isArray(stored)) {
      const categories = stored.filter((value): value is string => typeof value === "string" && value.trim().length > 0).map((value) => value.trim())
      if (categories.length > 0) return [...new Set(categories)]
    }
  } catch {
    // Use the built-in defaults when storage is unavailable or invalid.
  }
  return [...TASK_CATEGORIES]
}

export function saveCategoryTemplates(categories: string[]) {
  const normalized = [...new Set(categories.map((category) => category.trim()).filter(Boolean))]
  localStorage.setItem(storageKey, JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent("category-templates-changed"))
}
