"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { formatISO } from "date-fns"
import { createTask, deleteTaskRequest, fetchNotifications, fetchTasks, updateNotification, updateTask as updateTaskRequest } from "./api"
import { calculateProgress } from "./task-utils"
import {
  CURRENT_USER_ID,
  notifications as seedNotifications,
  tasks as seedTasks,
  users as seedUsers,
} from "./mock-data"
import type { ActivityEntry, Notification, SubtaskStatus, Task, TaskStatus, User } from "./types"

export type TaskInput = Omit<Task, "id" | "createdAt" | "activity" | "completedAt" | "createdBy" | "subtasks" | "people"> & {
  people?: string[]
  subtasks?: Task["subtasks"]
}

type TaskPatch = Partial<TaskInput> & { completedAt?: string | null }

interface Store {
  tasks: Task[]
  users: User[]
  notifications: Notification[]
  currentUser: User
  getUser: (id: string) => User | undefined
  addTask: (input: TaskInput) => Task
  updateTask: (id: string, patch: TaskPatch) => void
  deleteTask: (id: string) => void
  addSubtask: (taskId: string, title: string, description: string, status: SubtaskStatus) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  addTaskPerson: (taskId: string, userId: string) => void
  removeTaskPerson: (taskId: string, userId: string) => void
  setStatus: (id: string, status: TaskStatus) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
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
  const [tasks, setTasks] = useState<Task[]>(seedTasks)
  const [users, setUsers] = useState<User[]>(seedUsers)
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications)

  useEffect(() => {
    let active = true
    Promise.all([fetchTasks(), fetchNotifications()])
      .then(([remoteTasks, remoteNotifications]) => {
        if (!active) return
        setTasks(remoteTasks)
        setNotifications(remoteNotifications)
      })
      .catch(() => {
        // Keep the seeded data when the API or database is not running yet.
      })
    return () => { active = false }
  }, [])

  const currentUser = users.find((u) => u.id === CURRENT_USER_ID) ?? users[0]
  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users])

  const pushActivity = (task: Task, entry: Omit<ActivityEntry, "id" | "at">): Task => ({
    ...task,
    activity: [...task.activity, { ...entry, id: `${task.id}-a${task.activity.length + 1}`, at: nowIso() }],
  })

  const addTask = useCallback(
    (input: TaskInput) => {
      const nextNumber = 1001 + tasks.length
      const id = `T-${nextNumber}`
      const createdAt = nowIso()
      const assigneeIds = [input.assignedTo, ...(input.people ?? [])].filter(
        (userId, index, list) => userId && list.indexOf(userId) === index,
      )
      const subtasks = input.subtasks ?? []
      const task: Task = {
        ...input,
        progress: calculateProgress(subtasks),
        id,
        createdBy: CURRENT_USER_ID,
        createdAt,
        activity: [
          { id: `${id}-a1`, type: "created", message: "Task created", userId: CURRENT_USER_ID, at: createdAt },
          ...assigneeIds.map((userId, index) => ({
            id: `${id}-a${index + 2}`,
            type: "assigned" as const,
            message: `Assigned to ${users.find((user) => user.id === userId)?.name ?? "Unassigned"}`,
            userId: CURRENT_USER_ID,
            at: createdAt,
          })),
        ],
        subtasks,
        people: input.people ?? [],
      }
      setTasks((prev) => [task, ...prev])
      void createTask({
        ...toApiTaskFields(input),
        created_by: CURRENT_USER_ID,
        subtasks: [],
        activity: task.activity,
      }).catch(() => undefined)
      if (input.assignedTo === CURRENT_USER_ID) {
        setNotifications((prev) => [
          { id: `n-${Date.now()}`, type: "assigned", title: "New task assigned", message: `You were assigned "${input.title}"`, taskId: id, at: createdAt, read: false },
          ...prev,
        ])
      }
      return task
    },
    [tasks.length, users],
  )

  const updateTask = useCallback((id: string, patch: TaskPatch) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const statusChanged = patch.status !== undefined && patch.status !== t.status
        const completed = patch.status === "Completed"
        const subtasks = patch.subtasks ?? t.subtasks
        let next: Task = {
          ...t,
          ...patch,
          progress: patch.progress ?? (statusChanged && completed ? 100 : patch.subtasks ? calculateProgress(subtasks) : t.progress),
          completedAt: patch.completedAt !== undefined
            ? patch.completedAt ?? undefined
            : statusChanged
              ? completed ? nowIso() : undefined
              : t.completedAt,
        }
        next = pushActivity(next, { type: "updated", message: "Task details updated", userId: CURRENT_USER_ID })
        if (patch.assignedTo && patch.assignedTo !== t.assignedTo) {
          const assignee = users.find((u) => u.id === patch.assignedTo)
          next = pushActivity(next, { type: "assigned", message: `Reassigned to ${assignee?.name}`, userId: CURRENT_USER_ID })
        }
        if (patch.people) {
          const newlyAssigned = patch.people.filter((userId) => !t.people.includes(userId) && userId !== t.assignedTo)
          newlyAssigned.forEach((userId) => {
            const assignee = users.find((user) => user.id === userId)
            next = pushActivity(next, { type: "assigned", message: `Assigned to ${assignee?.name ?? "Unassigned"}`, userId: CURRENT_USER_ID })
          })
        }
        void updateTaskRequest(id, toApiTaskFields({ ...patch, progress: next.progress, completedAt: next.completedAt ?? null })).catch(() => undefined)
        return next
      }),
    )
  }, [users])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    void deleteTaskRequest(id).catch(() => undefined)
  }, [])

  const addSubtask = useCallback((taskId: string, title: string, description: string, status: SubtaskStatus) => {
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    setTasks((prev) => prev.map((task) => {
      if (task.id !== taskId) return task
      const subtasks = [...task.subtasks, { id: `${taskId}-s${task.subtasks.length + 1}`, title: cleanTitle, description: description.trim(), status, completed: status === "Completed" }]
      void updateTaskRequest(taskId, { subtasks, progress: calculateProgress(subtasks) }).catch(() => undefined)
      return { ...task, subtasks, progress: calculateProgress(subtasks) }
    }))
  }, [])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) => prev.map((task) => {
      if (task.id !== taskId) return task
      const subtasks = task.subtasks.map((subtask) => subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed, status: subtask.completed ? "Pending" as const : "Completed" as const } : subtask)
      void updateTaskRequest(taskId, { subtasks, progress: calculateProgress(subtasks) }).catch(() => undefined)
      return { ...task, subtasks, progress: calculateProgress(subtasks) }
    }))
  }, [])

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) => prev.map((task) => {
      if (task.id !== taskId) return task
      const subtasks = task.subtasks.filter((subtask) => subtask.id !== subtaskId)
      void updateTaskRequest(taskId, { subtasks, progress: calculateProgress(subtasks) }).catch(() => undefined)
      return { ...task, subtasks, progress: calculateProgress(subtasks) }
    }))
  }, [])

  const addTaskPerson = useCallback((taskId: string, userId: string) => {
    setTasks((prev) => prev.map((task) => task.id !== taskId || task.assignedTo === userId || task.createdBy === userId || task.people.includes(userId)
      ? task
      : { ...task, people: [...task.people, userId] }))
  }, [])

  const removeTaskPerson = useCallback((taskId: string, userId: string) => {
    setTasks((prev) => prev.map((task) => task.id !== taskId ? task : { ...task, people: task.people.filter((id) => id !== userId) }))
  }, [])

  const setStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.status === status) return t
        const completed = status === "Completed"
        let next: Task = {
          ...t,
          status,
          progress: completed ? 100 : calculateProgress(t.subtasks),
          completedAt: completed ? nowIso() : undefined,
        }
        next = pushActivity(next, {
          type: completed ? "completed" : "status",
          message: completed ? "Task marked as Completed" : `Status changed to ${status}`,
          userId: CURRENT_USER_ID,
        })
        if (completed && t.createdBy !== CURRENT_USER_ID) {
          setNotifications((n) => [
            { id: `n-${Date.now()}`, type: "completed", title: "Task completed", message: `"${t.title}" was marked complete`, taskId: id, at: nowIso(), read: false },
            ...n,
          ])
        }
        return next
      }),
    )
    void updateTaskRequest(id, { status, progress: status === "Completed" ? 100 : undefined, completed_at: status === "Completed" ? nowIso() : null }).catch(() => undefined)
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    void updateNotification(id, { read: true }).catch(() => undefined)
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    notifications.filter((notification) => !notification.read).forEach((notification) => {
      void updateNotification(notification.id, { read: true }).catch(() => undefined)
    })
  }, [notifications])

  const saveUser = useCallback((user: User) => {
    setUsers((prev) => (prev.some((u) => u.id === user.id) ? prev.map((u) => (u.id === user.id ? user : u)) : [...prev, user]))
  }, [])

  const toggleUserActive = useCallback((id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)))
  }, [])

  const value = useMemo<Store>(
    () => ({
      tasks, users, notifications, currentUser, getUser,
      addTask, updateTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask, addTaskPerson, removeTaskPerson, setStatus,
      markNotificationRead, markAllNotificationsRead, saveUser, toggleUserActive,
    }),
    [tasks, users, notifications, currentUser, getUser, addTask, updateTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask, addTaskPerson, removeTaskPerson, setStatus, markNotificationRead, markAllNotificationsRead, saveUser, toggleUserActive],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
