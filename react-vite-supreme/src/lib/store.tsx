"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { formatISO } from "date-fns"
import { createNotification, createTask, deleteTaskRequest, deleteUserRequest, fetchNotifications, fetchTaskAssignees, fetchTasks, fetchUsers, updateNotification, updateTask as updateTaskRequest } from "./api"
import { calculateProgress } from "./task-utils"
import {
  CURRENT_USER_ID,
  users as seedUsers,
} from "./mock-data"
import type { ActivityEntry, Notification, SubtaskStatus, Task, TaskStatus, User } from "./types"

const sessionKey = "etms-session"

export type TaskInput = Omit<Task, "id" | "createdAt" | "activity" | "completedAt" | "createdBy" | "subtasks" | "people"> & {
  people?: string[]
  subtasks?: Task["subtasks"]
}

type TaskPatch = Partial<TaskInput> & { completedAt?: string | null }

interface Store {
  tasks: Task[]
  users: User[]
  notifications: Notification[]
  apiError: string
  clearApiError: () => void
  currentUser: User
  getUser: (id: string) => User | undefined
  addTask: (input: TaskInput) => Promise<Task>
  updateTask: (id: string, patch: TaskPatch) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addSubtask: (taskId: string, title: string, description: string, status: SubtaskStatus, assignedTo?: string) => Promise<void>
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>
  addTaskPerson: (taskId: string, userId: string) => Promise<void>
  removeTaskPerson: (taskId: string, userId: string) => Promise<void>
  setStatus: (id: string, status: TaskStatus) => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  deleteUser: (id: string) => Promise<void>
  saveUser: (user: User) => void
  toggleUserActive: (id: string) => void
}

const StoreContext = createContext<Store | null>(null)

const nowIso = () => formatISO(new Date())

const toApiTaskFields = (input: TaskPatch) => ({
  ...(input.title !== undefined ? { title: input.title } : {}),
  ...(input.description !== undefined ? { description: input.description } : {}),
  ...(input.assignedTo !== undefined ? { assigned_to: input.assignedTo } : {}),
  ...(input.priority !== undefined ? { priority: input.priority } : {}),
  ...(input.status !== undefined ? { status: input.status } : {}),
  ...(input.startDate !== undefined ? { start_date: input.startDate } : {}),
  ...(input.dueDate !== undefined ? { due_date: input.dueDate } : {}),
  ...(input.category !== undefined ? { category: input.category } : {}),
  ...(input.attachments !== undefined ? { attachments: input.attachments } : {}),
  ...(input.remarks !== undefined ? { remarks: input.remarks } : {}),
  ...(input.progress !== undefined ? { progress: input.progress } : {}),
  ...(input.people !== undefined ? { people: input.people } : {}),
  ...(input.subtasks !== undefined ? { subtasks: input.subtasks } : {}),
  ...(input.completedAt !== undefined ? { completed_at: input.completedAt } : {}),
})

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [apiError, setApiError] = useState("")
  const [sessionEmail, setSessionEmail] = useState(() => {
    try {
      return (JSON.parse(localStorage.getItem(sessionKey) ?? "null") as { email?: string } | null)?.email ?? ""
    } catch {
      return ""
    }
  })

  useEffect(() => {
    const updateSession = () => {
      try {
        setSessionEmail((JSON.parse(localStorage.getItem(sessionKey) ?? "null") as { email?: string } | null)?.email ?? "")
      } catch {
        setSessionEmail("")
      }
    }
    window.addEventListener("popstate", updateSession)
    return () => window.removeEventListener("popstate", updateSession)
  }, [])

  useEffect(() => {
    if (!sessionEmail) {
      setTasks([])
      setUsers([])
      setNotifications([])
      setApiError("")
      return
    }

    let active = true
    Promise.allSettled([fetchTasks(), fetchNotifications(), fetchUsers(), fetchTaskAssignees()])
      .then((results) => {
        if (!active) return
        const [tasksResult, notificationsResult, usersResult, assigneesResult] = results

        if (tasksResult.status === "fulfilled") {
          setTasks(tasksResult.value)
        } else {
          setApiError("Could not load tasks from Django. Check that the backend is running.")
        }
        if (notificationsResult.status === "fulfilled") {
          setNotifications(notificationsResult.value)
        } else {
          setApiError("Could not load notifications from Django. Check that the backend is running.")
        }
        if (usersResult.status === "fulfilled") {
          setUsers(assigneesResult.status === "fulfilled"
            ? [...usersResult.value, ...assigneesResult.value]
            : usersResult.value)
        } else {
          setApiError("Could not load users from Django. Check that the backend is running.")
        }
        if (assigneesResult.status === "rejected") {
          setApiError("Could not load task assignees from Django.")
        }
      })
      .catch(() => setApiError("Could not load data from Django."))
    return () => { active = false }
  }, [sessionEmail])

  const currentUser = users.find((u) => u.email.toLowerCase() === sessionEmail.toLowerCase())
    ?? seedUsers.find((u) => u.email.toLowerCase() === sessionEmail.toLowerCase())
    ?? users.find((u) => u.id === CURRENT_USER_ID)
    ?? users[0]
    ?? seedUsers[0]
  const clearApiError = useCallback(() => setApiError(""), [])
  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users])
  const creatorUserId = currentUser?.id ?? CURRENT_USER_ID

  const pushActivity = (task: Task, entry: Omit<ActivityEntry, "id" | "at">): Task => ({
    ...task,
    activity: [...task.activity, { ...entry, id: `${task.id}-a${task.activity.length + 1}`, at: nowIso() }],
  })

  const addTask = useCallback(
    async (input: TaskInput) => {
      const createdAt = nowIso()
      const assigneeIds = [input.assignedTo, ...(input.people ?? [])].filter(
        (userId, index, list) => userId && list.indexOf(userId) === index,
      )
      const subtasks = input.subtasks ?? []
      const task: Task = {
        ...input,
        progress: calculateProgress(subtasks, input.status),
        id: "pending",
        createdBy: creatorUserId,
        createdAt,
        activity: [
          { id: "pending-a1", type: "created", message: "Task created", userId: creatorUserId, at: createdAt },
          ...assigneeIds.map((userId, index) => ({
            id: `pending-a${index + 2}`,
            type: "assigned" as const,
            message: `Assigned to ${users.find((user) => user.id === userId)?.name ?? "Unassigned"}`,
            userId: creatorUserId,
            at: createdAt,
          })),
        ],
        subtasks,
        people: input.people ?? [],
      }
      try {
        const savedTask = await createTask({
          ...toApiTaskFields(input),
          created_by: creatorUserId,
          subtasks: input.subtasks ?? [],
          activity: task.activity,
        })
        setTasks((prev) => [savedTask, ...prev])
        setApiError("")

        if (assigneeIds.length > 0) {
          try {
          const notification = await createNotification({ type: "assigned", title: "New task assigned", message: `You were assigned "${input.title}"`, taskId: savedTask.id, read: false })
          setNotifications((prev) => [notification, ...prev])
          } catch (error) {
            setApiError(error instanceof Error ? error.message : "Task saved, but its notification could not be saved.")
          }
        }
        return savedTask
      } catch (error) {
        setApiError(error instanceof Error ? error.message : "Task could not be saved to Django.")
        throw error
      }
    },
    [creatorUserId, users],
  )

  const updateTask = useCallback(async (id: string, patch: TaskPatch) => {
    const task = tasks.find((item) => item.id === id)
    if (!task) throw new Error("Task is not loaded from the database.")
        const statusChanged = patch.status !== undefined && patch.status !== task.status
        const completed = patch.status === "Completed"
        const subtasks = patch.subtasks ?? task.subtasks
        let next: Task = {
          ...task,
          ...patch,
          progress: patch.progress ?? (patch.subtasks || statusChanged ? calculateProgress(subtasks, patch.status ?? task.status) : task.progress),
          completedAt: patch.completedAt !== undefined
            ? patch.completedAt ?? undefined
            : statusChanged
              ? completed ? nowIso() : undefined
              : task.completedAt,
        }
        next = pushActivity(next, statusChanged
          ? { type: completed ? "completed" : "status", message: completed ? "Task marked as Completed" : `Status changed to ${patch.status}`, userId: creatorUserId }
          : { type: "updated", message: "Task details updated", userId: creatorUserId })
        if (patch.assignedTo && patch.assignedTo !== task.assignedTo) {
          const assignee = users.find((u) => u.id === patch.assignedTo)
          next = pushActivity(next, { type: "assigned", message: `Reassigned to ${assignee?.name}`, userId: creatorUserId })
        }
        if (patch.people) {
          const newlyAssigned = patch.people.filter((userId) => !task.people.includes(userId) && userId !== task.assignedTo)
          newlyAssigned.forEach((userId) => {
            const assignee = users.find((user) => user.id === userId)
            next = pushActivity(next, { type: "assigned", message: `Assigned to ${assignee?.name ?? "Unassigned"}`, userId: creatorUserId })
          })
        }
    try {
      const savedTask = await updateTaskRequest(id, { ...toApiTaskFields({ ...patch, progress: next.progress, completedAt: next.completedAt ?? null }), activity: next.activity })
      setTasks((prev) => prev.map((item) => item.id === id ? savedTask : item))
      setApiError("")
      const assignmentChanged = patch.assignedTo !== undefined && patch.assignedTo !== task.assignedTo
        || patch.people !== undefined && patch.people.some((userId) => !task.people.includes(userId))
      if (assignmentChanged) {
        try {
          const notification = await createNotification({ type: "assigned", title: "Task assignment updated", message: `Assignment changed for "${savedTask.title}"`, taskId: savedTask.id, read: false })
          setNotifications((prev) => [notification, ...prev])
        } catch (error) {
          setApiError(error instanceof Error ? error.message : "Task saved, but its notification could not be saved.")
        }
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Task update failed.")
      throw error
    }
  }, [creatorUserId, tasks, users])

  const deleteTask = useCallback(async (id: string) => {
    try {
      await deleteTaskRequest(id)
      setTasks((prev) => prev.filter((task) => task.id !== id))
      setApiError("")
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Task deletion failed.")
      throw error
    }
  }, [])

  const addSubtask = useCallback(async (taskId: string, title: string, description: string, status: SubtaskStatus, assignedTo?: string) => {
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return
    const subtasks = [...task.subtasks, { id: `${taskId}-s${task.subtasks.length + 1}`, title: cleanTitle, description: description.trim(), assignedTo: assignedTo || undefined, status, completed: status === "Completed" }]
    await updateTask(taskId, { subtasks, progress: calculateProgress(subtasks, task.status) })
  }, [tasks, updateTask])

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return
    const subtasks = task.subtasks.map((subtask) => subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed, status: subtask.completed ? "Pending" as const : "Completed" as const } : subtask)
    await updateTask(taskId, { subtasks, progress: calculateProgress(subtasks, task.status) })
  }, [tasks, updateTask])

  const deleteSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return
    const subtasks = task.subtasks.filter((subtask) => subtask.id !== subtaskId)
    await updateTask(taskId, { subtasks, progress: calculateProgress(subtasks, task.status) })
  }, [tasks, updateTask])

  const addTaskPerson = useCallback(async (taskId: string, userId: string) => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task || task.assignedTo === userId || task.createdBy === userId || task.people.includes(userId)) return
    await updateTask(taskId, { people: [...task.people, userId] })
  }, [tasks, updateTask])

  const removeTaskPerson = useCallback(async (taskId: string, userId: string) => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return
    await updateTask(taskId, { people: task.people.filter((id) => id !== userId) })
  }, [tasks, updateTask])

  const setStatus = useCallback(async (id: string, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === id)
    if (!task || task.status === status) return
    if (status === "Completed" && task.subtasks.some((subtask) => !subtask.completed && subtask.status !== "Completed")) return
    await updateTask(id, { status, progress: calculateProgress(task.subtasks, status), completedAt: status === "Completed" ? nowIso() : null })
    if (status === "Completed" && task.createdBy !== creatorUserId) {
      try {
        const notification = await createNotification({ type: "completed", title: "Task completed", message: `"${task.title}" was marked complete`, taskId: id, read: false })
        setNotifications((prev) => [notification, ...prev])
      } catch (error) {
        setApiError(error instanceof Error ? error.message : "Task saved, but notification could not be saved.")
      }
    }
  }, [creatorUserId, tasks, updateTask])

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      const notification = await updateNotification(id, { read: true })
      setNotifications((prev) => prev.map((item) => item.id === id ? notification : item))
      setApiError("")
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Notification update failed.")
    }
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    try {
      const updated = await Promise.all(notifications.filter((item) => !item.read).map((item) => updateNotification(item.id, { read: true })))
      const updatedById = new Map(updated.map((item) => [item.id, item]))
      setNotifications((prev) => prev.map((item) => updatedById.get(item.id) ?? item))
      setApiError("")
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Notifications could not be updated.")
    }
  }, [notifications])

  const saveUser = useCallback((user: User) => {
    setUsers((prev) => (prev.some((u) => u.id === user.id) ? prev.map((u) => (u.id === user.id ? user : u)) : [...prev, user]))
  }, [])

  const deleteUser = useCallback(async (id: string) => {
    try {
      await deleteUserRequest(id)
      setUsers((prev) => prev.filter((user) => user.id !== id))
      setApiError("")
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "User could not be deleted.")
    }
  }, [])

  const toggleUserActive = useCallback((id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)))
  }, [])

  const value = useMemo<Store>(
    () => ({
      tasks, users, notifications, currentUser, apiError, clearApiError, getUser,
      addTask, updateTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask, addTaskPerson, removeTaskPerson, setStatus,
      markNotificationRead, markAllNotificationsRead, deleteUser, saveUser, toggleUserActive,
    }),
    [tasks, users, notifications, currentUser, apiError, clearApiError, getUser, addTask, updateTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask, addTaskPerson, removeTaskPerson, setStatus, markNotificationRead, markAllNotificationsRead, deleteUser, saveUser, toggleUserActive],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
