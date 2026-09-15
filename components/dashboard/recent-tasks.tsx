"use client"

import { Link } from "@/lib/router"
import { useState } from "react"
import { CalendarDays, Columns2, Filter, ListTodo, Plus, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { useStore } from "@/lib/store"
import { dueLabel, formatDate } from "@/lib/task-utils"
import type { Task } from "@/lib/types"

function TaskRow({ task }: { task: Task }) {
  const { getUser } = useStore()
  const user = getUser(task.assignedTo)
  return (
    <li>
      <Link href={`/tasks/${task.id}`} className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60">
        <Avatar className="size-8 shrink-0"><AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{user?.initials}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{task.title}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.name ?? "Unassigned"} · {user?.role ?? "No role"} · Due {formatDate(task.dueDate)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </Link>
    </li>
  )
}

export function RecentTasks() {
  const { tasks } = useStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredTasks = tasks.filter((task) => task.title.toLowerCase().includes(search.toLowerCase().trim()))
  const recent = [...filteredTasks].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5)
  const completed = filteredTasks.filter((t) => t.completedAt).sort((a, b) => +new Date(b.completedAt!) - +new Date(a.completedAt!)).slice(0, 5)
  const upcoming = filteredTasks
    .filter((t) => t.status !== "Completed" && t.status !== "Cancelled" && new Date(t.dueDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
    .slice(0, 5)

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-xl">Task Activities</CardTitle>
          <CardDescription>Recently created, completed, and upcoming deadlines</CardDescription>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/tasks" />}>View All Task</Button>
           <Button size="sm" nativeButton={false} render={<Link href="/tasks/new" />}><Plus className="size-4" />Create Task</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." aria-label="Search tasks" className="h-9 pl-9" />
          </div>
          <Button type="button" variant="outline" size="icon" aria-label="Change task view" title="Change task view"><Columns2 className="size-4" /></Button>
          <Button type="button" variant="outline" size="icon" aria-label="Filter tasks" title="Filter tasks"><Filter className="size-4" /></Button>
        </div>
        <Tabs defaultValue="recent">
          <TabsList className="mb-2 w-full justify-start overflow-x-auto">
            <TabsTrigger value="recent"><ListTodo className="size-4" />Recently Created</TabsTrigger>
            <TabsTrigger value="completed"><ListTodo className="size-4" />Recently Completed</TabsTrigger>
            <TabsTrigger value="upcoming"><CalendarDays className="size-4" />Upcoming Deadlines</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>
          <TabsContent value="recent"><ul className="flex flex-col divide-y divide-border/60">{recent.map((t) => <TaskRow key={t.id} task={t} />)}</ul></TabsContent>
          <TabsContent value="completed"><ul className="flex flex-col divide-y divide-border/60">{completed.map((t) => <TaskRow key={t.id} task={t} />)}</ul></TabsContent>
          <TabsContent value="upcoming">
            <ul className="flex flex-col divide-y divide-border/60">
              {upcoming.map((t) => (
                <li key={t.id}>
                  <Link href={`/tasks/${t.id}`} className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60">
                    <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <span className="text-[10px] font-semibold uppercase leading-none">{formatDate(t.dueDate).slice(0, 3)}</span>
                      <span className="text-lg font-bold leading-tight">{new Date(t.dueDate).getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{dueLabel(t.dueDate, t.status)}</p>
                    </div>
                    <PriorityBadge priority={t.priority} />
                  </Link>
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="status"><ul className="flex flex-col divide-y divide-border/60">{filteredTasks.slice(0, 5).map((t) => <TaskRow key={t.id} task={t} />)}</ul></TabsContent>
        </Tabs>
      </CardContent>
      <TaskDialog open={open} onOpenChange={setOpen} />
    </Card>
  )
}
