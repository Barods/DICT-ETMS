"use client"

import { Link, usePathname } from "@/lib/router"
import { CalendarDays, ClipboardList, LayoutGrid, LogOut, PlusCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { signOut } from "@/components/auth/auth-page"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/tasks/new", label: "Create Task", icon: PlusCircle },
  { href: "/tasks", label: "Task Monitoring", icon: ClipboardList },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Main navigation"
      className="flex h-full flex-col bg-[#2463e8] px-5 py-6 text-white"
    >
      <Link href="/" onClick={onNavigate} className="flex h-[96px] items-center justify-center overflow-hidden rounded-[16px] bg-white px-4 shadow-sm">
        <img src="/images/etms-logo.png" alt="eTMS logo" className="h-auto w-[72%]" />
      </Link>

      <ul className="mt-10 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname === item.href || (item.href !== "/tasks" && pathname.startsWith(`${item.href}/`)) || (item.href === "/tasks" && pathname.startsWith("/tasks/") && pathname !== "/tasks/new")
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-4 rounded-[22px] px-4 py-3.5 text-[17px] font-medium transition-colors",
                  active
                    ? "bg-white text-[#1559df] shadow-sm"
                    : "text-white/90 hover:bg-white/10 hover:text-white",
                )}
              >
                <item.icon className="size-6 shrink-0" aria-hidden />
                <span className="flex-1">{item.label}</span>
              </Link>
            </li>
          )
        })}
        <li>
          <Link
            href="/calendar"
            onClick={onNavigate}
            aria-current={pathname === "/calendar" ? "page" : undefined}
            className={cn(
              "flex items-center gap-4 rounded-[22px] px-4 py-3.5 text-[17px] font-medium transition-colors",
              pathname === "/calendar"
                ? "bg-white text-[#1559df] shadow-sm"
                : "text-white/90 hover:bg-white/10 hover:text-white",
            )}
          >
            <CalendarDays className="size-6 shrink-0" aria-hidden />
            <span className="flex-1">Calendar</span>
          </Link>
        </li>
      </ul>

      <div className="flex flex-col gap-2">
        <Link href="/settings" onClick={onNavigate} className="flex items-center gap-4 rounded-[22px] px-4 py-3.5 text-[17px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"><Settings className="size-6" aria-hidden />Settings</Link>
        <button type="button" onClick={signOut} className="flex items-center gap-4 rounded-[22px] px-4 py-3.5 text-left text-[17px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"><LogOut className="size-6" aria-hidden />Logout</button>
      </div>
    </nav>
  )
}
