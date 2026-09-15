"use client"

import { PageHeader } from "@/components/layout/page-header"
import { TaskTable } from "@/components/tasks/task-table"
import { Card } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function MyTasksPage() {
  const { tasks, currentUser } = useStore()
  const mine = tasks.filter((t) => t.assignedTo === currentUser.id)
  const open = mine.filter((t) => t.status === "Pending" || t.status === "In Progress").length
  const overdue = mine.filter((t) => t.status === "Overdue").length
  const done = mine.filter((t) => t.status === "Completed").length

  return (
    <>
      <PageHeader title="My Tasks" description={`Tasks assigned to you, ${currentUser.name}. Update status as you make progress.`} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Open", value: open, tone: "text-blue-600 dark:text-blue-300" },
          { label: "Overdue", value: overdue, tone: "text-red-600 dark:text-red-300" },
          { label: "Completed", value: done, tone: "text-emerald-600 dark:text-emerald-300" },
        ].map((s) => (
          <Card key={s.label} className="gap-1 rounded-2xl border-border/60 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className={`text-3xl font-bold tabular-nums ${s.tone}`}>{s.value}</p>
          </Card>
        ))}
      </div>
      <TaskTable tasks={mine} showAssignee={false} emptyMessage="You have no tasks assigned." />
    </>
  )
}
