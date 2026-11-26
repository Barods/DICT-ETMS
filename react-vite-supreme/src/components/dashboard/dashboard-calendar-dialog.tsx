"use client"

import { CalendarDays } from "lucide-react"
import { useState } from "react"
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function DashboardCalendarDialog({
  className,
  variant = "outline",
}: {
  className?: string
  variant?: "default" | "outline" | "ghost"
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" variant={variant} className={className ?? "gap-2"} onClick={() => setOpen(true)}>
        <CalendarDays className="size-4" />
        Calendar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task calendar</DialogTitle>
            <DialogDescription>Review scheduled tasks by date.</DialogDescription>
          </DialogHeader>
          <DashboardCalendar />
        </DialogContent>
      </Dialog>
    </>
  )
}