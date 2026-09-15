"use client"

import { Link } from "@/lib/router"
import { useTheme } from "next-themes"
import { Bell, Menu, Moon, Sun } from "lucide-react"
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
          className="size-11 rounded-xl bg-card"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="size-5 dark:hidden" />
          <Moon className="hidden size-5 dark:block" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="relative size-11 rounded-xl bg-card"
          nativeButton={false}
          render={<Link href="/notifications" aria-label={`Notifications, ${unread} unread`} />}
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>

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
