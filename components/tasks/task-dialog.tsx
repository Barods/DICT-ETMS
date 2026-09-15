"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "./task-form"
import { useStore, type TaskInput } from "@/lib/store"
import type { Task } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
}

export function TaskDialog({ open, onOpenChange, task }: Props) {
  const { addTask, updateTask } = useStore()

  const handleSubmit = (input: TaskInput) => {
    if (task) updateTask(task.id, input)
    else addTask(input)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? `Edit ${task.id}` : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update task details, assignment, and schedule." : "Fill in the details below to create and assign a task."}
          </DialogDescription>
        </DialogHeader>
        <TaskForm key={task?.id ?? "new"} task={task} onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} submitLabel={task ? "Save Changes" : "Create Task"} />
      </DialogContent>
    </Dialog>
  )
}
