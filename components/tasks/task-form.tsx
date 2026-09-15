"use client"

import { useState, type FormEvent } from "react"
import { useEffect } from "react"
import { formatISO } from "date-fns"
import { ChevronDown, Eye, Paperclip, Pencil, Plus, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useStore, type TaskInput } from "@/lib/store"
import { calculateProgress, toDateInput } from "@/lib/task-utils"
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_STATUSES, type Subtask, type SubtaskStatus, type Task, type TaskPriority, type TaskStatus } from "@/lib/types"

interface Props {
  task?: Task
  onSubmit: (input: TaskInput) => void
  onPreviewChange?: (input: Partial<TaskInput>) => void
  onCancel?: () => void
  submitLabel?: string
  formId?: string
  showStatus?: boolean
  showActions?: boolean
  priorityButtons?: boolean
  showProgress?: boolean
}

export function TaskForm({ task, onSubmit, onPreviewChange, onCancel, submitLabel = "Save Task", formId, showStatus = true, showActions = true, priorityButtons = false, showProgress = true }: Props) {
  const { users, currentUser } = useStore()
  const todayInput = toDateInput(formatISO(new Date()))

  const [title, setTitle] = useState(task?.title ?? "")
  const [description, setDescription] = useState(task?.description ?? "")
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo ?? "")
  const [additionalAssignees, setAdditionalAssignees] = useState<string[]>(task?.people ?? [])
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false)
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "Medium")
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "Pending")
  const [startDate, setStartDate] = useState(task ? toDateInput(task.startDate) : todayInput)
  const [dueDate, setDueDate] = useState(task ? toDateInput(task.dueDate) : "")
  const [category, setCategory] = useState(task?.category ?? TASK_CATEGORIES[0])
  const [attachments, setAttachments] = useState<string[]>(task?.attachments ?? [])
  const [attachmentDraft, setAttachmentDraft] = useState("")
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks ?? [])
  const [subtaskTitle, setSubtaskTitle] = useState("")
  const [subtaskDescription, setSubtaskDescription] = useState("")
  const [subtaskAssignee, setSubtaskAssignee] = useState("")
  const [subtaskStatus, setSubtaskStatus] = useState<SubtaskStatus>("Pending")
  const [viewingSubtask, setViewingSubtask] = useState<Subtask | null>(null)
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null)
  const [error, setError] = useState<string | null>(null)
  const progress = calculateProgress(subtasks)

  useEffect(() => {
    onPreviewChange?.({ title, description, assignedTo, people: additionalAssignees, priority, status, category, progress, subtasks })
  }, [additionalAssignees, assignedTo, category, description, onPreviewChange, priority, progress, status, subtasks, title])

  const selectedAssigneeIds = [assignedTo, ...additionalAssignees].filter(
    (id, index, list) => id && list.indexOf(id) === index,
  )

  const toggleAssignee = (userId: string) => {
    if (selectedAssigneeIds.includes(userId)) {
      if (userId === assignedTo) {
        const nextPrimary = additionalAssignees[0] ?? ""
        setAssignedTo(nextPrimary)
        setAdditionalAssignees(additionalAssignees.slice(1))
      } else {
        setAdditionalAssignees((current) => current.filter((id) => id !== userId))
      }
      return
    }

    if (!assignedTo) {
      setAssignedTo(userId)
    } else {
      setAdditionalAssignees((current) => [...current, userId])
    }
  }

  const addAttachment = () => {
    const name = attachmentDraft.trim()
    if (!name) return
    setAttachments((a) => [...a, name])
    setAttachmentDraft("")
  }

  const addSubtask = () => {
    const cleanTitle = subtaskTitle.trim()
    if (!cleanTitle) return
    setSubtasks((current) => [...current, {
      id: `draft-${Date.now()}`,
      title: cleanTitle,
      description: subtaskDescription.trim(),
      assignedTo: subtaskAssignee || undefined,
      status: subtaskStatus,
      completed: subtaskStatus === "Completed",
    }])
    setSubtaskTitle("")
    setSubtaskDescription("")
    setSubtaskAssignee("")
    setSubtaskStatus("Pending")
  }

  const saveSubtask = () => {
    if (!editingSubtask?.title.trim()) return
    setSubtasks((current) => current.map((subtask) => subtask.id === editingSubtask.id
      ? { ...editingSubtask, title: editingSubtask.title.trim(), description: editingSubtask.description.trim(), completed: editingSubtask.status === "Completed" }
      : subtask))
    setEditingSubtask(null)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setError("Task title is required.")
    if (selectedAssigneeIds.length === 0) return setError("Please assign the task to at least one user.")
    if (!dueDate) return setError("Due date is required.")
    if (new Date(dueDate) < new Date(startDate)) return setError("Due date cannot be before the start date.")
    setError(null)
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      people: additionalAssignees,
      priority,
      status,
      startDate: formatISO(new Date(`${startDate}T09:00:00`)),
      dueDate: formatISO(new Date(`${dueDate}T17:00:00`)),
      category,
      attachments,
      remarks: "",
      subtasks,
      progress: status === "Completed" ? 100 : progress,
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title" className="text-xs">Task title <span className="text-destructive">*</span></Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. add task title" className="h-9 text-sm" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="assignedTo" className="text-xs">Assignee <span className="text-destructive">*</span></Label>
          <div className="relative">
            <button
              id="assignedTo"
              type="button"
              aria-expanded={assigneeMenuOpen}
              onClick={() => setAssigneeMenuOpen((open) => !open)}
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <span className={selectedAssigneeIds.length ? "truncate" : "text-muted-foreground"}>
                {selectedAssigneeIds.length
                  ? selectedAssigneeIds.map((id) => users.find((user) => user.id === id)?.name).filter(Boolean).join(", ")
                  : "Select users"}
              </span>
              <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
            </button>
            {assigneeMenuOpen && (
              <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                {users.filter((u) => u.active).map((u) => {
                  const selected = selectedAssigneeIds.includes(u.id)
                  return (
                    <label
                      key={u.id}
                      className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleAssignee(u.id)}
                        className="size-4 shrink-0 rounded border-input accent-primary"
                        aria-label={`Assign task to ${u.name}`}
                      />
                      <span>{u.name} <span className="text-muted-foreground">· {u.department}</span></span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category" className="text-xs">Category <span className="text-destructive">*</span></Label>
          <Select value={category} onValueChange={(v) => v && setCategory(v)}>
            <SelectTrigger id="category" className="h-9 w-full text-sm"><SelectValue placeholder="Add category" /></SelectTrigger>
            <SelectContent>{TASK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="startDate" className="text-xs">Start date <span className="text-destructive">*</span></Label>
          <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={!task} className="h-9 text-sm" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="priority" className="text-xs">Priority <span className="text-destructive">*</span></Label>
          {priorityButtons ? (
            <div id="priority" className="grid grid-cols-3 gap-2" role="group" aria-label="Priority">
              {TASK_PRIORITIES.filter((value) => value !== "Urgent").map((value) => (
                <Button key={value} type="button" variant={priority === value ? "default" : "outline"} className="h-9" onClick={() => setPriority(value)} aria-pressed={priority === value}>
                  {value}
                </Button>
              ))}
            </div>
          ) : (
            <Select value={priority} onValueChange={(v) => v && setPriority(v as TaskPriority)}>
              <SelectTrigger id="priority" className="h-9 w-full text-sm"><SelectValue placeholder="Add priority" /></SelectTrigger>
              <SelectContent>{TASK_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        {showStatus && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="status" className="text-xs">Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as TaskStatus)}>
              <SelectTrigger id="status" className="h-9 w-full text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="dueDate" className="text-xs">Due date <span className="text-destructive">*</span></Label>
          <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9 text-sm" required />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description" className="text-xs">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Write something..." className="resize-none text-sm" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="attachment" className="text-xs">Attachments</Label>
        <label htmlFor="attachment" className="flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/10 px-4 py-3 text-center transition-colors hover:bg-muted/30">
          <Upload className="size-4 text-primary" />
          <span className="text-xs font-medium">Click to upload or drag a file here</span>
          <span className="text-[11px] text-muted-foreground">No files chosen</span>
        </label>
        <div className="flex gap-2">
          <Input
            id="attachment"
            type="file"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setAttachments((list) => [...list, file.name])
              e.currentTarget.value = ""
            }}
          />
          <Input
            id="attachment-name"
            value={attachmentDraft}
            onChange={(e) => setAttachmentDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                addAttachment()
              }
            }}
            placeholder="Add attachment name"
          />
          <Button type="button" variant="outline" onClick={addAttachment}><Paperclip className="size-4" />Add</Button>
        </div>
        {attachments.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {attachments.map((a) => (
              <li key={a} className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                <Paperclip className="size-3" aria-hidden />{a}
                <button type="button" onClick={() => setAttachments((list) => list.filter((x) => x !== a))} aria-label={`Remove ${a}`} className="ml-1 rounded hover:bg-muted">
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <Label className="text-xs">Subtasks</Label>
          <p className="mt-1 text-xs text-muted-foreground">Add the notes or instructions as actionable subtasks.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_1.2fr_1fr_auto]">
          <Input value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} placeholder="Subtask title" aria-label="Subtask title" />
          <Input value={subtaskDescription} onChange={(e) => setSubtaskDescription(e.target.value)} placeholder="Details or remarks" aria-label="Subtask details" />
          <Select value={subtaskAssignee || "none"} onValueChange={(value) => setSubtaskAssignee(value === "none" ? "" : value ?? "")}><SelectTrigger aria-label="Subtask assignee"><SelectValue placeholder="Assign to">{users.find((user) => user.id === subtaskAssignee)?.name ?? "Unassigned"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="none">Unassigned</SelectItem>{users.filter((user) => user.active).map((user) => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}</SelectContent></Select>
          <Button type="button" variant="outline" onClick={addSubtask} disabled={!subtaskTitle.trim()}><Plus className="size-4" />Add</Button>
        </div>
        {subtasks.length > 0 && <ul className="divide-y rounded-md border">
          {subtasks.map((subtask) => <li key={subtask.id} className="flex items-center gap-2 px-3 py-2">
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{subtask.title}</p><p className="truncate text-xs text-muted-foreground">{subtask.description || "No details provided."}{subtask.assignedTo ? ` · ${users.find((user) => user.id === subtask.assignedTo)?.name ?? "Unassigned"}` : ""}</p></div>
            <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setViewingSubtask(subtask)} aria-label={`View ${subtask.title}`} title="View subtask"><Eye className="size-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setEditingSubtask({ ...subtask })} aria-label={`Edit ${subtask.title}`} title="Edit subtask"><Pencil className="size-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setSubtasks((current) => current.filter((item) => item.id !== subtask.id))} aria-label={`Delete ${subtask.title}`} title="Delete subtask"><Trash2 className="size-4" /></Button>
          </li>)}
        </ul>}
      </div>

      <Dialog open={viewingSubtask !== null} onOpenChange={(open) => !open && setViewingSubtask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>View Subtask</DialogTitle><DialogDescription>{viewingSubtask?.status}</DialogDescription></DialogHeader>
          <div className="flex flex-col gap-2"><p className="font-medium">{viewingSubtask?.title}</p><p className="text-sm text-muted-foreground">{viewingSubtask?.description || "No details provided."}</p><p className="text-sm text-muted-foreground">Assignee: {users.find((user) => user.id === viewingSubtask?.assignedTo)?.name ?? "Unassigned"}</p></div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingSubtask !== null} onOpenChange={(open) => !open && setEditingSubtask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Subtask</DialogTitle><DialogDescription>Update this subtask before saving the task.</DialogDescription></DialogHeader>
          <div className="flex flex-col gap-3">
            <Input value={editingSubtask?.title ?? ""} onChange={(e) => setEditingSubtask((current) => current ? { ...current, title: e.target.value } : current)} placeholder="Subtask title" />
            <Textarea value={editingSubtask?.description ?? ""} onChange={(e) => setEditingSubtask((current) => current ? { ...current, description: e.target.value } : current)} placeholder="Details or remarks" />
            <Select value={editingSubtask?.assignedTo ?? "none"} onValueChange={(value) => value && setEditingSubtask((current) => current ? { ...current, assignedTo: value === "none" ? undefined : value } : current)}><SelectTrigger aria-label="Subtask assignee"><SelectValue placeholder="Select assignee">{users.find((user) => user.id === editingSubtask?.assignedTo)?.name ?? "Unassigned"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="none">Unassigned</SelectItem>{users.filter((user) => user.active).map((user) => <SelectItem key={user.id} value={user.id}>{user.name} · {user.department}</SelectItem>)}</SelectContent></Select>
            <Select value={editingSubtask?.status ?? "Pending"} onValueChange={(value) => value && setEditingSubtask((current) => current ? { ...current, status: value as SubtaskStatus } : current)}><SelectTrigger aria-label="Subtask status"><SelectValue /></SelectTrigger><SelectContent>{(["Pending", "Ongoing", "Completed", "Overdue", "Cancelled"] as SubtaskStatus[]).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditingSubtask(null)}>Cancel</Button><Button type="button" onClick={saveSubtask}>Save Changes</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}

      {showActions && (
        <div className="flex justify-end gap-2 border-t pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit">{submitLabel}</Button>
        </div>
      )}
    </form>
  )
}
