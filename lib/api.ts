import type { Notification, Task } from "./types"
import { calculateProgress } from "./task-utils"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

type ApiTask = Omit<Task, "id" | "createdAt" | "assignedTo" | "createdBy" | "startDate" | "dueDate" | "completedAt"> & {
  id: number
  created_at: string
  assigned_to: string
  created_by: string
  start_date: string
  due_date: string
  completed_at?: string | null
}

type ApiNotification = Omit<Notification, "taskId" | "at"> & {
  task_id: number | null
  at: string
}

const mapTask = (task: ApiTask): Task => ({
  ...task,
  id: String(task.id),
  assignedTo: task.assigned_to,
  createdBy: task.created_by,
  startDate: task.start_date,
  dueDate: task.due_date,
  createdAt: task.created_at,
  completedAt: task.completed_at ?? undefined,
  subtasks: task.subtasks.map((subtask) => ({
    ...subtask,
    description: subtask.description ?? "",
    status: subtask.status ?? (subtask.completed ? "Completed" : "Pending"),
  })),
  progress: calculateProgress(task.subtasks),
})

const mapNotification = (notification: ApiNotification): Notification => ({
  ...notification,
  id: String(notification.id),
  taskId: notification.task_id ? String(notification.task_id) : "",
})

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  if (response.status === 204) return undefined as T
  return response.json()
}

export async function fetchTasks() {
  const data = await request<ApiTask[] | { results: ApiTask[] }>("/tasks/")
  return (Array.isArray(data) ? data : data.results).map(mapTask)
}

export async function fetchNotifications() {
  const data = await request<ApiNotification[] | { results: ApiNotification[] }>("/notifications/")
  return (Array.isArray(data) ? data : data.results).map(mapNotification)
}

export function createTask(input: Record<string, unknown>) {
  return request<ApiTask>("/tasks/", { method: "POST", body: JSON.stringify(input) }).then(mapTask)
}

export function updateTask(id: string, input: Record<string, unknown>) {
  return request<ApiTask>(`/tasks/${id}/`, { method: "PATCH", body: JSON.stringify(input) }).then(mapTask)
}

export function deleteTaskRequest(id: string) {
  return request<void>(`/tasks/${id}/`, { method: "DELETE" })
}

export function updateNotification(id: string, input: Record<string, unknown>) {
  return request<ApiNotification>(`/notifications/${id}/`, { method: "PATCH", body: JSON.stringify(input) }).then(mapNotification)
}
