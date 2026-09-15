"use client"

import { Link } from "@/lib/router"
import { Fragment, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, ArrowUpDown, ChevronDown, Eye, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PriorityBadge, StatusBadge } from "./task-badges"
import { TaskDialog } from "./task-dialog"
import { useStore } from "@/lib/store"
import { dueLabel, priorityRank } from "@/lib/task-utils"
import { TASK_STATUSES, type Task } from "@/lib/types"
import { cn } from "@/lib/utils"

type SortKey = "dueDate" | "priority" | "createdAt"

export function TaskTable({ tasks, showAssignee = true, emptyMessage = "No tasks match your filters." }: { tasks: Task[]; showAssignee?: boolean; emptyMessage?: string }) {
  const { getUser, deleteTask, currentUser } = useStore()
  const [query, setQuery] = useState("")
  const [status, setStatusFilter] = useState("all")
  const [sort, setSort] = useState<SortKey>("dueDate")
  const [dir, setDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Task | undefined>()
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    const list = tasks.filter((t) => {
      const assigneeName = getUser(t.assignedTo)?.name.toLowerCase() ?? ""
      const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || assigneeName.includes(q) || t.id.toLowerCase().includes(q)
      return matchesQuery
        && (status === "all" || t.status === status)
    })
    list.sort((a, b) => {
      let cmp = 0
      if (sort === "priority") cmp = priorityRank[a.priority] - priorityRank[b.priority]
      else cmp = new Date(a[sort]).getTime() - new Date(b[sort]).getTime()
      return dir === "asc" ? cmp : -cmp
    })
    return list
  }, [tasks, query, status, sort, dir, getUser])

  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visibleTasks = filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key: SortKey) => {
    if (sort === key) setDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSort(key); setDir("asc") }
  }

  const canManage = currentUser.role !== "Employee"

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 border-y bg-card p-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search by title, description, ID or assignee" className="h-8 border-0 bg-transparent pl-8 text-xs shadow-none focus-visible:ring-0" aria-label="Search tasks" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select value={status} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="h-8 w-full border-border/70 bg-card text-xs sm:w-32" aria-label="Filter by status"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All statuses</SelectItem>{TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort((v ?? "dueDate") as SortKey)}>
            <SelectTrigger className="h-8 w-full border-border/70 bg-card text-xs sm:w-32" aria-label="Sort by"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="dueDate">Sort: Deadline</SelectItem><SelectItem value="priority">Sort: Priority</SelectItem><SelectItem value="createdAt">Sort: Created</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden border-y bg-card">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="h-9 bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[24%] min-w-56 px-1 text-[10px] uppercase text-muted-foreground">Task</TableHead>
              {showAssignee && <TableHead className="min-w-40 px-1 text-[10px] uppercase text-muted-foreground">Assignees</TableHead>}
              <TableHead className="min-w-24 px-1 text-[10px] uppercase text-muted-foreground">Category</TableHead>
              <TableHead className="min-w-20 px-1 text-[10px] uppercase text-muted-foreground">Priority</TableHead>
              <TableHead className="px-1 text-[10px] uppercase text-muted-foreground">Status</TableHead>
              <TableHead className="min-w-32 px-1 text-[10px] uppercase text-muted-foreground">Progress</TableHead>
              <TableHead className="min-w-40 px-1 text-[10px] uppercase text-muted-foreground">
                <button type="button" onClick={() => toggleSort("dueDate")} className="inline-flex items-center gap-1 font-medium hover:text-foreground">Schedule <ArrowUpDown className="size-3" aria-hidden /></button>
              </TableHead>
              <TableHead className="w-16 px-1 text-center text-[10px] uppercase text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={showAssignee ? 8 : 7} className="py-12 text-center text-muted-foreground">{emptyMessage}</TableCell></TableRow>
            )}
            {visibleTasks.map((t) => {
              const overdue = t.status === "Overdue"
              const expanded = expandedTaskId === t.id
              return (
                <Fragment key={t.id}>
                <TableRow className="group h-10">
                  <TableCell className="px-1">
                    <div className="flex items-start gap-2">
                      <Button type="button" variant="ghost" size="icon" className="mt-0.5 size-7 shrink-0" onClick={() => setExpandedTaskId(expanded ? null : t.id)} aria-label={`${expanded ? "Collapse" : "Expand"} subtasks for ${t.title}`} aria-expanded={expanded}>
                        <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
                      </Button>
                      <Link href={`/tasks/${t.id}`} className="block min-w-0">
                        <p className="text-xs font-medium leading-snug group-hover:text-primary">{t.title}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{t.id} · {t.category} · {t.subtasks.filter((subtask) => subtask.completed).length}/{t.subtasks.length} subtasks</p>
                      </Link>
                    </div>
                  </TableCell>
                  {showAssignee && <TableCell className="px-1 align-top">
                    <div className="flex max-w-44 flex-col gap-0.5 text-xs">
                      {[t.assignedTo, ...t.people].filter((id, index, ids) => id && ids.indexOf(id) === index).map((id) => <span key={id} className="truncate">{getUser(id)?.name ?? "Unassigned"}</span>)}
                    </div>
                  </TableCell>}
                  <TableCell className="px-1 align-top text-xs">{t.category}</TableCell>
                  <TableCell className="px-1 align-top"><PriorityBadge priority={t.priority} className="px-1.5 py-0 text-[10px]" /></TableCell>
                  <TableCell className="px-1"><StatusBadge status={t.status} className="px-2 py-0 text-[10px]" /></TableCell>
                  <TableCell className="px-1">
                    <div className="flex items-center gap-2">
                      <Progress value={t.progress} className="h-1.5" />
                      <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{t.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-1">
                    <p className="whitespace-nowrap text-xs">{t.startDate.slice(0, 10)} to {t.dueDate.slice(0, 10)}</p>
                    <p className={cn("text-[10px]", overdue ? "font-medium text-destructive" : "text-muted-foreground")}>{dueLabel(t.dueDate, t.status)}</p>
                  </TableCell>
                  <TableCell className="w-16 px-1 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${t.title}`} title="Actions" />}>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem render={<Link href={`/tasks/${t.id}`} />}><Eye className="size-4" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditing(t)}><Pencil className="size-4" />Edit</DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => deleteTask(t.id)}><Trash2 className="size-4" />Delete</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {expanded && (
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableCell colSpan={showAssignee ? 8 : 7} className="p-0">
                      <div className="border-t px-12 py-4">
                        <dl className="mb-4 grid gap-3 border-b pb-4 text-sm sm:grid-cols-2">
                          <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-muted-foreground">Description</dt><dd className="mt-1 whitespace-pre-wrap">{t.description || "No description provided."}</dd></div>
                          <div><dt className="text-xs font-semibold uppercase text-muted-foreground">Created by</dt><dd className="mt-1">{getUser(t.createdBy)?.name ?? "Unknown"}</dd></div>
                          <div><dt className="text-xs font-semibold uppercase text-muted-foreground">Created</dt><dd className="mt-1">{t.createdAt.slice(0, 10)}</dd></div>
                          <div><dt className="text-xs font-semibold uppercase text-muted-foreground">Attachments</dt><dd className="mt-1">{t.attachments.length ? t.attachments.join(", ") : "None"}</dd></div>
                          <div><dt className="text-xs font-semibold uppercase text-muted-foreground">Remarks</dt><dd className="mt-1 whitespace-pre-wrap">{t.remarks || "None"}</dd></div>
                        </dl>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold">Subtasks</p>
                          <span className="text-xs text-muted-foreground">{t.subtasks.filter((subtask) => subtask.completed).length} of {t.subtasks.length} complete</span>
                        </div>
                        {t.subtasks.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No subtasks yet.</p>
                        ) : (
                          <ul className="flex flex-col divide-y divide-border/60 rounded-lg border bg-card px-3">
                            {t.subtasks.map((subtask) => (
                              <li key={subtask.id} className="flex items-center gap-3 py-2.5">
                                <span className={cn("size-2 rounded-full", subtask.status === "Completed" || subtask.completed ? "bg-emerald-500" : "bg-muted-foreground/40")} aria-hidden />
                                <div className="min-w-0 flex-1">
                                  <p className={`text-sm ${subtask.status === "Completed" ? "text-muted-foreground line-through" : ""}`}>{subtask.title}</p>
                                  <p className="truncate text-xs text-muted-foreground">{subtask.description || "No details provided."} · {subtask.assignedTo ? (getUser(subtask.assignedTo)?.name ?? "Unassigned") : "Unassigned"}</p>
                                </div>
                                <StatusBadge status={subtask.status === "Ongoing" ? "In Progress" : subtask.status} className="px-2 py-0 text-[10px]" />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {Math.min(filtered.length, pageSize)} of {filtered.length} records</span>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon-sm" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page"><ArrowLeft className="size-3.5" /></Button>
          <span>Page {page} of {pageCount}</span>
          <Button type="button" variant="outline" size="icon-sm" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} aria-label="Next page"><ArrowRight className="size-3.5" /></Button>
        </div>
      </div>

      <TaskDialog open={!!editing} onOpenChange={(o) => !o && setEditing(undefined)} task={editing} />

    </div>
  )
}
