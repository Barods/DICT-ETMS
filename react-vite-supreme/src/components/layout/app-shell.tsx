"use client"

import { useState, type ReactNode } from "react"
import { usePathname } from "@/lib/router"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useStore } from "@/lib/store"

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { apiError, clearApiError } = useStore()

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-[300px] shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-[300px]">
          <Sidebar />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar dashboard={pathname === "/"} onMenuClick={() => setMobileOpen(true)} />
        {apiError && <div role="alert" className="flex items-center justify-between gap-4 border-b border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive sm:px-6 lg:px-10">
          <span>Database request failed: {apiError}</span>
          <button type="button" className="shrink-0 underline underline-offset-4" onClick={clearApiError}>Dismiss</button>
        </div>}
        <main className="flex-1 px-4 pb-10 pt-4 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  )
}
