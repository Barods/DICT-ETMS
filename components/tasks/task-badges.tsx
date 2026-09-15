import { cn } from "@/lib/utils"
import { priorityStyles, statusDot, statusStyles } from "@/lib/task-utils"
import type { TaskPriority, TaskStatus } from "@/lib/types"

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        statusStyles[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", statusDot[status])} aria-hidden />
      {status}
    </span>
  )
}

export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        priorityStyles[priority],
        className,
      )}
    >
      {priority}
    </span>
  )
}
