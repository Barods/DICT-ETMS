"use client"

import { useRouter } from "@/lib/router"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PriorityBadge } from "@/components/tasks/task-badges"
import { CREATE_TASK_DRAFT_STORAGE_KEY, TaskForm } from "@/components/tasks/task-form"
import { Button } from "@/components/ui/button"
import { useStore, type TaskInput } from "@/lib/store"
import { getTaskTemplates, type TaskTemplate } from "@/lib/task-templates"

export default function CreateTaskPage() {
  const { addTask, getUser } = useStore()
  const router = useRouter()

  const [preview, setPreview] = useState<Partial<TaskInput>>({})
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  useEffect(() => {
    setTemplates(getTaskTemplates())
    const updateTemplates = () => setTemplates(getTaskTemplates())
    window.addEventListener("task-templates-changed", updateTemplates)
    return () => window.removeEventListener("task-templates-changed", updateTemplates)
  }, [])

  const handleSubmit = async (input: TaskInput) => {
    await addTask(input)
    window.localStorage.removeItem(CREATE_TASK_DRAFT_STORAGE_KEY)
    router.push("/tasks")
  }

  const handleCancel = () => {
    window.localStorage.removeItem(CREATE_TASK_DRAFT_STORAGE_KEY)
    router.back()
  }

  const assignedUserIds = [
    ...(typeof preview.assignedTo === "string" ? [preview.assignedTo] : []),
    ...(preview.people ?? []),
  ].filter((userId, index, ids) => userId && ids.indexOf(userId) === index)

  const assignedUserNames = assignedUserIds
    .map((userId) => getUser(userId)?.name)
    .filter(Boolean)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-t-xl bg-[#2563eb] px-5 py-4 text-white shadow-sm sm:px-7">
        <h1 className="text-base font-semibold">Create new task</h1>
     
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        {/* CREATE TASK FORM */}
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardContent className="px-5 pb-6 pt-5 sm:px-7">
            <p className="mb-6 text-sm text-muted-foreground">Define the task, assign it to a user, and set the schedule.</p>
            <TaskForm
              formId="create-task-form"
              showStatus={false}
              showActions={false}
              showProgress={false}
              priorityButtons
              onSubmit={handleSubmit}
              onPreviewChange={setPreview}
              templates={templates}
              submitLabel="Create Task"
              draftStorageKey={CREATE_TASK_DRAFT_STORAGE_KEY}
            />
          </CardContent>
        </Card>

        {/* TASK PREVIEW */}
        <Card className="h-fit rounded-xl border-border/60 shadow-sm xl:sticky xl:top-6">
          <CardHeader className="gap-2 px-5 pb-3 pt-5">
            <CardTitle className="text-base">Task Preview</CardTitle>

            <CardDescription className="text-xs">
              Live preview of the task you are creating.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 px-5 pb-5">
            {/* TASK TITLE */}
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Task title
              </p>

              <p className="mt-1 min-h-6 font-semibold">
                {preview.title || "Untitled task"}
              </p>

              <p className="mt-3 text-sm text-muted-foreground">
                {preview.description ||
                  "Add a description to see it here."}
              </p>
            </div>

            {/* PRIORITY */}
            <div className="flex flex-wrap gap-2">
              <PriorityBadge
                priority={preview.priority ?? "Medium"}
              />
            </div>

            <dl className="grid gap-3 border-t pt-4 text-sm">
              {/* ASSIGNED TO */}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">
                  Assigned to
                </dt>

                <dd className="max-w-[220px] text-right font-medium">
                  {assignedUserNames.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {assignedUserNames.map((name, index) => (
                        <span key={`${name}-${index}`}>
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "Not assigned"
                  )}
                </dd>
              </div>

              {/* CATEGORY */}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">
                  Category
                </dt>

                <dd className="font-medium">
                  {preview.category ?? "Project"}
                </dd>
              </div>

            </dl>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="create-task-form"
              >
                Create Task
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}