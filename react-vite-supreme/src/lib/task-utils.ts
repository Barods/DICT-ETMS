import { differenceInCalendarDays, format, isToday, parseISO } from "date-fns"
import type { Subtask, TaskPriority, TaskStatus } from "./types"

export function calculateProgress(subtasks: Subtask[], parentStatus: TaskStatus) {
  const completedSubtasks = subtasks.filter((subtask) => subtask.status === "Completed" || subtask.completed).length
  const completedItems = (parentStatus === "Completed" ? 1 : 0) + completedSubtasks
  return Math.round((completedItems / (subtasks.length + 1)) * 100)
}

export const statusStyles: Record<TaskStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  Overdue: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  Cancelled: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
}

export const statusDot: Record<TaskStatus, string> = {
  Pending: "bg-amber-500",
  "In Progress": "bg-blue-500",
  Completed: "bg-emerald-500",
  Overdue: "bg-red-500",
  Cancelled: "bg-slate-400",
}

export const priorityStyles: Record<TaskPriority, string> = {
  Low: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  Medium: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900",
  High: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900",
}

export const priorityRank: Record<TaskPriority, number> = { Low: 0, Medium: 1, High: 2 }

export function formatDate(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy")
}

export function formatDateTime(iso: string) {
  return format(parseISO(iso), "MMM d, yyyy 'at' h:mm a")
}

export function dueLabel(iso: string, status: TaskStatus) {
  if (status === "Completed" || status === "Cancelled") return formatDate(iso)
  const d = parseISO(iso)
  if (isToday(d)) return "Due today"
  const diff = differenceInCalendarDays(d, new Date())
  if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"} overdue`
  if (diff === 1) return "Due tomorrow"
  return `Due in ${diff} days`
}

export function toDateInput(iso: string) {
  return format(parseISO(iso), "yyyy-MM-dd")
}
