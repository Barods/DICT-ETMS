"use client"

import { Link } from "@/lib/router"
import { useMemo, useState } from "react"
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek, subMonths } from "date-fns"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PriorityBadge, StatusBadge } from "@/components/tasks/task-badges"
import { useStore } from "@/lib/store"
import type { TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const calendarStatusStyles: Record<TaskStatus, { cell: string; marker: string }> = {
  Pending: { cell: "bg-amber-50", marker: "bg-yellow-400 text-white" },
  "In Progress": { cell: "bg-blue-50", marker: "bg-blue-600 text-white" },
  Completed: { cell: "bg-emerald-50", marker: "bg-green-500 text-white" },
  Overdue: { cell: "bg-red-50", marker: "bg-red-500 text-white" },
  Cancelled: { cell: "bg-slate-100", marker: "bg-gray-500 text-white" },
}

export function DashboardCalendar() {
  const { tasks, getUser } = useStore()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<Date | null>(null)
  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) }), [month])
  const tasksOn = (date: Date) => tasks.filter((task) => isSameDay(parseISO(task.dueDate), date))
  const selectedTasks = selected ? tasksOn(selected) : []

  return (
    <>
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="gap-4 border-b px-4 pb-4 pt-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-bold">{format(month, "MMMM yyyy")}</CardTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setMonth(startOfMonth(new Date()))}>
                <CalendarDays className="size-4" />
                Today
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setMonth((value) => subMonths(value, 1))} aria-label="Previous month"><ChevronLeft className="size-4" /></Button>
              <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setMonth((value) => addMonths(value, 1))} aria-label="Next month"><ChevronRight className="size-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day} className="py-3">{day}</span>)}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayTasks = tasksOn(day)
              return (
                <button key={day.toISOString()} type="button" onClick={() => setSelected(day)} aria-label={`${format(day, "MMMM d")}, ${dayTasks.length} tasks`} className={cn("flex min-h-24 min-w-0 flex-col items-stretch border-b border-r p-1.5 text-left transition-colors hover:bg-muted/50 sm:min-h-28", !isSameMonth(day, month) && "bg-muted/20 text-muted-foreground")}>
                  <span className={cn("mb-1 flex size-7 items-center justify-center self-end rounded-full text-xs", isToday(day) && "bg-primary font-bold text-primary-foreground", !isToday(day) && "text-foreground")}>{format(day, "d")}</span>
                  <span className="flex min-w-0 flex-col gap-1">
                    {dayTasks.slice(0, 2).map((task) => <span key={task.id} className={cn("truncate rounded px-1.5 py-1 text-[10px] font-medium leading-tight", calendarStatusStyles[task.status].marker)}>{task.title}</span>)}
                    {dayTasks.length > 2 && <span className="px-1 text-[10px] font-medium text-muted-foreground">+{dayTasks.length - 2} more</span>}
                  </span>
                </button>
              )
            })}
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-3 px-4 py-4 text-xs sm:grid-cols-4 sm:px-6">
            {(["In Progress", "Completed", "Pending", "Cancelled"] as TaskStatus[]).map((status) => <li key={status} className="flex items-center gap-2"><span className={cn("size-3 rounded", calendarStatusStyles[status].marker.split(" ")[0])} aria-hidden />{status === "Completed" ? "Complete" : status}</li>)}
          </ul>
        </CardContent>
      </Card>
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected ? format(selected, "EEEE, MMMM d") : "Scheduled tasks"}</DialogTitle>
            <DialogDescription>
              {selectedTasks.length === 0 ? "There are no tasks scheduled for this day." : `${selectedTasks.length} ${selectedTasks.length === 1 ? "task" : "tasks"} scheduled for this day.`}
            </DialogDescription>
          </DialogHeader>
          {selectedTasks.length > 0 && (
            <ul className="flex flex-col gap-2">
              {selectedTasks.map((task) => (
                <li key={task.id}>
                  <Link href={`/tasks/${task.id}`} onClick={() => setSelected(null)} className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <div className="min-w-0"><p className="truncate text-sm font-medium">{task.title}</p><p className="text-xs text-muted-foreground">{getUser(task.assignedTo)?.name ?? "Unassigned"}</p></div>
                    <div className="flex shrink-0 gap-2"><StatusBadge status={task.status} /><PriorityBadge priority={task.priority} /></div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
