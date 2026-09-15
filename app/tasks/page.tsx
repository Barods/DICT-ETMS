"use client"

import { Plus } from "lucide-react"
import { Link } from "@/lib/router"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { TaskTable } from "@/components/tasks/task-table"
import { useStore } from "@/lib/store"

export default function TaskMonitoringPage() {
  const { tasks } = useStore()

  return (
    <>
      <PageHeader
        title="Task Monitoring"
        description="Browse, search, filter, and monitor every task recorded in the system."
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

      <TaskTable tasks={tasks} />
    </>
  )
}