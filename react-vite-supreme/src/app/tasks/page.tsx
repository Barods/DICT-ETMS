"use client"

import { Plus } from "lucide-react"
import { Link } from "@/lib/router"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { TaskTable } from "@/components/tasks/task-table"
import { useStore } from "@/lib/store"

export default function TaskMonitoringPage() {
  const { tasks, currentUser } = useStore()
  const isAdmin = currentUser.role === "Administrator"
  const visibleTasks = isAdmin
    ? tasks
    : tasks.filter((task) => task.createdBy === currentUser.id || task.assignedTo === currentUser.id || task.people.includes(currentUser.id))

  return (
    <>
      <PageHeader
        title="Task Monitoring"
        description={isAdmin ? "Browse, search, filter, and monitor every task recorded in the system." : "View tasks you created or that are assigned to you."}
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/tasks/new" />}
          >
            <Plus className="size-4" />
            Create Task
          </Button>
        }
      />

      <TaskTable tasks={visibleTasks} />
    </>
  )
}