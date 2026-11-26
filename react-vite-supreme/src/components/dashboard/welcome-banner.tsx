"use client"

import { format } from "date-fns"
import { Bell, BriefcaseBusiness, Clock3, Moon, Sun } from "lucide-react"
import { Link } from "@/lib/router"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export function WelcomeBanner() {
  const { currentUser, notifications } = useStore()
  const { theme, setTheme } = useTheme()
  const unread = notifications.filter((notification) => !notification.read).length

  return (
    <section
      aria-label="Welcome"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2563eb] via-[#2d5fe3] to-[#4338ca] px-5 py-6 text-white shadow-sm sm:px-8 sm:py-7"
    >
      <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border-[28px] border-white/5" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -left-16 size-52 rounded-full border-[26px] border-white/5" aria-hidden />
      <div className="pointer-events-none absolute right-1/3 top-1/2 size-20 -translate-y-1/2 rounded-full bg-white/5" aria-hidden />

      <div className="relative z-10 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-10 rounded-full border-white/20 bg-white/10 text-white shadow-none hover:bg-white/20 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="size-5 dark:hidden" />
            <Moon className="hidden size-5 dark:block" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            nativeButton={false}
            render={<Link href="/notifications" aria-label="Notifications" />}
            className="relative size-10 rounded-full border-white/20 bg-white/10 text-white shadow-none hover:bg-white/20 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            aria-label="Notifications"
          >
            <Bell className="size-5" aria-hidden />
            {unread > 0 && <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unread}</span>}
          </Button>
          <div className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-sm font-bold text-white">
            {currentUser.initials}
          </div>
        </div>

      <div className="relative z-10 mt-7 flex flex-col gap-5 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">Welcome back</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{currentUser.name} ! <span aria-hidden>👋</span></h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/80">
            <span>Current status:</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#2563eb]">
              <BriefcaseBusiness className="size-3.5" aria-hidden />
              In Office
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/80 sm:flex-col sm:items-end sm:gap-0">
          <Clock3 className="size-4 sm:hidden" aria-hidden />
          <time className="text-2xl font-bold tabular-nums text-white">{format(new Date(), "HH:mm")}</time>
          <span className="hidden text-xs sm:block">{format(new Date(), "EEEE, MMMM d, yyyy")} · Local time</span>
        </div>
      </div>
    </section>
  )
}
