"use client"

import { Link } from "@/lib/router"
import { formatDistanceToNow, parseISO } from "date-fns"
import { AlertTriangle, CheckCheck, CheckCircle2, Clock, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { useStore } from "@/lib/store"
import type { Notification } from "@/lib/types"
import { cn } from "@/lib/utils"

const meta: Record<Notification["type"], { icon: typeof Clock; tone: string }> = {
  assigned: { icon: UserPlus, tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300" },
  deadline: { icon: Clock, tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300" },
  overdue: { icon: AlertTriangle, tone: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300" },
  completed: { icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300" },
}

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread ? `You have ${unread} unread notification${unread === 1 ? "" : "s"}.` : "You're all caught up."}
        actions={<Button variant="outline" onClick={markAllNotificationsRead} disabled={unread === 0}><CheckCheck className="size-4" />Mark all as read</Button>}
      />
      <ul className="flex max-w-3xl flex-col gap-3">
        {notifications.map((n) => {
          const { icon: Icon, tone } = meta[n.type]
          return (
            <li key={n.id}>
              <Card className={cn("rounded-2xl border-border/60 p-0 shadow-sm transition-colors", !n.read && "border-primary/30 bg-accent/30")}>
                <Link href={`/tasks/${n.taskId}`} onClick={() => markNotificationRead(n.id)} className="flex items-start gap-4 p-4">
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone)}><Icon className="size-5" aria-hidden /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{n.title}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatDistanceToNow(parseISO(n.at), { addSuffix: true })}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{n.message}</p>
                  </div>
                  {!n.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                </Link>
              </Card>
            </li>
          )
        })}
      </ul>
    </>
  )
}
