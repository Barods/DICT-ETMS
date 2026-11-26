"use client"

import { isToday, parseISO } from "date-fns"
import { ArrowRight, CheckCircle2, Clock3, FileBarChart2, TriangleAlert } from "lucide-react"
import { Link } from "@/lib/router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export function DailyReport() {
  const { tasks } = useStore()
  const today = tasks.filter((task) => isToday(parseISO(task.dueDate)))
  const completed = today.filter((task) => task.status === "Completed").length
  const active = today.filter((task) => task.status !== "Completed" && task.status !== "Cancelled").length
  const overdue = tasks.filter((task) => task.status === "Overdue").length
  const metrics = [
    { label: "Due today", value: today.length, icon: Clock3, tone: "text-primary" },
    { label: "Completed", value: completed, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "Needs attention", value: active + overdue, icon: TriangleAlert, tone: "text-destructive" },
  ]

  return <Card className="rounded-xl border-border/60 shadow-sm"><CardHeader className="flex flex-row items-center justify-between gap-3 border-b"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><FileBarChart2 className="size-4" aria-hidden /></span><div><CardTitle className="text-base">Daily report</CardTitle><p className="text-xs text-muted-foreground">Today&apos;s task activity at a glance</p></div></div><Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/reports" />}>Open reports <ArrowRight className="size-4" /></Button></CardHeader><CardContent className="grid gap-4 pt-4 sm:grid-cols-3">{metrics.map((metric) => <div key={metric.label} className="flex items-center gap-3"><metric.icon className={`size-5 ${metric.tone}`} aria-hidden /><div><p className="text-2xl font-bold tabular-nums">{metric.value}</p><p className="text-xs text-muted-foreground">{metric.label}</p></div></div>)}</CardContent></Card>
}
