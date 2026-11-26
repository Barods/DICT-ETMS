"use client"

import { Link, useParams, useRouter } from "@/lib/router"
import { useState, type FormEvent } from "react"
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Eye, FileText, Paperclip, Pencil, Play, Plus, RotateCcw, Trash2, UserPlus, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { useStore } from "@/lib/store"
import { dueLabel, formatDate, formatDateTime } from "@/lib/task-utils"
import { type ActivityEntry, type Subtask, type SubtaskStatus } from "@/lib/types"

const activityIcon: Record<ActivityEntry["type"], typeof FileText> = {
  created: FileText,
  assigned: UserPlus,
  updated: Pencil,
  status: RotateCcw,
  completed: CheckCircle2,
  comment: FileText,
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { tasks, users, getUser, setStatus, deleteTask, currentUser, addSubtask, updateTask, deleteSubtask } = useStore()
  const [editing, setEditing] = useState(false)
  const [subtaskTitle, setSubtaskTitle] = useState("")
  const [subtaskDescription, setSubtaskDescription] = useState("")
  const [subtaskAssignee, setSubtaskAssignee] = useState("")
  const [subtaskStatus, setSubtaskStatus] = useState<SubtaskStatus>("Pending")
  const [viewingSubtask, setViewingSubtask] = useState<Subtask | null>(null)
  const [editingSubtask, setEditingSubtask] = useState<{ id: string; title: string; description: string; assignedTo?: string; status: SubtaskStatus } | null>(null)
  const task = tasks.find((t) => t.id === id)

  if (!task) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold">Task not found</p>
        <p className="text-sm text-muted-foreground">The task may have been deleted.</p>
        <Button variant="outline" nativeButton={false} render={<Link href="/tasks" />}><ArrowLeft className="size-4" />Back to tasks</Button>
      </div>
    )
  }

  const canManage = currentUser.role !== "Employee" || task.createdBy === currentUser.id
  const isOpen = task.status !== "Completed" && task.status !== "Cancelled"
  const hasIncompleteSubtasks = task.subtasks.some((subtask) => !subtask.completed && subtask.status !== "Completed")

  const handleAddSubtask = async (event: FormEvent) => {
    event.preventDefault()
    if (!subtaskTitle.trim()) return
    try {
      await addSubtask(task.id, subtaskTitle, subtaskDescription, subtaskStatus, subtaskAssignee)
    } catch {
      return
    }
    setSubtaskTitle("")
    setSubtaskDescription("")
    setSubtaskAssignee("")
    setSubtaskStatus("Pending")
  }

  const handleEditSubtask = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingSubtask?.title.trim()) return
    try {
      await updateTask(task.id, {
        subtasks: task.subtasks.map((subtask) => subtask.id === editingSubtask.id
          ? { ...subtask, title: editingSubtask.title.trim(), description: editingSubtask.description.trim(), assignedTo: editingSubtask.assignedTo, status: editingSubtask.status, completed: editingSubtask.status === "Completed" }
          : subtask),
      })
      setEditingSubtask(null)
    } catch {
      return
    }
  }

  const handleDeleteTask = async () => {
    try {
      await deleteTask(task.id)
      router.push("/tasks")
    } catch {
      return
    }
  }

  const details = [
    { label: "Category", value: task.category },
    { label: "Start Date", value: formatDate(task.startDate) },
    { label: "Due Date", value: formatDate(task.dueDate) },
    { label: "Created", value: formatDateTime(task.createdAt) },
    ...(task.completedAt ? [{ label: "Completed", value: formatDateTime(task.completedAt) }] : []),
  ]

  return (
    <>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" nativeButton={false} render={<Link href="/tasks" />}><ArrowLeft className="size-4" />All Tasks</Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{task.id}</span>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{task.title}</h1>
          <p className={`flex items-center gap-2 text-sm ${task.status === "Overdue" ? "font-medium text-destructive" : "text-muted-foreground"}`}>
            <Clock className="size-4" aria-hidden />{dueLabel(task.dueDate, task.status)} · {formatDate(task.dueDate)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {task.status === "Pending" && <Button onClick={() => { void setStatus(task.id, "In Progress").catch(() => undefined) }}><Play className="size-4" />Start Task</Button>}
          {task.status === "In Progress" || task.status === "Overdue" ? <Button disabled={hasIncompleteSubtasks} title={hasIncompleteSubtasks ? "Complete all subtasks first" : undefined} onClick={() => { void setStatus(task.id, "Completed").catch(() => undefined) }}><CheckCircle2 className="size-4" />Mark Complete</Button> : null}
          {!isOpen && <Button variant="outline" onClick={() => { void setStatus(task.id, "In Progress").catch(() => undefined) }}><RotateCcw className="size-4" />Reopen</Button>}
          <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="size-4" />Edit</Button>
          {canManage && isOpen && <Button variant="outline" onClick={() => { void setStatus(task.id, "Cancelled").catch(() => undefined) }}><XCircle className="size-4" />Cancel</Button>}
          {canManage && <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => { void handleDeleteTask() }}><Trash2 className="size-4" />Delete</Button>}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold tabular-nums">{task.progress}%</span>
                <span className="text-sm text-muted-foreground">{task.progress === 100 ? "Complete" : `${100 - task.progress}% remaining`}</span>
              </div>
              <Progress value={task.progress} className="h-2.5" />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-6">
              <p className="leading-relaxed text-pretty">{task.description || "No description provided."}</p>
              {task.remarks && (
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remarks</p>
                  <p className="mt-1 text-sm leading-relaxed">{task.remarks}</p>
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attachments ({task.attachments.length})</p>
                {task.attachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No attachments.</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {task.attachments.map((a) => (
                      <li key={a} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm"><Paperclip className="size-4 text-muted-foreground" aria-hidden />{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div><CardTitle>Subtasks</CardTitle><p className="mt-1 text-xs text-muted-foreground">{task.subtasks.filter((subtask) => subtask.completed).length} of {task.subtasks.length} complete</p></div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                    <form onSubmit={handleAddSubtask} className="grid gap-2 sm:grid-cols-[1fr_1.3fr_12rem_auto]">
                <Input value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} placeholder="Subtask title" aria-label="Subtask title" />
                <Input value={subtaskDescription} onChange={(event) => setSubtaskDescription(event.target.value)} placeholder="Details or remarks" aria-label="Subtask details" />
                      <Select value={subtaskAssignee || "unassigned"} onValueChange={(value) => setSubtaskAssignee(value === "unassigned" ? "" : value ?? "")}>
                        <SelectTrigger aria-label="Subtask assignee"><SelectValue placeholder="Assignee">{users.find((user) => user.id === subtaskAssignee)?.name ?? "Unassigned"}</SelectValue></SelectTrigger>
                        <SelectContent><SelectItem value="unassigned">Unassigned</SelectItem>{users.filter((user) => user.active).map((user) => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Select value={subtaskStatus} onValueChange={(value) => value && setSubtaskStatus(value as SubtaskStatus)}>
                          <SelectTrigger className="min-w-28" aria-label="Subtask status"><SelectValue /></SelectTrigger>
                          <SelectContent>{(["Pending", "Ongoing", "Completed", "Overdue", "Cancelled"] as SubtaskStatus[]).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button type="submit" disabled={!subtaskTitle.trim()}><Plus className="size-4" />Add</Button>
                      </div>
              </form>
              {task.subtasks.length === 0 ? <p className="text-sm text-muted-foreground">No subtasks yet.</p> : (
                <ul className="flex flex-col divide-y rounded-lg border bg-card px-3">
                  {task.subtasks.map((subtask) => <li key={subtask.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className={`size-2 shrink-0 rounded-full ${subtask.completed || subtask.status === "Completed" ? "bg-emerald-500" : "bg-amber-400"}`} aria-hidden />
                    <div className="min-w-0 flex-1"><p className={`text-sm font-medium ${subtask.completed ? "text-muted-foreground line-through" : ""}`}>{subtask.title}</p><p className="truncate text-xs text-muted-foreground">{subtask.description || "No details provided."}</p></div>
                    <p className="w-full text-xs text-muted-foreground sm:w-auto"><span className="font-medium text-foreground">Assignee:</span> {subtask.assignedTo ? (getUser(subtask.assignedTo)?.name ?? "Unassigned") : "Unassigned"}</p>
                    <StatusBadge status={subtask.status === "Ongoing" ? "In Progress" : subtask.status} className="px-2 py-0 text-[10px]" />
                    <div className="flex shrink-0 gap-1">
                      <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setViewingSubtask(subtask)} aria-label={`View ${subtask.title}`} title="View subtask"><Eye className="size-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setEditingSubtask({ id: subtask.id, title: subtask.title, description: subtask.description ?? "", assignedTo: subtask.assignedTo, status: subtask.status ?? "Pending" })} aria-label={`Edit ${subtask.title}`} title="Edit subtask"><Pencil className="size-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => { void deleteSubtask(task.id, subtask.id).catch(() => undefined) }} aria-label={`Delete ${subtask.title}`} title="Delete subtask"><Trash2 className="size-4" /></Button>
                    </div>
                  </li>)}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader><CardTitle>Activity History</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative flex flex-col gap-6 border-l border-border/70 pl-6">
                {[...task.activity].reverse().map((a) => {
                  const Icon = activityIcon[a.type]
                  const actor = getUser(a.userId)
                  return (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[33px] flex size-5 items-center justify-center rounded-full border-2 border-card bg-accent text-accent-foreground">
                        <Icon className="size-3" aria-hidden />
                      </span>
                      <p className="text-sm font-medium">{a.message}</p>
                      <p className="text-xs text-muted-foreground">{actor?.name} · {formatDateTime(a.at)}</p>
                    </li>
                  )
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="flex flex-col">
                {details.map((d, i) => (
                  <div key={d.label}>
                    {i > 0 && <Separator className="my-3" />}
                    <div className="flex items-start justify-between gap-4 text-sm">
                      <dt className="text-muted-foreground">{d.label}</dt>
                      <dd className="text-right font-medium">{d.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 bg-accent/40 shadow-sm">
            <CardContent className="flex items-start gap-3 pt-6">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <p className="text-sm leading-relaxed text-pretty">
                Workflow: <span className="font-medium">Pending → In Progress → Completed</span>. Tasks that pass their due date before completion are flagged as Overdue.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <TaskDialog open={editing} onOpenChange={setEditing} task={task} />
      <Dialog open={viewingSubtask !== null} onOpenChange={(open) => !open && setViewingSubtask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>View Subtask</DialogTitle><DialogDescription>{viewingSubtask?.status}</DialogDescription></DialogHeader>
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3"><p className="font-medium">{viewingSubtask?.title}</p><p className="text-sm text-muted-foreground">{viewingSubtask?.description || "No details provided."}</p></div>
        </DialogContent>
      </Dialog>
      <Dialog open={editingSubtask !== null} onOpenChange={(open) => !open && setEditingSubtask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Subtask</DialogTitle><DialogDescription>Update the subtask title, details, and status.</DialogDescription></DialogHeader>
          <form onSubmit={handleEditSubtask} className="flex flex-col gap-3">
            <Input value={editingSubtask?.title ?? ""} onChange={(event) => setEditingSubtask((current) => current ? { ...current, title: event.target.value } : current)} placeholder="Subtask title" autoFocus />
            <Input value={editingSubtask?.description ?? ""} onChange={(event) => setEditingSubtask((current) => current ? { ...current, description: event.target.value } : current)} placeholder="Details or remarks" />
            <Select value={editingSubtask?.assignedTo ?? "unassigned"} onValueChange={(value) => setEditingSubtask((current) => current ? { ...current, assignedTo: !value || value === "unassigned" ? undefined : value } : current)}><SelectTrigger aria-label="Subtask assignee"><SelectValue placeholder="Assignee">{users.find((user) => user.id === editingSubtask?.assignedTo)?.name ?? "Unassigned"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="unassigned">Unassigned</SelectItem>{users.filter((user) => user.active).map((user) => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}</SelectContent></Select>
            <Select value={editingSubtask?.status ?? "Pending"} onValueChange={(value) => value && setEditingSubtask((current) => current ? { ...current, status: value as SubtaskStatus } : current)}><SelectTrigger aria-label="Subtask status"><SelectValue /></SelectTrigger><SelectContent>{(["Pending", "Ongoing", "Completed", "Overdue", "Cancelled"] as SubtaskStatus[]).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditingSubtask(null)}>Cancel</Button><Button type="submit">Save Changes</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
