"use client"

import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge, PriorityBadge } from "@/components/tasks/task-badges"
import { useStore } from "@/lib/store"
import { formatDate } from "@/lib/task-utils"
import { DEPARTMENTS, TASK_CATEGORIES } from "@/lib/types"

const tooltipStyle = { borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--card-foreground)" }

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const { tasks, users, getUser } = useStore()

  const active = tasks.filter((t) => t.status !== "Cancelled")
  const completed = active.filter((t) => t.status === "Completed")
  const pending = active.filter((t) => t.status !== "Completed")
  const overdue = tasks.filter((t) => t.status === "Overdue")
  const completionRate = active.length ? Math.round((completed.length / active.length) * 100) : 0
  const onTime = completed.filter((t) => t.completedAt && new Date(t.completedAt) <= new Date(t.dueDate)).length
  const onTimeRate = completed.length ? Math.round((onTime / completed.length) * 100) : 0

  const byCategory = TASK_CATEGORIES.map((c) => {
    const list = active.filter((t) => t.category === c)
    return { name: c, Completed: list.filter((t) => t.status === "Completed").length, Pending: list.filter((t) => t.status !== "Completed").length }
  })

  const byDepartment = DEPARTMENTS.map((d) => {
    const ids = users.filter((u) => u.department === d).map((u) => u.id)
    const list = active.filter((t) => ids.includes(t.assignedTo))
    const done = list.filter((t) => t.status === "Completed").length
    return { name: d, total: list.length, done, rate: list.length ? Math.round((done / list.length) * 100) : 0 }
  }).filter((d) => d.total > 0)

  const productivity = users
    .map((u) => {
      const list = active.filter((t) => t.assignedTo === u.id)
      const done = list.filter((t) => t.status === "Completed").length
      const late = list.filter((t) => t.status === "Overdue").length
      return { user: u, total: list.length, done, late, rate: list.length ? Math.round((done / list.length) * 100) : 0 }
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.rate - a.rate)

  const exportCsv = () =>
    downloadCsv("etms-task-report.csv", [
      ["ID", "Title", "Assigned To", "Created By", "Priority", "Status", "Category", "Start Date", "Due Date", "Progress"],
      ...tasks.map((t) => [t.id, t.title, getUser(t.assignedTo)?.name ?? "", getUser(t.createdBy)?.name ?? "", t.priority, t.status, t.category, formatDate(t.startDate), formatDate(t.dueDate), `${t.progress}%`]),
    ])

  return (
    <>
      <PageHeader
        title="Reports"
        description="Task completion, overdue analysis, and productivity statistics across the organization."
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}><FileText className="size-4" />Export PDF</Button>
            <Button onClick={exportCsv}><FileSpreadsheet className="size-4" />Export Excel (CSV)</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Completion Rate", value: `${completionRate}%`, hint: `${completed.length} of ${active.length} tasks` },
          { label: "Pending Tasks", value: pending.length, hint: "Not yet completed" },
          { label: "Overdue Tasks", value: overdue.length, hint: "Past due date", tone: "text-destructive" },
          { label: "On-time Delivery", value: `${onTimeRate}%`, hint: `${onTime} completed on time` },
        ].map((s) => (
          <Card key={s.label} className="gap-1 rounded-2xl border-border/60 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className={`text-3xl font-bold tabular-nums ${s.tone ?? ""}`}>{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.hint}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Completed vs Pending by Category</CardTitle>
            <CardDescription>Active tasks grouped by category</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} barGap={4}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} interval={0} tick={{ fill: "var(--muted-foreground)" }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} tick={{ fill: "var(--muted-foreground)" }} />
                <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Pending" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Department Completion Rate</CardTitle>
            <CardDescription>Percentage of assigned tasks completed</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDepartment} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: "var(--muted-foreground)" }} />
                <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} fontSize={12} tick={{ fill: "var(--muted-foreground)" }} />
                <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Completion"]} />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                  {byDepartment.map((d) => <Cell key={d.name} fill={d.rate >= 50 ? "#10b981" : "#3b82f6"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Productivity Statistics</CardTitle>
            <CardDescription>Per-user task completion</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead className="text-right">Tasks</TableHead>
                  <TableHead className="text-right">Done</TableHead>
                  <TableHead className="text-right">Overdue</TableHead>
                  <TableHead className="w-40 pr-6">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productivity.map((r) => (
                  <TableRow key={r.user.id}>
                    <TableCell className="pl-6">
                      <p className="font-medium">{r.user.name}</p>
                      <p className="text-xs text-muted-foreground">{r.user.department}</p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.total}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.done}</TableCell>
                    <TableCell className={`text-right tabular-nums ${r.late ? "font-medium text-destructive" : ""}`}>{r.late}</TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center gap-2"><Progress value={r.rate} className="h-1.5" /><span className="w-9 text-right text-xs tabular-nums">{r.rate}%</span></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Overdue Tasks</CardTitle>
            <CardDescription>Tasks that passed their due date without completion</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {overdue.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">No overdue tasks.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Task</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="pr-6">Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdue.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="pl-6">
                        <p className="font-medium">{t.title}</p>
                        <StatusBadge status={t.status} className="mt-1" />
                      </TableCell>
                      <TableCell className="text-sm">{getUser(t.assignedTo)?.name}</TableCell>
                      <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                      <TableCell className="pr-6 text-sm text-destructive">{formatDate(t.dueDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><Download className="size-3.5" aria-hidden />PDF export uses your browser&apos;s print dialog. CSV opens directly in Excel.</p>
    </>
  )
}
