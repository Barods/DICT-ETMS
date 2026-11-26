import { TASK_CATEGORIES } from "./types"

export interface TaskTemplate {
  id: string
  name: string
  category: string
  description: string
  subtasks: TemplateSubtask[]
}

export interface TemplateSubtask {
  title: string
  description: string
}

const storageKey = "etms-task-templates"

export function getTaskTemplates(): TaskTemplate[] {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null")
    if (Array.isArray(stored)) {
      return stored
        .filter((template) => Boolean(
          template && typeof template.id === "string" && typeof template.name === "string" &&
          typeof template.category === "string" && typeof template.description === "string" &&
          (Array.isArray(template.subtasks) || typeof template.subtaskTitle === "string"),
        ))
        .map((template) => ({
          ...template,
          subtasks: Array.isArray(template.subtasks)
            ? template.subtasks.filter((subtask: { title?: unknown } ) => typeof subtask?.title === "string").map((subtask: { title: string; description?: unknown }) => ({
              title: subtask.title,
              description: typeof subtask.description === "string" ? subtask.description : "",
            }))
            : template.subtaskTitle
              ? [{ title: template.subtaskTitle, description: typeof template.subtaskDescription === "string" ? template.subtaskDescription : "" }]
              : [],
        }))
    }
  } catch {
    // Fall back to an empty template list when storage is unavailable or invalid.
  }
  return []
}

export function saveTaskTemplates(templates: TaskTemplate[]) {
  localStorage.setItem(storageKey, JSON.stringify(templates))
  window.dispatchEvent(new CustomEvent("task-templates-changed"))
}

export const defaultTaskTemplate: TaskTemplate = {
  id: "default-project",
  name: "Project task",
  category: TASK_CATEGORIES[5] ?? "Project",
  description: "",
  subtasks: [],
}
