"use client"

import { isToday, parseISO } from "date-fns"
import { CalendarClock, CheckCircle2, ClipboardList, Loader } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function StatCards() {
  const { tasks, currentUser } = useStore()
  const visibleTasks = currentUser.role === "Administrator"
    ? tasks
    : tasks.filter((task) => task.createdBy === currentUser.id || task.assignedTo === currentUser.id || task.people.includes(currentUser.id))

  const total = visibleTasks.length
  const inProgress = visibleTasks.filter((t) => t.status === "In Progress").length
  const completed = visibleTasks.filter((t) => t.status === "Completed").length
  const dueToday = visibleTasks.filter((t) => isToday(parseISO(t.dueDate)) && t.status !== "Completed" && t.status !== "Cancelled").length

  const stats = [
    { label: "Total Task", value: total, icon: ClipboardList, tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300" },
    { label: "In Progress", value: inProgress, icon: Loader, tone: "text-violet-600 bg-violet-50 dark:bg-violet-950/50 dark:text-violet-300" },
    { label: "Complete", value: completed, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300" },
    { label: "Today's Deadline", value: dueToday, icon: CalendarClock, tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300" },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="gap-0 rounded-xl border-border/60 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className={cn("text-3xl font-bold tabular-nums tracking-tight", s.label === "Today's Deadline" && "text-destructive")}>{s.value}</p>
              <p className="text-xs text-muted-foreground">View details</p>
            </div>
            <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", s.tone)}>
              <s.icon className="size-5" aria-hidden />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
