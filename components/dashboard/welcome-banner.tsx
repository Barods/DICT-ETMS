"use client"

import { format } from "date-fns"
import { Clock3 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useStore } from "@/lib/store"

export function WelcomeBanner() {
  const { currentUser } = useStore()

  return (
    <section
      aria-label="Welcome"
      className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-12 border-2 border-primary/20"><AvatarFallback className="bg-accent font-semibold text-accent-foreground">{currentUser.initials}</AvatarFallback></Avatar>
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{currentUser.name}!</h1>
          <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")} · In Office</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0">
        <Clock3 className="size-4 text-muted-foreground sm:hidden" aria-hidden />
        <time className="text-2xl font-bold tabular-nums">{format(new Date(), "HH:mm")}</time>
        <span className="hidden text-xs text-muted-foreground sm:block">Local time</span>
      </div>
    </section>
  )
}
