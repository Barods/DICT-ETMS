"use client"

import { Link } from "@/lib/router"
import { Bell, Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStore } from "@/lib/store"

export function Topbar({ onMenuClick, dashboard = false }: { onMenuClick: () => void; dashboard?: boolean }) {
  const { theme, setTheme } = useTheme()
  const { notifications, currentUser } = useStore()
  const unread = notifications.filter((n) => !n.read).length
  const recentNotifications = notifications.slice(0, 4)

  if (dashboard) {
    return (
      <header className="flex items-center px-4 py-3 lg:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open navigation"><Menu className="size-5" /></Button>
      </header>
    )
  }

  return (
    <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation">
        <Menu className="size-5" />
      </Button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-11 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="relative size-11 rounded-full bg-card dark:border-slate-700 dark:bg-slate-900" />} aria-label="Notifications">
              <Bell className="size-5 dark:text-slate-50" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-semibold text-primary-foreground">
                  {unread}
                </span>
              )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[340px] border border-slate-700/80 bg-slate-900 p-0 text-slate-50 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50">
            <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 text-slate-100">
              <span className="text-sm font-semibold text-slate-50">Notifications</span>
              {unread > 0 && <span className="text-xs text-slate-300">{unread} new</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700/80" />
            <div className="max-h-80 overflow-y-auto p-1">
              {recentNotifications.map((notification) => (
                <DropdownMenuItem key={notification.id} asChild className="cursor-pointer rounded-lg p-0 text-slate-100 focus:bg-slate-800/80">
                  <Link href={`/tasks/${notification.taskId}`} className="flex items-start gap-3 px-3 py-2">
                    <div className="mt-0.5 size-2.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-50">{notification.title}</p>
                      <p className="line-clamp-2 text-xs text-slate-300">{notification.message}</p>
                      <span className="mt-1 block text-[11px] text-slate-400">{formatDistanceToNow(parseISO(notification.at), { addSuffix: true })}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className="bg-slate-700/80" />
            <DropdownMenuItem asChild className="justify-center text-sm font-medium text-sky-300 focus:text-sky-200">
              <Link href="/notifications">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none ring-ring focus-visible:ring-2" aria-label="Account menu">
            <Avatar className="size-11">
              <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-semibold">{currentUser.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{currentUser.role}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings" />}>Profile &amp; Settings</DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/my-tasks" />}>My Tasks</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
