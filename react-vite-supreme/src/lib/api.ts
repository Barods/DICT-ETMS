import type { Notification, Task, User } from "./types"
import { calculateProgress } from "./task-utils"
import { apiClient } from "./http"
import type { AxiosRequestConfig } from "axios"

type ApiUser = {
  id: number | string
  email?: string
  first_name?: string
  last_name?: string
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  acc_lvl?: number
  position?: string
  office?: number | { name?: string }
  office_name?: string
}

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

type ApiAssignee = {
  id: number | string
  name: string
  department?: string
  is_active?: boolean
}

export type CreateUserInput = {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  is_active: boolean
  is_staff: boolean
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
  progress: calculateProgress(task.subtasks, task.status),
})

const mapNotification = (notification: ApiNotification): Notification => ({
  ...notification,
  id: String(notification.id),
  taskId: notification.task_id ? String(notification.task_id) : "",
})

const mapUser = (user: ApiUser): User => {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim()
  const name = fullName || user.email || `User ${user.id}`
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "U"
  const role: User["role"] = user.acc_lvl === 0 || user.is_staff || user.is_superuser
    ? "Administrator"
    : user.position?.toLowerCase().includes("manager") || user.acc_lvl === 2
      ? "Manager"
      : "Employee"

  return {
    id: String(user.id),
    name,
    email: user.email ?? "",
    role,
    department: user.office_name || (typeof user.office === "object" ? user.office?.name : undefined) || "Operations",
    active: user.is_active !== false,
    initials,
  }
}

async function request<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>({ ...config, url: path })
  return response.data
}
export async function fetchUsers() {
  const data = await request<ApiUser[] | { results: ApiUser[] }>('/users/all/')
  const items = Array.isArray(data) ? data : data.results ?? []
  return items.map(mapUser)
}

export function createUserRequest(input: CreateUserInput) {
  return request<ApiUser>("/users/all/", { method: "POST", data: input }).then(mapUser)
}

export async function fetchTaskAssignees(): Promise<User[]> {
  const data = await request<ApiAssignee[] | { results: ApiAssignee[] }>("/tasks/assignees/")
  const items = Array.isArray(data) ? data : data.results ?? []
  return items.map((assignee) => ({
    id: `assignee-${assignee.id}`,
    name: assignee.name,
    email: "",
    role: "Employee",
    department: assignee.department || "Operations",
    active: assignee.is_active !== false,
    initials: assignee.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "U",
  }))
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
  return request<ApiTask>("/tasks/", { method: "POST", data: input }).then(mapTask)
}

export function updateTask(id: string, input: Record<string, unknown>) {
  return request<ApiTask>(`/tasks/${id}/`, { method: "PATCH", data: input }).then(mapTask)
}

export function deleteTaskRequest(id: string) {
  return request<void>(`/tasks/${id}/`, { method: "DELETE" })
}

export function deleteUserRequest(id: string) {
  return request<void>(`/users/update/${id}/`, { method: "DELETE" })
}

export function updateUserPasswordRequest(id: string, password: string) {
  return request<void>(`/users/update/${id}/`, { method: "PUT", data: { password } })
}

export function updateNotification(id: string, input: Record<string, unknown>) {
  return request<ApiNotification>(`/notifications/${id}/`, { method: "PATCH", data: input }).then(mapNotification)
}

export function createNotification(input: Omit<Notification, "id" | "at"> & { taskId: string }) {
  return request<ApiNotification>("/notifications/", {
    method: "POST",
    data: {
      type: input.type,
      title: input.title,
      message: input.message,
      task_id: input.taskId,
      read: input.read,
    },
  }).then(mapNotification)
}
