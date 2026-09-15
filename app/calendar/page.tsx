"use client"

import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"

export default function CalendarPage() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review scheduled tasks by date.</p>
      </div>
      <div className="min-w-0 flex-1">
        <DashboardCalendar />
      </div>
    </div>
  )
}
