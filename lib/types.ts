export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Overdue" | "Cancelled"
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent"
export type SubtaskStatus = "Pending" | "Ongoing" | "Completed" | "Overdue" | "Cancelled"
export type UserRole = "Administrator" | "Manager" | "Employee"

export const TASK_STATUSES: TaskStatus[] = ["Pending", "In Progress", "Completed", "Overdue", "Cancelled"]
export const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"]
export const TASK_CATEGORIES = ["Project", "ILCDB", "Sparks", "IITDB", "PNPKI"]
export const DEPARTMENTS = ["Engineering", "Design", "Finance", "Human Resources", "Operations", "Marketing"]

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  active: boolean
  initials: string
}

export interface ActivityEntry {
  id: string
  type: "created" | "assigned" | "updated" | "status" | "completed" | "comment"
  message: string
  userId: string
  at: string
}

export interface Subtask {
  id: string
  title: string
  description: string
  assignedTo?: string
  status: SubtaskStatus
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  createdBy: string
  priority: TaskPriority
  status: TaskStatus
  startDate: string
  dueDate: string
  category: string
  attachments: string[]
  remarks: string
  progress: number
  createdAt: string
  completedAt?: string
  activity: ActivityEntry[]
  subtasks: Subtask[]
  people: string[]
}

export interface Notification {
  id: string
  type: "assigned" | "deadline" | "overdue" | "completed"
  title: string
  message: string
  taskId: string
  at: string
  read: boolean
}
