"use client"

import { Target } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useStore } from "@/lib/store"

export function TopPerformers() {
  const { tasks, users } = useStore()

  const rows = users
    .filter((u) => u.active)
    .map((u) => {
      const mine = tasks.filter((t) => t.assignedTo === u.id && t.status !== "Cancelled")
      const done = mine.filter((t) => t.status === "Completed").length
      return { user: u, total: mine.length, done, rate: mine.length ? Math.round((done / mine.length) * 100) : 0 }
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.rate - a.rate || b.done - a.done)
    .slice(0, 5)

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl">Top Performers</CardTitle>
          <CardDescription>Completion rate by assignee</CardDescription>
        </div>
        <Target className="size-5 text-primary" aria-hidden />
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-4">
          {rows.map((r, i) => (
            <li key={r.user.id} className="flex items-center gap-3">
              <span className="w-4 text-sm font-semibold tabular-nums text-muted-foreground">{i + 1}</span>
              <Avatar className="size-9"><AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{r.user.initials}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{r.user.name}</p>
                  <p className="text-xs tabular-nums text-muted-foreground">{r.done}/{r.total} · {r.rate}%</p>
                </div>
                <Progress value={r.rate} className="mt-1.5 h-1.5" />
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
